package com.epic.cms.service.card;

import com.epic.cms.dto.card.CardResponseDto;
import com.epic.cms.dto.card.CreateCardDto;
import com.epic.cms.dto.card.UpdateCardDto;
import com.epic.cms.dto.common.PageResponse;

import java.util.List;

public interface CardService {

    List<CardResponseDto> getAllCards();

    PageResponse<CardResponseDto> getAllCards(int page, int size);

    CardResponseDto getByCardNumber(String cardNumber);

    void createCard(CreateCardDto dto);

    void updateCard(String cardNumber, UpdateCardDto dto);
}

