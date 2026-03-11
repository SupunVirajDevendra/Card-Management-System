package com.epic.cms.controller.card;

import com.epic.cms.dto.card.CardResponseDto;
import com.epic.cms.dto.card.CreateCardDto;
import com.epic.cms.dto.card.UpdateCardDto;
import com.epic.cms.dto.common.ApiResult;
import com.epic.cms.dto.common.PageResponse;
import com.epic.cms.service.card.CardControllerService;
import com.epic.cms.service.card.EncryptedRequestHandlerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/api/cards")
@Tag(name = "Card Management", description = "APIs for managing credit cards")
@Validated
public class CardController {

    private static final Logger logger = LoggerFactory.getLogger(CardController.class);

    private final CardControllerService cardControllerService;
    private final EncryptedRequestHandlerService encryptedRequestHandlerService;
    private final Validator validator;

    public CardController(
            CardControllerService cardControllerService,
            EncryptedRequestHandlerService encryptedRequestHandlerService,
            Validator validator) {
        this.cardControllerService = cardControllerService;
        this.encryptedRequestHandlerService = encryptedRequestHandlerService;
        this.validator = validator;
    }

    @GetMapping
    @Operation(summary = "Get all cards", description = "Retrieve a list of all credit cards")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved list of cards"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<ApiResult<List<CardResponseDto>>> getAll() {
        logger.info("GET /api/cards - Retrieving all cards");
        List<CardResponseDto> cards = cardControllerService.getAllCards();
        return ResponseEntity.ok(ApiResult.success(cards));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get all cards with pagination", description = "Retrieve a paginated list of credit cards")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved paginated list of cards")
    })
    public ResponseEntity<ApiResult<PageResponse<CardResponseDto>>> getAllPaginated(
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        logger.info("GET /api/cards/paginated - Retrieving cards with page={}, size={}", page, size);
        PageResponse<CardResponseDto> response = cardControllerService.getAllCards(page, size);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @GetMapping("/{cardIdentifier}")
    @Operation(summary = "Get card by identifier", description = "Retrieve a card by plain number, masked number, or mask ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved card"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<ApiResult<CardResponseDto>> getByIdentifier(
            @Parameter(description = "Card identifier (plain number, masked number, or mask ID)") 
            @PathVariable String cardIdentifier) {
        logger.info("GET /api/cards/{} - Retrieving card by identifier", cardIdentifier);
        CardResponseDto response = cardControllerService.getCardByIdentifier(cardIdentifier);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @PutMapping("/{cardIdentifier}")
    @Operation(summary = "Update card", description = "Update card details by identifier")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully updated card"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Card not found")
    })
    public ResponseEntity<ApiResult<Void>> update(
            @Parameter(description = "Card identifier (plain number, masked number, or mask ID)") 
            @PathVariable String cardIdentifier, 
            @RequestBody String rawBody) {
        logger.info("PUT /api/cards/{} - Updating card", cardIdentifier);
        
        boolean encryptionEnabled = encryptedRequestHandlerService.isEncryptionEnabled();
        UpdateCardDto dto = encryptedRequestHandlerService.parseRequest(rawBody, UpdateCardDto.class, encryptionEnabled);
        
        validateDto(dto);
        
        cardControllerService.updateCard(cardIdentifier, dto);
        return ResponseEntity.ok(ApiResult.success("Card updated successfully", null));
    }

    @PostMapping
    @Operation(summary = "Create new card", description = "Create a new credit card")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Successfully created card"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "Card already exists")
    })
    public ResponseEntity<ApiResult<Void>> create(@RequestBody String rawBody) {
        logger.info("POST /api/cards - Creating new card");
        
        boolean encryptionEnabled = encryptedRequestHandlerService.isEncryptionEnabled();
        CreateCardDto dto = encryptedRequestHandlerService.parseRequest(rawBody, CreateCardDto.class, encryptionEnabled);
        
        validateDto(dto);
        
        cardControllerService.createCard(dto);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResult.success("Card created successfully", null));
    }

    private <T> void validateDto(T dto) {
        Set<ConstraintViolation<T>> violations = validator.validate(dto);
        if (!violations.isEmpty()) {
            String errors = violations.stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining(", "));
            throw new IllegalArgumentException(errors);
        }
    }
}
