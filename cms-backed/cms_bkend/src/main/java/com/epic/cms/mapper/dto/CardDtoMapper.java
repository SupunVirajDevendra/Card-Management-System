package com.epic.cms.mapper.dto;

import com.epic.cms.dto.card.CardResponseDto;
import com.epic.cms.entity.Card;
import com.epic.cms.util.card.CardNumberUtils;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class CardDtoMapper {

    public CardResponseDto toDto(Card card) {
        if (card == null) {
            return null;
        }
        
        CardResponseDto dto = new CardResponseDto();
        String plainCardNumber = card.getCardNumber();
        
        String maskedNumber = CardNumberUtils.maskCardNumber(plainCardNumber);
        
        dto.setCardNumber(maskedNumber); 
        dto.setMaskId(CardNumberUtils.generateMaskId(plainCardNumber));
        dto.setExpiryDate(card.getExpiryDate());
        dto.setStatusCode(card.getStatusCode());
        dto.setCreditLimit(card.getCreditLimit());
        dto.setCashLimit(card.getCashLimit());
        dto.setAvailableCreditLimit(card.getAvailableCreditLimit());
        dto.setAvailableCashLimit(card.getAvailableCashLimit());
        dto.setLastUpdateTime(card.getLastUpdateTime());
        dto.setLastUpdateUser(card.getLastUpdateUser());
        
        return dto;
    }
    
    public List<CardResponseDto> toDtoList(List<Card> cards) {
        return cards.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }
}
