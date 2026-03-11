package com.epic.cms.service.report;

import com.epic.cms.dto.report.ReportFilterDto;

import java.io.ByteArrayOutputStream;

public interface ReportService {
    
    ByteArrayOutputStream generateCardCSV(ReportFilterDto filter);
    
    ByteArrayOutputStream generateCardRequestCSV(ReportFilterDto filter);
    
    ByteArrayOutputStream generateCardPDF(ReportFilterDto filter);
    
    ByteArrayOutputStream generateCardRequestPDF(ReportFilterDto filter);
}
