package com.example.demo.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;


// FinanceDashboardResponse.java
public record FinanceDashboardResponse(
        LocalDate from,
        LocalDate to,
        BigDecimal tInc,
        BigDecimal tDep,
        BigDecimal tExp,
        BigDecimal tRev,
        List<Map<String,Object>> expenseBreakdown, // Pie Chart
        List<Map<String,Object>> userStats         // Bar Chart (The critical fix)

) {}