package com.epic.cms.dto.card;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class UpdateCardDto {

    @NotBlank(message = "Expiry date is required")
    @Pattern(regexp = "^\\d{4}-(0[1-9]|1[0-2])$", message = "Expiry date must be in format YYYY-MM")
    private String expiryDate;

    @NotNull
    private BigDecimal creditLimit;

    @NotNull
    private BigDecimal cashLimit;
}
