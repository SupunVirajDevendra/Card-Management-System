package com.epic.cms.service.card;

import com.epic.cms.dto.card.EncryptedRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EncryptedRequestHandlerService {

    private static final Logger logger = LoggerFactory.getLogger(EncryptedRequestHandlerService.class);
    private static final String PAYLOAD_KEY = "\"payload\"";

    private final PayloadDecryptionService decryptionService;
    private final ObjectMapper objectMapper;

    public EncryptedRequestHandlerService(
            PayloadDecryptionService decryptionService,
            ObjectMapper objectMapper) {
        this.decryptionService = decryptionService;
        this.objectMapper = objectMapper;
    }

    public <T> T parseRequest(String rawBody, Class<T> dtoClass, boolean encryptionEnabled) {
        if (encryptionEnabled) {
            return parseEncryptedRequest(rawBody, dtoClass);
        }
        return parsePlainRequest(rawBody, dtoClass);
    }

    private <T> T parseEncryptedRequest(String rawBody, Class<T> dtoClass) {
        if (rawBody == null || rawBody.isEmpty()) {
            throw new IllegalArgumentException("Payload is required when encryption is enabled");
        }

        if (!rawBody.contains(PAYLOAD_KEY)) {
            throw new IllegalArgumentException("Invalid request format: expected {\"payload\": \"...\"} when encryption is enabled");
        }

        try {
            EncryptedRequest encryptedRequest = objectMapper.readValue(rawBody, EncryptedRequest.class);

            if (encryptedRequest.getPayload() == null || encryptedRequest.getPayload().isEmpty()) {
                throw new IllegalArgumentException("Payload is required when encryption is enabled");
            }

            return decryptionService.decryptToObject(encryptedRequest.getPayload(), dtoClass);
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Error decrypting request: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Invalid request: " + e.getMessage());
        }
    }

    private <T> T parsePlainRequest(String rawBody, Class<T> dtoClass) {
        if (rawBody == null || rawBody.isEmpty()) {
            throw new IllegalArgumentException("Request body is required");
        }

        try {
            return objectMapper.readValue(rawBody, dtoClass);
        } catch (Exception e) {
            logger.error("Error parsing request: {}", e.getMessage(), e);
            throw new IllegalArgumentException("Invalid request format: " + e.getMessage());
        }
    }

    public boolean isEncryptionEnabled() {
        return decryptionService.isEncryptionEnabled();
    }
}
