package com.example.demo.dto;

import com.example.demo.model.ProductType;
import java.math.BigDecimal;

public record ProductTypeTemplateRequest(ProductType productType, Long inventoryItemId, BigDecimal quantityUsed) {}
