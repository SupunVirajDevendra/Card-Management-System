package com.epic.cms.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public class MessageResponseDto {

    @JsonProperty("message")
    private String message;

    public MessageResponseDto() {
    }

    public MessageResponseDto(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
