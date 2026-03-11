package com.epic.cms.service.auth;

import com.epic.cms.dto.auth.AuthResponseDto;
import com.epic.cms.dto.auth.RegisterDto;

public interface AuthService {
    AuthResponseDto login(String username, String password);
    void register(RegisterDto registerDto);
    void logout(String token);
}
