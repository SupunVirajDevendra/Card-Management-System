package com.epic.cms.service.card;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Service
public class CardEncryptionService {

    private static final Logger logger = LoggerFactory.getLogger(CardEncryptionService.class);

    @Value("${cms.security.encryption.enabled:true}")
    private boolean encryptionEnabled;

    @Value("${cms.security.encryption.key}")
    private String secretKey;

    @Value("${cms.security.encryption.algorithm:AES}")
    private String algorithm;

    @Value("${cms.security.encryption.transformation:AES/ECB/PKCS5Padding}")
    private String transformation;

    public String encrypt(String plainText) {
        try {
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(), algorithm);
            Cipher cipher = Cipher.getInstance(transformation);
            cipher.init(Cipher.ENCRYPT_MODE, keySpec);
            byte[] encryptedBytes = cipher.doFinal(plainText.getBytes());
            return Base64.getEncoder().encodeToString(encryptedBytes);
        } catch (Exception e) {
            logger.error("Error encrypting card number", e);
            throw new RuntimeException("Encryption failed", e);
        }
    }

    public String decrypt(String encryptedText) {
        try {
            logger.debug("Attempting to decrypt with algorithm: {}, transformation: {}", algorithm, transformation);
            SecretKeySpec keySpec = new SecretKeySpec(secretKey.getBytes(), algorithm);
            Cipher cipher = Cipher.getInstance(transformation);
            
            if (transformation.contains("/GCM/")) {
                logger.warn("GCM transformation detected but no GCMParameterSpec provided. Falling back to default init.");
            }
            
            cipher.init(Cipher.DECRYPT_MODE, keySpec);
            byte[] decodedBytes = Base64.getDecoder().decode(encryptedText);
            byte[] decryptedBytes = cipher.doFinal(decodedBytes);
            return new String(decryptedBytes);
        } catch (Exception e) {
            logger.error("Error decrypting card number: {}. Error: {}", encryptedText, e.getMessage());
            return encryptedText;
        }
    }
}
