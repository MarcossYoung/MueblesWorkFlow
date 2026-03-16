package com.example.demo.dto;

import com.example.demo.model.ProductType;
import com.example.demo.model.ProductTypeTemplate;
import java.math.BigDecimal;

public record ProductTypeTemplateResponse(
        Long id,
        ProductType productType,
        Long inventoryItemId,
        String itemName,
        BigDecimal quantityUsed
) {
    public static ProductTypeTemplateResponse from(ProductTypeTemplate t) {
        return new ProductTypeTemplateResponse(
                t.getId(),
                t.getProductType(),
                t.getInventoryItem().getId(),
                t.getInventoryItem().getName(),
                t.getQuantityUsed()
        );
    }
}
