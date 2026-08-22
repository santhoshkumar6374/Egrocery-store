package com.egrocery.store.controller;

import com.egrocery.store.dto.request.ReportFormat;
import com.egrocery.store.dto.response.*;
import com.egrocery.store.service.ReportExportService;
import com.egrocery.store.service.ReportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
@Tag(name = "Reports (Admin)", description = "Sales, best-sellers, revenue, and customer purchase reports, with PDF/Excel export")
public class AdminReportController {

    private static final MediaType XLSX_MEDIA_TYPE =
            MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

    private final ReportService reportService;
    private final ReportExportService reportExportService;

    // ---------- Sales report (generic range + daily/weekly/monthly convenience) ----------

    @GetMapping("/sales")
    public ResponseEntity<ApiResponse<SalesReportResponse>> salesReport(
            @RequestParam LocalDate from, @RequestParam LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getSalesReport(from, to)));
    }

    @GetMapping("/sales/daily")
    public ResponseEntity<ApiResponse<SalesReportResponse>> dailySales(
            @RequestParam(required = false) LocalDate date) {
        LocalDate d = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.success(reportService.getSalesReport(d, d)));
    }

    @GetMapping("/sales/weekly")
    public ResponseEntity<ApiResponse<SalesReportResponse>> weeklySales(
            @RequestParam(required = false) LocalDate date) {
        LocalDate to = date != null ? date : LocalDate.now();
        LocalDate from = to.minusDays(6);
        return ResponseEntity.ok(ApiResponse.success(reportService.getSalesReport(from, to)));
    }

    @GetMapping("/sales/monthly")
    public ResponseEntity<ApiResponse<SalesReportResponse>> monthlySales(
            @RequestParam(required = false) String month) {
        LocalDate[] range = monthRange(month);
        return ResponseEntity.ok(ApiResponse.success(reportService.getSalesReport(range[0], range[1])));
    }

    @GetMapping(value = "/sales/export", produces = {MediaType.APPLICATION_PDF_VALUE})
    public ResponseEntity<byte[]> exportSales(@RequestParam LocalDate from, @RequestParam LocalDate to,
                                              @RequestParam(defaultValue = "PDF") ReportFormat format) {
        SalesReportResponse report = reportService.getSalesReport(from, to);
        List<String> headers = List.of("Date", "Orders", "Revenue (\u20B9)");
        List<List<String>> rows = new ArrayList<>();
        for (DailySalesPointResponse point : report.getDailyBreakdown()) {
            rows.add(List.of(point.getDate().toString(), String.valueOf(point.getOrders()), point.getRevenue().toString()));
        }
        String title = "Sales Report (" + from + " to " + to + ")";
        return export(format, title, "sales-report-" + from + "_to_" + to, headers, rows);
    }

    // ---------- Best-selling products ----------

    @GetMapping("/best-selling")
    public ResponseEntity<ApiResponse<List<BestSellingProductResponse>>> bestSelling(
            @RequestParam LocalDate from, @RequestParam LocalDate to,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getBestSellingProducts(from, to, limit)));
    }

    @GetMapping("/best-selling/export")
    public ResponseEntity<byte[]> exportBestSelling(@RequestParam LocalDate from, @RequestParam LocalDate to,
                                                    @RequestParam(defaultValue = "10") int limit,
                                                    @RequestParam(defaultValue = "PDF") ReportFormat format) {
        List<BestSellingProductResponse> data = reportService.getBestSellingProducts(from, to, limit);
        List<String> headers = List.of("Product", "Quantity Sold", "Revenue (\u20B9)");
        List<List<String>> rows = data.stream()
                .map(p -> List.of(p.getProductName(), String.valueOf(p.getQuantitySold()), p.getRevenue().toString()))
                .toList();
        String title = "Best Selling Products (" + from + " to " + to + ")";
        return export(format, title, "best-selling-" + from + "_to_" + to, headers, rows);
    }

    // ---------- Revenue report ----------

    @GetMapping("/revenue")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> revenue(
            @RequestParam LocalDate from, @RequestParam LocalDate to) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getRevenueReport(from, to)));
    }

    @GetMapping("/revenue/export")
    public ResponseEntity<byte[]> exportRevenue(@RequestParam LocalDate from, @RequestParam LocalDate to,
                                                @RequestParam(defaultValue = "PDF") ReportFormat format) {
        RevenueReportResponse r = reportService.getRevenueReport(from, to);
        List<String> headers = List.of("Metric", "Amount (\u20B9)");
        List<List<String>> rows = List.of(
                List.of("Orders", String.valueOf(r.getOrderCount())),
                List.of("Gross Items Revenue", r.getGrossItemsRevenue().toString()),
                List.of("Delivery Fees Collected", r.getDeliveryFeesCollected().toString()),
                List.of("Discounts Given", r.getDiscountsGiven().toString()),
                List.of("Net Revenue", r.getNetRevenue().toString())
        );
        String title = "Revenue Report (" + from + " to " + to + ")";
        return export(format, title, "revenue-report-" + from + "_to_" + to, headers, rows);
    }

    // ---------- Customer purchase report ----------

    @GetMapping("/customer-purchases")
    public ResponseEntity<ApiResponse<List<CustomerPurchaseReportResponse>>> customerPurchases(
            @RequestParam LocalDate from, @RequestParam LocalDate to,
            @RequestParam(defaultValue = "50") int limit) {
        return ResponseEntity.ok(ApiResponse.success(reportService.getCustomerPurchaseReport(from, to, limit)));
    }

    @GetMapping("/customer-purchases/export")
    public ResponseEntity<byte[]> exportCustomerPurchases(@RequestParam LocalDate from, @RequestParam LocalDate to,
                                                          @RequestParam(defaultValue = "50") int limit,
                                                          @RequestParam(defaultValue = "PDF") ReportFormat format) {
        List<CustomerPurchaseReportResponse> data = reportService.getCustomerPurchaseReport(from, to, limit);
        List<String> headers = List.of("Customer", "Email", "Orders", "Total Spent (\u20B9)");
        List<List<String>> rows = data.stream()
                .map(c -> List.of(c.getCustomerName(), c.getCustomerEmail(), String.valueOf(c.getTotalOrders()), c.getTotalSpent().toString()))
                .toList();
        String title = "Customer Purchase Report (" + from + " to " + to + ")";
        return export(format, title, "customer-purchases-" + from + "_to_" + to, headers, rows);
    }

    // ---------- Shared export plumbing ----------

    private ResponseEntity<byte[]> export(ReportFormat format, String title, String filenameBase,
                                          List<String> headers, List<List<String>> rows) {
        byte[] content;
        MediaType mediaType;
        String extension;

        if (format == ReportFormat.EXCEL) {
            content = reportExportService.generateExcel(title, headers, rows);
            mediaType = XLSX_MEDIA_TYPE;
            extension = ".xlsx";
        } else {
            content = reportExportService.generatePdf(title, headers, rows);
            mediaType = MediaType.APPLICATION_PDF;
            extension = ".pdf";
        }

        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.setContentDisposition(ContentDisposition.attachment().filename(filenameBase + extension).build());

        return ResponseEntity.ok()
                .contentType(mediaType)
                .headers(httpHeaders)
                .body(content);
    }

    private LocalDate[] monthRange(String month) {
        YearMonth yearMonth = month != null ? YearMonth.parse(month) : YearMonth.now();
        LocalDate from = yearMonth.atDay(1);
        LocalDate lastOfMonth = yearMonth.atEndOfMonth();
        LocalDate to = lastOfMonth.isAfter(LocalDate.now()) ? LocalDate.now() : lastOfMonth;
        return new LocalDate[]{from, to};
    }
}