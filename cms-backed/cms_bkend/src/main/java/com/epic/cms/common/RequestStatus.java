package com.epic.cms.common;

public enum RequestStatus {
    PENDING("PENDING", "Request is pending approval"),
    APPROVED("APPROVED", "Request has been approved"),
    REJECTED("REJECTED", "Request has been rejected");

    private final String code;
    private final String description;

    RequestStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static RequestStatus fromCode(String code) {
        for (RequestStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown request status: " + code);
    }
}
