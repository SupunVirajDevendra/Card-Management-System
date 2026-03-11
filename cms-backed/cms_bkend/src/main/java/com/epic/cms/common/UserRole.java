package com.epic.cms.common;

public enum UserRole {
    USER("USER", "Regular user"),
    ADMIN("ADMIN", "Administrator");

    private final String code;
    private final String description;

    UserRole(String code, String description) {
        this.code = code;
        this.description = description;
    }

    public String getCode() {
        return code;
    }

    public String getDescription() {
        return description;
    }

    public static UserRole fromCode(String code) {
        if (code == null) {
            return USER;
        }
        for (UserRole role : values()) {
            if (role.code.equalsIgnoreCase(code)) {
                return role;
            }
        }
        return USER;
    }

    public static boolean isValid(String code) {
        if (code == null) {
            return false;
        }
        for (UserRole role : values()) {
            if (role.code.equalsIgnoreCase(code)) {
                return true;
            }
        }
        return false;
    }
}
