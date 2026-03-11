package com.epic.cms.common;

public enum CardStatus {
    INACTIVE("IACT", "Inactive - Initial state"),
    ACTIVE("CACT", "Active - Card is operational"),
    DEACTIVATED("DACT", "Deactivated - Card is closed");

    private final String code;
    private final String description;

    CardStatus(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static CardStatus fromCode(String code) {
        for (CardStatus status : values()) {
            if (status.code.equals(code)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown card status code: " + code);
    }
}
