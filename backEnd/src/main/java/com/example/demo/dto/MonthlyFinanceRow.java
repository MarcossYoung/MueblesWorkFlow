package com.example.demo.dto;

import java.math.BigDecimal;

public record MonthlyFinanceRow(
        String month,          // "YYYY-MM"
        BigDecimal income,     // by Product.fechaEntrega
        BigDecimal cashflow,   // by OrderPayments.paymentDate
        BigDecimal expenses,   // by Costs.date
        BigDecimal profit      // income - expenses
) {}
