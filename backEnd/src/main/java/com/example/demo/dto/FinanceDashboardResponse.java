package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

// FinanceDashboardResponse.java
public record FinanceDashboardResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal totalIncome,
        BigDecimal currentDeposits,
        BigDecimal monthlySpend,
        BigDecimal totalProfit,
        List<Map<String, Object>> comparisonSeries, // For the Bar Chart
        List<Map<String, Object>> expenseBreakdown   // For the Pie Chart
) {}