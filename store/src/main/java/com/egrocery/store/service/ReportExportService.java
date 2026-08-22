package com.egrocery.store.service;

import java.util.List;

/**
 * Generic tabular report exporter. Each report type builds its own headers/rows
 * and hands them to this service, rather than every report reimplementing
 * PDF/Excel generation.
 */
public interface ReportExportService {

    byte[] generatePdf(String title, List<String> headers, List<List<String>> rows);

    byte[] generateExcel(String sheetName, List<String> headers, List<List<String>> rows);
}