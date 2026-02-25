package com.example.demo.dto;

import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentStatus;
import com.example.demo.model.PaymentType;

import java.math.BigDecimal;

// CreatePaymentRequest.java
public record CreatePaymentRequest(
        BigDecimal valor,
        PaymentType type,        // DEPOSIT, RESTO, etc.
        Long product_id,    // Matches your frontend key
        String fecha,            // "yyyy-MM-dd"
        PaymentMethod paymentMethod
) {}