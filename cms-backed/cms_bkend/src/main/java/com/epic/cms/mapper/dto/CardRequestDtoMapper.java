package com.epic.cms.mapper.dto;

import com.epic.cms.dto.request.CardRequestResponseDto;
import com.epic.cms.entity.CardRequest;
import com.epic.cms.util.card.CardNumberUtils;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CardRequestDtoMapper {

    public CardRequestResponseDto toDto(CardRequest cardRequest) {
        if (cardRequest == null) {
            return null;
        }
        
        CardRequestResponseDto dto = new CardRequestResponseDto();
        dto.setRequestId(cardRequest.getRequestId());
        
        String plainCardNumber = cardRequest.getCardNumber();
        String maskedNumber = CardNumberUtils.maskCardNumber(plainCardNumber);

        dto.setCardNumber(maskedNumber); 
        dto.setMaskId(CardNumberUtils.generateMaskId(plainCardNumber));
        dto.setRequestReasonCode(cardRequest.getRequestReasonCode());
        dto.setStatusCode(cardRequest.getStatusCode());
        dto.setCreateTime(cardRequest.getCreateTime());
        dto.setRequestUser(cardRequest.getRequestUser());
        dto.setApprovedUser(cardRequest.getApprovedUser());
        
        return dto;
    }
    
    public List<CardRequestResponseDto> toDtoList(List<CardRequest> cardRequests) {
        return cardRequests.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
