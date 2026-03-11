package com.epic.cms.mapper.rowmapper;

import com.epic.cms.entity.CardRequestType;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class CardRequestTypeRowMapper implements RowMapper<CardRequestType> {

    @Override
    public CardRequestType mapRow(ResultSet rs, int rowNum) throws SQLException {
        CardRequestType type = new CardRequestType();
        type.setCode(rs.getString("code"));
        type.setDescription(rs.getString("description"));
        return type;
    }
}
