package com.example.demo.dto;

import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.model.PaymentType;

import java.math.BigDecimal;
import java.time.LocalDate;

// CreatePaymentRequest.java
public record CreatePaymentRequest(
        BigDecimal valor,
        PaymentType type,        // DEPOSIT, RESTO, etc.
        PaymentStatus pagostatus,  // SEÑA, etc.
        Long product_id,    // Matches your frontend key
        LocalDate fecha,
        PaymentMethod paymentMethod
) {}