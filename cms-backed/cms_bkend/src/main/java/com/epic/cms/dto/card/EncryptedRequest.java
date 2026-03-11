package com.epic.cms.dto.card;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Encrypted request wrapper for frontend payload encryption")
public class EncryptedRequest {
    
    @Schema(description = "Base64 encrypted payload containing [IV + Ciphertext]", required = true)
    @NotBlank(message = "Payload is required")
    private String payload;
    
    public EncryptedRequest() {}
    
    public EncryptedRequest(String payload) {
        this.payload = payload;
    }
    
    public String getPayload() {
        return payload;
    }
    
    public void setPayload(String payload) {
        this.payload = payload;
    }
}
