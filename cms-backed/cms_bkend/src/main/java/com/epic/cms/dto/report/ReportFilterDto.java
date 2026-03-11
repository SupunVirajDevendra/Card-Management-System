package com.epic.cms.dto.report;

import lombok.Data;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

@Data
public class ReportFilterDto {
    private LocalDate startDate;
    private LocalDate endDate;
    private String status;
    
    @Pattern(regexp = "^(csv|pdf)$", message = "Format must be either 'csv' or 'pdf'")
    private String format;
}
