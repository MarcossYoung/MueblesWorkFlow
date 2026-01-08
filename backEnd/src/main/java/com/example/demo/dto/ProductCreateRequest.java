package com.example.demo.dto;

import com.example.demo.model.ProductType;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ProductCreateRequest(
        String titulo,
        ProductType productType,
        String medidas,
        String material,
        String pintura,
        String color,
        String laqueado,
        Long cantidad,
        BigDecimal precio,
        LocalDate startDate,
        LocalDate fechaEntrega,
        LocalDate fechaEstimada,
        String foto,
        String notas,

        Long deposit,

        Long ownerId
) {}
