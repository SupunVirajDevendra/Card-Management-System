package com.epic.cms.service.request;

import com.epic.cms.dto.common.ActionDto;
import com.epic.cms.dto.common.PageResponse;
import com.epic.cms.dto.request.CardRequestResponseDto;
import com.epic.cms.dto.request.CreateCardRequestDto;

import java.util.List;

public interface CardRequestService {

    void createRequest(CreateCardRequestDto dto);

    void processRequest(Long requestId, ActionDto action);

    List<CardRequestResponseDto> getAllRequests();

    PageResponse<CardRequestResponseDto> getAllRequests(int page, int size);

    CardRequestResponseDto getRequestById(Long requestId);
}
