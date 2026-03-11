package com.epic.cms.controller.request;

import com.epic.cms.dto.common.ActionDto;
import com.epic.cms.dto.common.ApiResult;
import com.epic.cms.dto.common.PageResponse;
import com.epic.cms.dto.request.CardRequestResponseDto;
import com.epic.cms.dto.request.CreateCardRequestDto;
import com.epic.cms.service.card.EncryptedRequestHandlerService;
import com.epic.cms.service.request.CardRequestService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.ConstraintViolation;
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

@RestController
@RequestMapping("/api/card-requests")
@Tag(name = "Card Request Management", description = "APIs for managing card requests")
@Validated
public class CardRequestController {

    private static final Logger logger = LoggerFactory.getLogger(CardRequestController.class);

    private final CardRequestService cardRequestService;
    private final EncryptedRequestHandlerService encryptedRequestHandlerService;
    private final Validator validator;

    public CardRequestController(
            CardRequestService cardRequestService,
            EncryptedRequestHandlerService encryptedRequestHandlerService,
            Validator validator) {
        this.cardRequestService = cardRequestService;
        this.encryptedRequestHandlerService = encryptedRequestHandlerService;
        this.validator = validator;
    }

    @PostMapping
    @Operation(summary = "Create card request", description = "Create a new card request (activation or closure)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Successfully created card request"),
        @ApiResponse(responseCode = "400", description = "Invalid input data or card not found"),
        @ApiResponse(responseCode = "409", description = "Duplicate request exists")
    })
    public ResponseEntity<ApiResult<Void>> createRequest(@RequestBody String rawBody) {
        logger.info("POST /api/card-requests - Creating card request");
        
        boolean encryptionEnabled = encryptedRequestHandlerService.isEncryptionEnabled();
        CreateCardRequestDto dto = encryptedRequestHandlerService.parseRequest(
                rawBody, CreateCardRequestDto.class, encryptionEnabled);
        
        validateDto(dto);
        
        cardRequestService.createRequest(dto);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResult.success("Card request created successfully", null));
    }

    @PutMapping("/{id}/process")
    @Operation(summary = "Process card request", description = "Approve or reject a card request")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully processed request"),
        @ApiResponse(responseCode = "400", description = "Invalid action or request not found"),
        @ApiResponse(responseCode = "404", description = "Request not found")
    })
    public ResponseEntity<ApiResult<Void>> processRequest(
            @Parameter(description = "Request ID") 
            @PathVariable Long id, 
            @RequestBody String rawBody) {
        logger.info("PUT /api/card-requests/{}/process - Processing request", id);
        
        boolean encryptionEnabled = encryptedRequestHandlerService.isEncryptionEnabled();
        ActionDto action = encryptedRequestHandlerService.parseRequest(
                rawBody, ActionDto.class, encryptionEnabled);
        
        validateDto(action);
        
        cardRequestService.processRequest(id, action);
        
        return ResponseEntity.ok(ApiResult.success("Request processed successfully", null));
    }

    @GetMapping
    @Operation(summary = "Get all card requests", description = "Retrieve a list of all card requests")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved list of requests")
    })
    public ResponseEntity<ApiResult<List<CardRequestResponseDto>>> getAllRequests() {
        logger.info("GET /api/card-requests - Retrieving all card requests");
        List<CardRequestResponseDto> requests = cardRequestService.getAllRequests();
        return ResponseEntity.ok(ApiResult.success(requests));
    }

    @GetMapping("/paginated")
    @Operation(summary = "Get all card requests with pagination", description = "Retrieve a paginated list of card requests")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved paginated list of requests")
    })
    public ResponseEntity<ApiResult<PageResponse<CardRequestResponseDto>>> getAllRequestsPaginated(
            @Parameter(description = "Page number (0-based)") 
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @Parameter(description = "Page size") 
            @RequestParam(defaultValue = "10") @Min(1) @Max(100) int size) {
        logger.info("GET /api/card-requests/paginated - Retrieving requests with page={}, size={}", page, size);
        PageResponse<CardRequestResponseDto> response = cardRequestService.getAllRequests(page, size);
        return ResponseEntity.ok(ApiResult.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get card request by ID", description = "Retrieve a specific card request by its ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved request"),
        @ApiResponse(responseCode = "404", description = "Request not found")
    })
    public ResponseEntity<ApiResult<CardRequestResponseDto>> getRequestById(
            @Parameter(description = "Request ID") 
            @PathVariable Long id) {
        logger.info("GET /api/card-requests/{} - Retrieving request by ID", id);
        CardRequestResponseDto request = cardRequestService.getRequestById(id);
        return ResponseEntity.ok(ApiResult.success(request));
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
