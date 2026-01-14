// src/main/java/com/example/demo/controller/FinanceController.java
package com.example.demo.controller;

import com.example.demo.dto.FinanceDashboardResponse;
import com.example.demo.service.FinanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;

@RestController
@RequestMapping("/api/finance")
public class FinanceController {

    private final FinanceService financeService;
    private static final ZoneId AR = ZoneId.of("America/Argentina/Buenos_Aires");

    public FinanceController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping
    public FinanceDashboardResponse getFinance(
            // easiest UI param: "YYYY-MM"
            @RequestParam(required = false) String month,

            // or explicit date range
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        DateRange range = resolveRange(month, from, to);
        return financeService.dashboard(range.from(), range.to());
    }

    private DateRange resolveRange(String month, LocalDate from, LocalDate to) {
        // Highest priority: explicit from/to
        if (from != null && to != null) {
            return new DateRange(from, to);
        }

        // Next: month=YYYY-MM
        if (month != null && !month.isBlank()) {
            YearMonth ym = YearMonth.parse(month.trim());
            return new DateRange(ym.atDay(1), ym.atEndOfMonth());
        }

        // Default: current month in Argentina TZ
        YearMonth current = YearMonth.from(LocalDate.now(AR));
        return new DateRange(current.atDay(1), current.atEndOfMonth());
    }

    @GetMapping("/yearly")
    public FinanceDashboardResponse getYearlyFinance(@RequestParam int year) {
        LocalDate from = LocalDate.of(year, 1, 1);
        LocalDate to = LocalDate.of(year, 12, 31);
        return financeService.dashboard(from, to);
    }

    private record DateRange(LocalDate from, LocalDate to) {}
}
