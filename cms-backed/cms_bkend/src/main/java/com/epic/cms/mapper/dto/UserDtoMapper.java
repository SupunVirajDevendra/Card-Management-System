package com.epic.cms.mapper.dto;

import com.epic.cms.dto.auth.UserDto;
import com.epic.cms.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class UserDtoMapper {

    public UserDto toDto(User user) {
        if (user == null) {
            return null;
        }
        
        UserDto dto = new UserDto();
        dto.setUsername(user.getUsername());
        dto.setStatus(user.getStatus());
        dto.setUserRole(user.getUserRole());
        dto.setCreateTime(user.getCreateTime());
        
        return dto;
    }
    
    public List<UserDto> toDtoList(List<User> users) {
        return users.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
