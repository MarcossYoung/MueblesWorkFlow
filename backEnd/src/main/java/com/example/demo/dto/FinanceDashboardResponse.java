package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record FinanceDashboardResponse(
        LocalDate from,
        LocalDate to,
        // KPI Fields (Matches Frontend destructuring)
        BigDecimal totalIncome,
        BigDecimal currentDeposits,
        BigDecimal monthlySpend,
        BigDecimal totalProfit,
        // Series Fields (Matches Frontend BarChart valueKeys)
        List<Map<String, Object>> incomeSeries,
        List<Map<String, Object>> depositSeries,
        List<Map<String, Object>> profitSeries
) {}