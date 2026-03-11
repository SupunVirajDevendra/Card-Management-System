package com.epic.cms.service.auth;

import com.epic.cms.common.UserRole;
import com.epic.cms.dto.auth.AuthResponseDto;
import com.epic.cms.dto.auth.RegisterDto;
import com.epic.cms.entity.User;
import com.epic.cms.exception.DuplicateUserException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthServiceImpl.class);
    private static final String DEFAULT_STATUS = "ACT";

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;
    private final UserManagementService userManagementService;

    public AuthServiceImpl(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserDetailsService userDetailsService,
            UserManagementService userManagementService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.userManagementService = logger.isDebugEnabled() ? userManagementService : userManagementService;
    }

    @Override
    public AuthResponseDto login(String username, String password) {
        logger.info("Attempting login for user: {}", username);
        
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwt = jwtService.generateToken(userDetails);
        
        User user = userManagementService.findByUsername(userDetails.getUsername())
                .orElse(null);

        String role = user != null ? user.getUserRole() : UserRole.USER.getCode();
        
        logger.info("User {} logged in successfully with role: {}", username, role);
        
        return new AuthResponseDto(
                jwt,
                userDetails.getUsername(),
                role,
                jwtService.getExpiration()
        );
    }

    @Override
    public void register(RegisterDto registerDto) {
        logger.info("Attempting registration for user: {}", registerDto.getUsername());
        
        if (userManagementService.existsByUsername(registerDto.getUsername())) {
            logger.warn("Registration failed - username already exists: {}", registerDto.getUsername());
            throw new DuplicateUserException("Username already exists: " + registerDto.getUsername());
        }

        String role = UserRole.fromCode(registerDto.getUserRole()).getCode();
        
        User newUser = User.builder()
                .username(registerDto.getUsername())
                .password(registerDto.getPassword())
                .status(DEFAULT_STATUS)
                .userRole(role)
                .createTime(LocalDateTime.now())
                .build();

        userManagementService.createUser(newUser);
        
        logger.info("User registered successfully: {}", registerDto.getUsername());
    }

    @Override
    public void logout(String token) {
        logger.info("Logging out user with token");
        
        Long expiration = jwtService.getExpiration();
        userManagementService.addToBlacklist(token, System.currentTimeMillis() + expiration);
        
        logger.info("User logged out successfully, token blacklisted");
    }
}
