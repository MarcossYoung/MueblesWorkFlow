package com.example.demo.dto;

import com.example.demo.model.PaymentStatus;
import com.example.demo.model.ProductType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductCreateRequest(
        Long id,
        String titulo,
        ProductType productType,
        String medidas,
        String material,
        String pintura,
        String color,
        String laqueado,
        Long cantidad,
        LocalDate startDate,
        LocalDate fechaEntrega,
        LocalDate fechaEstimada,
        String foto,
        String notas,
        BigDecimal precio,
        PaymentStatus status,
        BigDecimal amount,
        String clientEmail

){

}
