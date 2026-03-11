package com.epic.cms.exception;

import com.epic.cms.dto.common.ApiResult;
import com.epic.cms.dto.common.ErrorResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleNotFound(ResourceNotFoundException ex) {
        logger.warn("Resource not found: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto("NOT_FOUND", ex.getMessage());
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResult.error(ex.getMessage(), error));
    }

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleBusiness(BusinessException ex) {
        logger.warn("Business error: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto("BUSINESS_ERROR", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResult.error(ex.getMessage(), error));
    }

    @ExceptionHandler(DuplicateUserException.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleDuplicateUser(DuplicateUserException ex) {
        logger.warn("Duplicate user: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto("CONFLICT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResult.error(ex.getMessage(), error));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleIllegalArgument(IllegalArgumentException ex) {
        logger.warn("Invalid argument: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto("INVALID_ARGUMENT", ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResult.error(ex.getMessage(), error));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        logger.warn("Validation error: {}", ex.getMessage());
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .reduce((a, b) -> a + "; " + b)
                .orElse("Validation failed");
        
        ErrorResponseDto error = new ErrorResponseDto("VALIDATION_ERROR", errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(ApiResult.error(errors, error));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleBadCredentials(BadCredentialsException ex) {
        logger.warn("Bad credentials: {}", ex.getMessage());
        ErrorResponseDto error = new ErrorResponseDto("UNAUTHORIZED", "Invalid username or password");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(ApiResult.error("Invalid credentials", error));
    }

    @ExceptionHandler(DataAccessException.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleDataAccessException(DataAccessException ex) {
        logger.error("Database error: {}", ex.getMessage(), ex);
        ErrorResponseDto error = new ErrorResponseDto("DATABASE_ERROR", "Database operation failed");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResult.error("Database operation failed", error));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResult<ErrorResponseDto>> handleGeneric(Exception ex) {
        logger.error("Unexpected error: {}", ex.getMessage(), ex);
        ErrorResponseDto error = new ErrorResponseDto("INTERNAL_ERROR", "An unexpected error occurred");
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResult.error("An unexpected error occurred", error));
    }
}
