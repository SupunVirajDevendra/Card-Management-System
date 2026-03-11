package com.epic.cms.mapper.rowmapper;

import com.epic.cms.entity.Status;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import java.sql.ResultSet;
import java.sql.SQLException;

@Component
public class StatusRowMapper implements RowMapper<Status> {

    @Override
    public Status mapRow(ResultSet rs, int rowNum) throws SQLException {
        Status status = new Status();
        status.setStatusCode(rs.getString("status_code"));
        status.setDescription(rs.getString("description"));
        return status;
    }
}
