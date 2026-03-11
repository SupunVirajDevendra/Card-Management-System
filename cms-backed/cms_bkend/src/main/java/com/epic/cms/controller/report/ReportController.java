package com.epic.cms.controller.report;

import com.epic.cms.dto.report.ReportFilterDto;
import com.epic.cms.service.report.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reports", description = "Report generation APIs")
@Validated
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/cards")
    @Operation(summary = "Generate card report in CSV or PDF format")
    public ResponseEntity<byte[]> generateCardReport(
            @Parameter(description = "Report format: csv or pdf") @RequestParam(defaultValue = "csv") String format,
            @Parameter(description = "Start date filter (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date filter (yyyy-MM-dd)") @RequestParam(required = false) String endDate,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status) {
        
        ReportFilterDto filter = buildFilter(startDate, endDate, status);
        
        ByteArrayOutputStream report;
        String filename;
        MediaType mediaType;
        
        if ("pdf".equalsIgnoreCase(format)) {
            report = reportService.generateCardPDF(filter);
            filename = "cards_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            mediaType = MediaType.APPLICATION_PDF;
        } else {
            report = reportService.generateCardCSV(filter);
            filename = "cards_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            mediaType = MediaType.parseMediaType("text/csv");
        }
        
        return buildResponse(report, filename, mediaType);
    }

    @GetMapping("/requests")
    @Operation(summary = "Generate card request report in CSV or PDF format")
    public ResponseEntity<byte[]> generateCardRequestReport(
            @Parameter(description = "Report format: csv or pdf") @RequestParam(defaultValue = "csv") String format,
            @Parameter(description = "Start date filter (yyyy-MM-dd)") @RequestParam(required = false) String startDate,
            @Parameter(description = "End date filter (yyyy-MM-dd)") @RequestParam(required = false) String endDate,
            @Parameter(description = "Status filter") @RequestParam(required = false) String status) {
        
        ReportFilterDto filter = buildFilter(startDate, endDate, status);
        
        ByteArrayOutputStream report;
        String filename;
        MediaType mediaType;
        
        if ("pdf".equalsIgnoreCase(format)) {
            report = reportService.generateCardRequestPDF(filter);
            filename = "card_requests_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".pdf";
            mediaType = MediaType.APPLICATION_PDF;
        } else {
            report = reportService.generateCardRequestCSV(filter);
            filename = "card_requests_report_" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
            mediaType = MediaType.parseMediaType("text/csv");
        }
        
        return buildResponse(report, filename, mediaType);
    }
    
    private ReportFilterDto buildFilter(String startDate, String endDate, String status) {
        ReportFilterDto filter = new ReportFilterDto();
        
        if (startDate != null) {
            filter.setStartDate(java.time.LocalDate.parse(startDate));
        }
        if (endDate != null) {
            filter.setEndDate(java.time.LocalDate.parse(endDate));
        }
        filter.setStatus(status);
        
        return filter;
    }
    
    private ResponseEntity<byte[]> buildResponse(ByteArrayOutputStream report, String filename, MediaType mediaType) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.setContentDispositionFormData("attachment", filename);
        headers.setContentLength(report.size());
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(report.toByteArray());
    }
}
