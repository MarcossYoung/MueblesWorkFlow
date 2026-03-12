package com.example.demo.dto;

import java.math.BigDecimal;

public record ProductMaterialRequest(
        Long inventoryItemId,
        BigDecimal quantityUsed
) {}
