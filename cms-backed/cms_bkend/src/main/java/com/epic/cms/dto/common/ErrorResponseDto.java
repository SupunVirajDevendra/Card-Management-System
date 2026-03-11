package com.epic.cms.dto.common;

import java.time.LocalDateTime;

public class ErrorResponseDto {

    private String code;
    private String message;
    private LocalDateTime timestamp;

    public ErrorResponseDto(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    public String getCode() { return code; }
    public String getMessage() { return message; }
    public LocalDateTime getTimestamp() { return timestamp; }
}
