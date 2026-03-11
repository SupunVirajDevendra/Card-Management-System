package com.epic.cms.service.auth;

import com.epic.cms.exception.InvalidTokenException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtServiceImpl implements JwtService {

    private static final Logger logger = LoggerFactory.getLogger(JwtServiceImpl.class);
    private static final int MIN_SECRET_LENGTH = 32;

    private final String secret;
    private final Long expiration;
    private final TokenBlacklistService blacklistService;
    private final SecretKey signingKey;

    public JwtServiceImpl(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration:86400000}") Long expiration,
            TokenBlacklistService blacklistService) {
        
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("JWT secret must be configured");
        }
        if (secret.length() < MIN_SECRET_LENGTH) {
            throw new IllegalStateException("JWT secret must be at least " + MIN_SECRET_LENGTH + " characters");
        }
        
        this.secret = secret;
        this.expiration = expiration;
        this.blacklistService = blacklistService;
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes());
        
        logger.info("JwtServiceImpl initialized with expiration: {}ms", expiration);
    }

    @Override
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @Override
    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    @Override
    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    @Override
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(signingKey, io.jsonwebtoken.SignatureAlgorithm.HS256)
                .compact();
    }

    @Override
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        
        if (blacklistService.isBlacklisted(token)) {
            logger.warn("Token is blacklisted: {}", username);
            return false;
        }
        
        return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    @Override
    public Long getExpiration() {
        return expiration;
    }

    public void validateTokenForThrow(String token, UserDetails userDetails) {
        if (!validateToken(token, userDetails)) {
            throw new InvalidTokenException("Invalid or expired token");
        }
    }
}
