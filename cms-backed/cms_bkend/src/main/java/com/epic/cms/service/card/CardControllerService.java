package com.epic.cms.service.card;

import com.epic.cms.common.CardStatus;
import com.epic.cms.dto.card.CardResponseDto;
import com.epic.cms.dto.card.CreateCardDto;
import com.epic.cms.dto.card.UpdateCardDto;
import com.epic.cms.dto.common.PageResponse;
import com.epic.cms.exception.ResourceNotFoundException;
import com.epic.cms.mapper.dto.CardDtoMapper;
import com.epic.cms.entity.Card;
import com.epic.cms.repository.card.CardRepository;
import com.epic.cms.util.card.CardNumberResolver;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class CardControllerService {

    private static final Logger logger = LoggerFactory.getLogger(CardControllerService.class);
    private static final String SYSTEM_USER = "system";

    private final CardRepository cardRepository;
    private final CardDtoMapper cardDtoMapper;
    private final CardEncryptionService encryptionService;
    private final CardNumberResolver cardNumberResolver;

    public CardControllerService(
            CardRepository cardRepository,
            CardDtoMapper cardDtoMapper,
            CardEncryptionService encryptionService,
            CardNumberResolver cardNumberResolver) {
        this.cardRepository = cardRepository;
        this.cardDtoMapper = cardDtoMapper;
        this.encryptionService = encryptionService;
        this.cardNumberResolver = cardNumberResolver;
    }

    public List<CardResponseDto> getAllCards() {
        logger.debug("Getting all cards");
        List<Card> cards = cardRepository.findAll();
        decryptCardNumbers(cards);
        return cardDtoMapper.toDtoList(cards);
    }

    public PageResponse<CardResponseDto> getAllCards(int page, int size) {
        logger.debug("Getting paginated cards - page: {}, size: {}", page, size);
        
        int offset = page * size;
        List<Card> cards = cardRepository.findAllWithPagination(offset, size);
        decryptCardNumbers(cards);
        long totalElements = cardRepository.countAllCards();
        
        int totalPages = (int) Math.ceil((double) totalElements / size);
        
        return PageResponse.<CardResponseDto>builder()
                .content(cardDtoMapper.toDtoList(cards))
                .pageNumber(page)
                .pageSize(size)
                .totalElements(totalElements)
                .totalPages(totalPages)
                .first(page == 0)
                .last(page >= totalPages - 1)
                .build();
    }

    public CardResponseDto getCardByIdentifier(String cardIdentifier) {
        logger.debug("Getting card by identifier: {}", cardIdentifier);
        
        Card card = cardNumberResolver.resolveCard(cardIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardIdentifier));
        
        return getByCardNumber(card.getCardNumber());
    }

    public CardResponseDto getByCardNumber(String cardNumber) {
        logger.debug("Getting card by card number");
        
        String encryptedCardNumber = encryptionService.encrypt(cardNumber);
        Card card = cardRepository.findByCardNumber(encryptedCardNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardNumber));
        
        card.setCardNumber(encryptionService.decrypt(card.getCardNumber()));
        return cardDtoMapper.toDto(card);
    }

    public void createCard(CreateCardDto dto) {
        logger.info("Creating new card: {}", dto.getCardNumber());
        
        String encryptedCardNumber = encryptionService.encrypt(dto.getCardNumber());
        
        if (cardRepository.findByCardNumber(encryptedCardNumber).isPresent()) {
            throw new IllegalArgumentException("Card with number " + dto.getCardNumber() + " already exists");
        }

        Card card = Card.builder()
                .cardNumber(encryptedCardNumber)
                .expiryDate(java.time.YearMonth.parse(dto.getExpiryDate()).atEndOfMonth())
                .statusCode(CardStatus.INACTIVE.getCode())
                .creditLimit(dto.getCreditLimit())
                .cashLimit(dto.getCashLimit())
                .availableCreditLimit(dto.getCreditLimit())
                .availableCashLimit(dto.getCashLimit())
                .lastUpdateTime(LocalDateTime.now())
                .lastUpdateUser(getCurrentUserUsername())
                .build();

        cardRepository.save(card);
        logger.info("Card created successfully: {}", dto.getCardNumber());
    }

    public void updateCard(String cardIdentifier, UpdateCardDto dto) {
        logger.info("Updating card: {}", cardIdentifier);
        
        Card card = cardNumberResolver.resolveCard(cardIdentifier)
                .orElseThrow(() -> new ResourceNotFoundException("Card not found: " + cardIdentifier));

        String encryptedCardNumber = encryptionService.encrypt(card.getCardNumber());
        
        card.setExpiryDate(java.time.YearMonth.parse(dto.getExpiryDate()).atEndOfMonth());
        card.setCardNumber(encryptedCardNumber);
        card.setCreditLimit(dto.getCreditLimit());
        card.setCashLimit(dto.getCashLimit());
        card.setAvailableCreditLimit(dto.getCreditLimit());
        card.setAvailableCashLimit(dto.getCashLimit());
        card.setLastUpdateTime(LocalDateTime.now());
        card.setLastUpdateUser(getCurrentUserUsername());

        cardRepository.update(card);
        logger.info("Card updated successfully: {}", cardIdentifier);
    }

    private void decryptCardNumbers(List<Card> cards) {
        for (Card card : cards) {
            try {
                card.setCardNumber(encryptionService.decrypt(card.getCardNumber()));
            } catch (Exception e) {
                logger.error("Error decrypting card number: {}", card.getCardNumber(), e);
                throw new IllegalStateException("Data corruption: failed to decrypt card number");
            }
        }
    }

    private String getCurrentUserUsername() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            return authentication.getName();
        }
        return SYSTEM_USER;
    }
}
