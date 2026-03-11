package com.epic.cms.service.report;

import com.epic.cms.dto.report.ReportFilterDto;
import com.epic.cms.entity.Card;
import com.epic.cms.entity.CardRequest;
import com.epic.cms.entity.CardRequestType;
import com.epic.cms.entity.Status;
import com.epic.cms.repository.card.CardRepository;
import com.epic.cms.repository.request.CardRequestRepository;
import com.epic.cms.repository.request.CardRequestTypeRepository;
import com.epic.cms.repository.status.StatusRepository;
import com.epic.cms.repository.status.RequestStatusRepository;
import com.epic.cms.service.card.CardEncryptionService;
import com.epic.cms.util.card.CardNumberUtils;
import com.opencsv.CSVWriter;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportServiceImpl implements ReportService {

    private final CardRepository cardRepository;
    private final CardRequestRepository cardRequestRepository;
    private final CardEncryptionService encryptionService;
    private final StatusRepository statusRepository;
    private final RequestStatusRepository requestStatusRepository;
    private final CardRequestTypeRepository cardRequestTypeRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public ReportServiceImpl(CardRepository cardRepository, 
                           CardRequestRepository cardRequestRepository,
                           CardEncryptionService encryptionService,
                           StatusRepository statusRepository,
                           RequestStatusRepository requestStatusRepository,
                           CardRequestTypeRepository cardRequestTypeRepository) {
        this.cardRepository = cardRepository;
        this.cardRequestRepository = cardRequestRepository;
        this.encryptionService = encryptionService;
        this.statusRepository = statusRepository;
        this.requestStatusRepository = requestStatusRepository;
        this.cardRequestTypeRepository = cardRequestTypeRepository;
    }

    @Override
    public ByteArrayOutputStream generateCardCSV(ReportFilterDto filter) {
        List<Card> cards = getFilteredCards(filter);
        return generateCardCSV(cards, filter);
    }

    @Override
    public ByteArrayOutputStream generateCardRequestCSV(ReportFilterDto filter) {
        List<CardRequest> requests = getFilteredCardRequests(filter);
        return generateCardRequestCSV(requests, filter);
    }

    private List<Card> getFilteredCards(ReportFilterDto filter) {
        List<Card> allCards = cardRepository.findAll();
        
        for (Card card : allCards) {
            try {
                String decrypted = encryptionService.decrypt(card.getCardNumber());
                card.setCardNumber(CardNumberUtils.maskCardNumber(decrypted));
            } catch (Exception e) {
            }
        }
        
        return allCards.stream()
                .filter(card -> filter.getStartDate() == null || 
                        card.getLastUpdateTime().toLocalDate().isAfter(filter.getStartDate().minusDays(1)))
                .filter(card -> filter.getEndDate() == null || 
                        card.getLastUpdateTime().toLocalDate().isBefore(filter.getEndDate().plusDays(1)))
                .filter(card -> filter.getStatus() == null || 
                        card.getStatusCode().equals(filter.getStatus()))
                .toList();
    }

    private List<CardRequest> getFilteredCardRequests(ReportFilterDto filter) {
        List<CardRequest> allRequests = cardRequestRepository.findAll();
        
        for (CardRequest request : allRequests) {
            try {
                String decrypted = encryptionService.decrypt(request.getCardNumber());
                request.setCardNumber(CardNumberUtils.maskCardNumber(decrypted));
            } catch (Exception e) {
            }
        }
        
        return allRequests.stream()
                .filter(request -> filter.getStartDate() == null || 
                        request.getCreateTime().toLocalDate().isAfter(filter.getStartDate().minusDays(1)))
                .filter(request -> filter.getEndDate() == null || 
                        request.getCreateTime().toLocalDate().isBefore(filter.getEndDate().plusDays(1)))
                .filter(request -> filter.getStatus() == null || 
                        request.getStatusCode().equals(filter.getStatus()))
                .toList();
    }
    
    private ByteArrayOutputStream generateCardCSV(List<Card> cards, ReportFilterDto filter) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Map<String, String> statusMap = statusRepository.findAll().stream()
                .collect(Collectors.toMap(Status::getStatusCode, Status::getDescription));
        
        String filterInfo = buildFilterInfo(filter, statusMap);
        
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8))) {
            if (!filterInfo.isEmpty()) {
                writer.writeNext(new String[]{filterInfo});
            }
            String[] headers = {"Card Number", "Expiry Date", "Status", "Credit Limit", "Cash Limit", 
                              "Available Credit Limit", "Available Cash Limit", "Last Update Time", "Last Update User"};
            writer.writeNext(headers);
            
            for (Card card : cards) {
                String[] row = {
                    card.getCardNumber(),
                    card.getExpiryDate().toString(),
                    statusMap.getOrDefault(card.getStatusCode(), card.getStatusCode()),
                    card.getCreditLimit().toString(),
                    card.getCashLimit().toString(),
                    card.getAvailableCreditLimit().toString(),
                    card.getAvailableCashLimit().toString(),
                    card.getLastUpdateTime().format(DATE_FORMATTER),
                    card.getLastUpdateUser() != null ? card.getLastUpdateUser() : ""
                };
                writer.writeNext(row);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
        
        return outputStream;
    }

    private ByteArrayOutputStream generateCardRequestCSV(List<CardRequest> requests, ReportFilterDto filter) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Map<String, String> requestStatusMap = requestStatusRepository.findAll().stream()
                .collect(Collectors.toMap(Status::getStatusCode, Status::getDescription));
        Map<String, String> requestTypeMap = cardRequestTypeRepository.findAll().stream()
                .collect(Collectors.toMap(CardRequestType::getCode, CardRequestType::getDescription));
        
        String filterInfo = buildFilterInfoForRequest(filter, requestStatusMap);
        
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(outputStream, StandardCharsets.UTF_8))) {
            if (!filterInfo.isEmpty()) {
                writer.writeNext(new String[]{filterInfo});
            }
            String[] headers = {"Request ID", "Card Number", "Request Type", "Status", "Create Time", "Request User", "Approved User"};
            writer.writeNext(headers);
            
            for (CardRequest request : requests) {
                String[] row = {
                    request.getRequestId().toString(),
                    request.getCardNumber(),
                    requestTypeMap.getOrDefault(request.getRequestReasonCode(), request.getRequestReasonCode()),
                    requestStatusMap.getOrDefault(request.getStatusCode(), request.getStatusCode()),
                    request.getCreateTime().format(DATE_FORMATTER),
                    request.getRequestUser() != null ? request.getRequestUser() : "",
                    request.getApprovedUser() != null ? request.getApprovedUser() : ""
                };
                writer.writeNext(row);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
        
        return outputStream;
    }
    
    private String buildFilterInfo(ReportFilterDto filter, Map<String, String> statusMap) {
        StringBuilder sb = new StringBuilder();
        
        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            sb.append("Date: ");
            if (filter.getStartDate() != null && filter.getEndDate() != null) {
                sb.append(filter.getStartDate()).append(" to ").append(filter.getEndDate());
            } else if (filter.getStartDate() != null) {
                sb.append("From ").append(filter.getStartDate());
            } else {
                sb.append("Until ").append(filter.getEndDate());
            }
        }
        
        if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" | ");
            }
            sb.append("Status: ").append(statusMap.getOrDefault(filter.getStatus(), filter.getStatus()));
        }
        
        return sb.toString();
    }
    
    private String buildFilterInfoForRequest(ReportFilterDto filter, Map<String, String> statusMap) {
        StringBuilder sb = new StringBuilder();
        
        if (filter.getStartDate() != null || filter.getEndDate() != null) {
            sb.append("Date: ");
            if (filter.getStartDate() != null && filter.getEndDate() != null) {
                sb.append(filter.getStartDate()).append(" to ").append(filter.getEndDate());
            } else if (filter.getStartDate() != null) {
                sb.append("From ").append(filter.getStartDate());
            } else {
                sb.append("Until ").append(filter.getEndDate());
            }
        }
        
        if (filter.getStatus() != null && !filter.getStatus().isEmpty()) {
            if (sb.length() > 0) {
                sb.append(" | ");
            }
            sb.append("Status: ").append(statusMap.getOrDefault(filter.getStatus(), filter.getStatus()));
        }
        
        return sb.toString();
    }

    @Override
    public ByteArrayOutputStream generateCardPDF(ReportFilterDto filter) {
        List<Card> cards = getFilteredCards(filter);
        return generateCardPDF(cards, filter);
    }

    @Override
    public ByteArrayOutputStream generateCardRequestPDF(ReportFilterDto filter) {
        List<CardRequest> requests = getFilteredCardRequests(filter);
        return generateCardRequestPDF(requests, filter);
    }

    private ByteArrayOutputStream generateCardPDF(List<Card> cards, ReportFilterDto filter) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Map<String, String> statusMap = statusRepository.findAll().stream()
                .collect(Collectors.toMap(Status::getStatusCode, Status::getDescription));
        
        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);
            document.open();
            
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font filterFont = new Font(Font.HELVETICA, 10, Font.ITALIC);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
            
            Paragraph title = new Paragraph("Card Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            String filterInfo = buildFilterInfo(filter, statusMap);
            if (!filterInfo.isEmpty()) {
                Paragraph filterPara = new Paragraph(filterInfo, filterFont);
                filterPara.setAlignment(Element.ALIGN_CENTER);
                document.add(filterPara);
            }
            
            document.add(new Paragraph("\n"));
            
            if (cards == null || cards.isEmpty()) {
                Paragraph noData = new Paragraph("No card data available.", normalFont);
                noData.setAlignment(Element.ALIGN_CENTER);
                document.add(noData);
            } else {
                PdfPTable table = new PdfPTable(9);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{2.5f, 1.5f, 1.5f, 1.5f, 1.5f, 2f, 2f, 1.5f, 1.5f});
                
                String[] headers = {"Card Number", "Expiry", "Status", "Credit Limit", "Cash Limit", "Available Credit", "Available Cash", "Last Update", "Last Update User"};
                for (String header : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(cell);
                }
                
                for (Card card : cards) {
                    table.addCell(new Phrase(card.getCardNumber() != null ? card.getCardNumber() : "", normalFont));
                    table.addCell(new Phrase(card.getExpiryDate() != null ? card.getExpiryDate().toString() : "", normalFont));
                    table.addCell(new Phrase(statusMap.getOrDefault(card.getStatusCode(), card.getStatusCode()), normalFont));
                    table.addCell(new Phrase(card.getCreditLimit() != null ? card.getCreditLimit().toString() : "", normalFont));
                    table.addCell(new Phrase(card.getCashLimit() != null ? card.getCashLimit().toString() : "", normalFont));
                    table.addCell(new Phrase(card.getAvailableCreditLimit() != null ? card.getAvailableCreditLimit().toString() : "", normalFont));
                    table.addCell(new Phrase(card.getAvailableCashLimit() != null ? card.getAvailableCashLimit().toString() : "", normalFont));
                    table.addCell(new Phrase(card.getLastUpdateTime() != null ? card.getLastUpdateTime().format(DATE_FORMATTER) : "", normalFont));
                    table.addCell(new Phrase(card.getLastUpdateUser() != null ? card.getLastUpdateUser() : "", normalFont));
                }
                
                document.add(table);
            }
            
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
        
        return outputStream;
    }

    private ByteArrayOutputStream generateCardRequestPDF(List<CardRequest> requests, ReportFilterDto filter) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Map<String, String> requestStatusMap = requestStatusRepository.findAll().stream()
                .collect(Collectors.toMap(Status::getStatusCode, Status::getDescription));
        Map<String, String> requestTypeMap = cardRequestTypeRepository.findAll().stream()
                .collect(Collectors.toMap(CardRequestType::getCode, CardRequestType::getDescription));
        
        try {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, outputStream);
            document.open();
            
            Font titleFont = new Font(Font.HELVETICA, 16, Font.BOLD);
            Font filterFont = new Font(Font.HELVETICA, 10, Font.ITALIC);
            Font headerFont = new Font(Font.HELVETICA, 10, Font.BOLD);
            Font normalFont = new Font(Font.HELVETICA, 9, Font.NORMAL);
            
            Paragraph title = new Paragraph("Card Request Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);
            
            String filterInfo = buildFilterInfoForRequest(filter, requestStatusMap);
            if (!filterInfo.isEmpty()) {
                Paragraph filterPara = new Paragraph(filterInfo, filterFont);
                filterPara.setAlignment(Element.ALIGN_CENTER);
                document.add(filterPara);
            }
            
            document.add(new Paragraph("\n"));
            
            if (requests == null || requests.isEmpty()) {
                Paragraph noData = new Paragraph("No card request data available.", normalFont);
                noData.setAlignment(Element.ALIGN_CENTER);
                document.add(noData);
            } else {
                PdfPTable table = new PdfPTable(7);
                table.setWidthPercentage(100);
                table.setWidths(new float[]{1.5f, 2.5f, 2f, 1.5f, 2.5f, 1.5f, 1.5f});
                
                String[] headers = {"Request ID", "Card Number", "Request Type", "Status", "Create Time", "Request User", "Approved User"};
                for (String header : headers) {
                    PdfPCell cell = new PdfPCell(new Phrase(header, headerFont));
                    cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                    table.addCell(cell);
                }
                
                for (CardRequest request : requests) {
                    table.addCell(new Phrase(request.getRequestId() != null ? request.getRequestId().toString() : "", normalFont));
                    table.addCell(new Phrase(request.getCardNumber() != null ? request.getCardNumber() : "", normalFont));
                    table.addCell(new Phrase(requestTypeMap.getOrDefault(request.getRequestReasonCode(), request.getRequestReasonCode()), normalFont));
                    table.addCell(new Phrase(requestStatusMap.getOrDefault(request.getStatusCode(), request.getStatusCode()), normalFont));
                    table.addCell(new Phrase(request.getCreateTime() != null ? request.getCreateTime().format(DATE_FORMATTER) : "", normalFont));
                    table.addCell(new Phrase(request.getRequestUser() != null ? request.getRequestUser() : "", normalFont));
                    table.addCell(new Phrase(request.getApprovedUser() != null ? request.getApprovedUser() : "", normalFont));
                }
                
                document.add(table);
            }
            
            document.close();
        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
        
        return outputStream;
    }

}
