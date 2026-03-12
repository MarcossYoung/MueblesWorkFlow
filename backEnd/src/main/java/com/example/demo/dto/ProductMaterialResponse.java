package com.example.demo.dto;

import com.example.demo.model.InventoryUnit;
import com.example.demo.model.ProductMaterial;
import java.math.BigDecimal;

public record ProductMaterialResponse(
        Long id,
        Long inventoryItemId,
        String itemName,
        InventoryUnit unit,
        BigDecimal quantityUsed,
        BigDecimal unitCost,
        BigDecimal subtotal
) {
    public static ProductMaterialResponse from(ProductMaterial pm) {
        BigDecimal qty = pm.getQuantityUsed() == null ? BigDecimal.ZERO : pm.getQuantityUsed();
        BigDecimal cost = pm.getInventoryItem().getUnitCost() == null ? BigDecimal.ZERO : pm.getInventoryItem().getUnitCost();
        return new ProductMaterialResponse(
                pm.getId(),
                pm.getInventoryItem().getId(),
                pm.getInventoryItem().getName(),
                pm.getInventoryItem().getUnit(),
                qty,
                cost,
                qty.multiply(cost)
        );
    }
}
