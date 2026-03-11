package com.epic.cms.repository.request;

import com.epic.cms.mapper.rowmapper.CardRequestTypeRowMapper;
import com.epic.cms.entity.CardRequestType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class CardRequestTypeRepository {

    private final JdbcTemplate jdbcTemplate;
    private final CardRequestTypeRowMapper rowMapper;

    public CardRequestTypeRepository(JdbcTemplate jdbcTemplate, CardRequestTypeRowMapper rowMapper) {
        this.jdbcTemplate = jdbcTemplate;
        this.rowMapper = rowMapper;
    }

    public List<CardRequestType> findAll() {
        String sql = "SELECT code, description FROM card_request_type";
        return jdbcTemplate.query(sql, rowMapper);
    }

    public Optional<CardRequestType> findByCode(String code) {
        String sql = "SELECT code, description FROM card_request_type WHERE code = ?";
        List<CardRequestType> results = jdbcTemplate.query(sql, rowMapper, code);
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
}
