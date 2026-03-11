package com.epic.cms.service.auth;

public interface TokenBlacklistService {
    void addToBlacklist(String token, long expirationTime);
    boolean isBlacklisted(String token);
    void cleanup();
}
