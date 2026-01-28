package com.example.demo.dto;

import com.example.demo.model.OrderPayments;
import com.example.demo.model.PaymentStatus;
import com.example.demo.model.PaymentType;
import com.example.demo.model.Product;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record ProductPayments (
    Long id,
    Product product,
    PaymentType paymentType,
    BigDecimal amount,
    LocalDate paymentDate
) {
    public static ProductPayments from(OrderPayments op) {
        return new ProductPayments(

                op.getId(),
                op.getProduct(),
                op.getPaymentType(),
                op.getAmount(),
                op.getPaymentDate()
        );
    }
}