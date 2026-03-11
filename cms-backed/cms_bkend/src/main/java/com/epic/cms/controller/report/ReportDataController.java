package com.epic.cms.controller.report;

import com.epic.cms.dto.report.ReportFilterDto;
import com.epic.cms.entity.Card;
import com.epic.cms.entity.CardRequest;
import com.epic.cms.service.card.CardEncryptionService;
import com.epic.cms.util.card.CardNumberUtils;
import com.epic.cms.repository.card.CardRepository;
import com.epic.cms.repository.request.CardRequestRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports/data")
@Tag(name = "Report Data", description = "Raw data APIs for frontend report generation")
@Validated
public class ReportDataController {

    private final CardRepository cardRepository;
    private final CardRequestRepository cardRequestRepository;
    private final CardEncryptionService encryptionService;

    public ReportDataController(CardRepository cardRepository, 
                              CardRequestRepository cardRequestRepository, 
                              CardEncryptionService encryptionService) {
        this.cardRepository = cardRepository;
        this.cardRequestRepository = cardRequestRepository;
        this.encryptionService = encryptionService;
    }

    @GetMapping("/cards")
    @Operation(summary = "Get card data for frontend report generation")
    public ResponseEntity<List<Card>> getCardData(
            @Parameter(description = "Start date filter (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date filter (yyyy-MM-dd)") @RequestParam(required = false) String endDate,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status) {
        
        ReportFilterDto filter = new ReportFilterDto();
        
        if (startDate != null) {
            filter.setStartDate(LocalDate.parse(startDate));
        }
        if (endDate != null) {
            filter.setEndDate(LocalDate.parse(endDate));
        }
        filter.setStatus(status);
        
        List<Card> cards = cardRepository.findAll();
        
        for (Card card : cards) {
            try {
                String decrypted = encryptionService.decrypt(card.getCardNumber());
                String masked = CardNumberUtils.maskCardNumber(decrypted);
                card.setCardNumber(masked);
            } catch (Exception e) {
                // Keep original if decryption fails
            }
        }
        
        List<Card> filtered = cards.stream()
                .filter(card -> filter.getStartDate() == null || 
                        card.getLastUpdateTime().toLocalDate().isAfter(filter.getStartDate().minusDays(1)))
                .filter(card -> filter.getEndDate() == null || 
                        card.getLastUpdateTime().toLocalDate().isBefore(filter.getEndDate().plusDays(1)))
                .filter(card -> filter.getStatus() == null || 
                        card.getStatusCode().equals(filter.getStatus()))
                .toList();
        
        return ResponseEntity.ok(filtered);
    }

    @GetMapping("/requests")
    @Operation(summary = "Get card request data for frontend report generation")
    public ResponseEntity<List<CardRequest>> getCardRequestData(
            @Parameter(description = "Start date filter (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date filter (yyyy-MM-dd)") @RequestParam(required = false) String endDate,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status) {
        
        ReportFilterDto filter = new ReportFilterDto();
        
        if (startDate != null) {
            filter.setStartDate(LocalDate.parse(startDate));
        }
        if (endDate != null) {
            filter.setEndDate(LocalDate.parse(endDate));
        }
        filter.setStatus(status);
        
        List<CardRequest> requests = cardRequestRepository.findAll();
        
        for (CardRequest request : requests) {
            try {
                String decrypted = encryptionService.decrypt(request.getCardNumber());
                String masked = CardNumberUtils.maskCardNumber(decrypted);
                request.setCardNumber(masked);
            } catch (Exception e) {
                // Keep original if decryption fails
            }
        }
        
        List<CardRequest> filtered = requests.stream()
                .filter(request -> filter.getStartDate() == null || 
                        request.getCreateTime().toLocalDate().isAfter(filter.getStartDate().minusDays(1)))
                .filter(request -> filter.getEndDate() == null || 
                        request.getCreateTime().toLocalDate().isBefore(filter.getEndDate().plusDays(1)))
                .filter(request -> filter.getStatus() == null || 
                        request.getStatusCode().equals(filter.getStatus()))
                .toList();
        
        return ResponseEntity.ok(filtered);
    }
}
