package com.epic.cms.mapper.rowmapper;

import com.epic.cms.entity.User;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class UserRowMapper implements RowMapper<User> {

    @Override
    public User mapRow(ResultSet rs, int rowNum) throws SQLException {

        User user = User.builder()
                .username(rs.getString("username"))
                .password(rs.getString("password"))
                .status(rs.getString("status"))
                .userRole(rs.getString("user_role"))
                .createTime(rs.getTimestamp("create_time").toLocalDateTime())
                .build();
                                                                
        return user;
    }
}
