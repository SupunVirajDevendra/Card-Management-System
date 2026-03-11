package com.epic.cms.repository.status;

import com.epic.cms.mapper.rowmapper.StatusRowMapper;
import com.epic.cms.entity.Status;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class StatusRepository {

    private final JdbcTemplate jdbcTemplate;
    private final StatusRowMapper rowMapper;

    public StatusRepository(JdbcTemplate jdbcTemplate, StatusRowMapper rowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
    }

    public List<Status> findAll() {
        String sql = "SELECT status_code, description FROM card_status";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public Optional<Status> findByCode(String statusCode) {
        String sql = "SELECT status_code, description FROM card_status WHERE status_code = ?";
        List<Status> results = jdbcTemplate.query(sql, rowMapper, statusCode);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
}
