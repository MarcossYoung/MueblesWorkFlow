package com.example.demo.dto;

import com.example.demo.model.InventoryItem;
import com.example.demo.model.InventoryUnit;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InventoryItemResponse(
        Long id,
        String name,
        InventoryUnit unit,
        BigDecimal quantityInStock,
        BigDecimal unitCost,
        BigDecimal minStock,
        boolean isLowStock,
        BigDecimal totalValue,
        LocalDateTime lastUpdated
) {
    public static InventoryItemResponse from(InventoryItem item) {
        BigDecimal qty = item.getQuantityInStock() == null ? BigDecimal.ZERO : item.getQuantityInStock();
        BigDecimal cost = item.getUnitCost() == null ? BigDecimal.ZERO : item.getUnitCost();
        BigDecimal min = item.getMinStock() == null ? BigDecimal.ZERO : item.getMinStock();
        boolean lowStock = qty.compareTo(min) <= 0;
        return new InventoryItemResponse(
                item.getId(),
                item.getName(),
                item.getUnit(),
                qty,
                cost,
                min,
                lowStock,
                qty.multiply(cost),
                item.getLastUpdated()
        );
    }
}
