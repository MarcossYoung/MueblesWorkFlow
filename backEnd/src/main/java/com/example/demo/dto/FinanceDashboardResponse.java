package com.example.demo.dto;

import java.time.LocalDate;

public record FinanceDashboardResponse(
        LocalDate from,
        LocalDate to,
        FinanceKpis kpis,
        FinanceSeries series
) {}
