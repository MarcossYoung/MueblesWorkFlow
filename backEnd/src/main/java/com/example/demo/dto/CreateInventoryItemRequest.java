package com.example.demo.dto;

import com.example.demo.model.InventoryUnit;
import java.math.BigDecimal;

public record CreateInventoryItemRequest(
        String name,
        InventoryUnit unit,
        BigDecimal quantityInStock,
        BigDecimal unitCost,
        BigDecimal minStock
) {}
