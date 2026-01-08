// src/main/java/com/example/demo/dto/FinanceKpis.java
package com.example.demo.dto;

import java.math.BigDecimal;

public record FinanceKpis(
        BigDecimal income,    // revenue recognized (fechaEntrega)
        BigDecimal cashflow,  // money-in (payments by date)
        BigDecimal expenses,  // costs by date
        BigDecimal profit     // income - expenses
) {}
