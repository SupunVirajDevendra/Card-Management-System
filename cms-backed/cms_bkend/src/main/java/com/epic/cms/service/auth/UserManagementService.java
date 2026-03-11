package com.epic.cms.service.auth;

import com.epic.cms.entity.User;

import java.util.Optional;

public interface UserManagementService {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    User createUser(User user);
    void addToBlacklist(String token, long expiryTime);
}
