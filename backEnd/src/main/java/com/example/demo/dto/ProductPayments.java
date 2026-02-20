package com.example.demo.dto;

import com.example.demo.model.OrderPayments;
import com.example.demo.model.PaymentMethod;
import com.example.demo.model.PaymentType;
import com.example.demo.model.Product;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductPayments (
    Long id,
    Product product,
    PaymentType paymentType,
    BigDecimal amount,
    LocalDate paymentDate,
    PaymentMethod paymentMethod,
    boolean hasReceipt
) {
    public static ProductPayments from(OrderPayments op) {
        return new ProductPayments(
                op.getId(),
                op.getProduct(),
                op.getPaymentType(),
                op.getAmount(),
                op.getPaymentDate(),
                op.getPaymentMethod(),
                op.getReceiptPath() != null
        );
    }
}
