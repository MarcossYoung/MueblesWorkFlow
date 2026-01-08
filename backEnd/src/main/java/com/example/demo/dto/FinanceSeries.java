// src/main/java/com/example/demo/dto/FinanceSeries.java
package com.example.demo.dto;

import java.util.List;

public record FinanceSeries(
        List<MonthlyAmountRow> incomeByMonth,
        List<MonthlyAmountRow> cashflowByMonth,
        List<MonthlyAmountRow> expensesByMonth,
        List<MonthlyAmountRow> profitByMonth
) {}
