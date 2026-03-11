package com.epic.cms.common;

public enum RequestReasonCode {
    ACTIVATION("ACTI", "Card activation request"),
    DEACTIVATION("CDCL", "Card deactivation/closure request");

    private final String code;
    private final String description;

    RequestReasonCode(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static RequestReasonCode fromCode(String code) {
        for (RequestReasonCode reason : values()) {
            if (reason.code.equals(code)) {
                return reason;
            }
        }
        throw new IllegalArgumentException("Unknown request reason code: " + code);
    }

    public static boolean isActivation(String code) {
        return ACTIVATION.code.equals(code);
    }

    public static boolean isDeactivation(String code) {
        return DEACTIVATION.code.equals(code);
    }
}
