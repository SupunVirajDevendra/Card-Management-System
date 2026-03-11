package com.epic.cms.dto.auth;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDto {
    private String username;
    private String status;
    private String userRole;
    private LocalDateTime createTime;
}
