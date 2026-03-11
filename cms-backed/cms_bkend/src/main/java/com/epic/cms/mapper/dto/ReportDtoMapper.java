package com.epic.cms.mapper.dto;

import com.epic.cms.entity.Card;
import com.epic.cms.entity.CardRequest;
import com.epic.cms.util.card.CardNumberUtils;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ReportDtoMapper {

    public Card toCardWithMaskedNumber(Card card) {
        if (card == null) {
            return null;
        }
        
        try {
            String decrypted = encryptionService.decrypt(card.getCardNumber());
            String masked = maskCardNumber(decrypted);
            card.setCardNumber(masked);
        } catch (Exception e) {
            // Keep original if decryption fails
        }
        
        return card;
    }
    
    public CardRequest toCardRequestWithMaskedNumber(CardRequest request) {
        if (request == null) {
            return null;
        }
        
        try {
            String decrypted = encryptionService.decrypt(request.getCardNumber());
            String masked = maskCardNumber(decrypted);
            request.setCardNumber(masked);
        } catch (Exception e) {
            // Keep original if decryption fails
        }
        
        return request;
    }
    
    public List<Card> maskCardNumbers(List<Card> cards) {
        return cards.stream()
                .map(this::toCardWithMaskedNumber)
                .collect(Collectors.toList());
    }
    
    public List<CardRequest> maskCardRequestNumbers(List<CardRequest> requests) {
        return requests.stream()
                .map(this::toCardRequestWithMaskedNumber)
                .collect(Collectors.toList());
    }
    
    private String maskCardNumber(String cardNumber) {
        if (cardNumber == null || cardNumber.length() < 10) {
            return cardNumber;
        }
        String first6 = cardNumber.substring(0, 6);
        String last4 = cardNumber.substring(cardNumber.length() - 4);
        String masked = "*".repeat(cardNumber.length() - 10);
        return first6 + masked + last4;
    }
    
    private com.epic.cms.service.card.CardEncryptionService encryptionService;
}
