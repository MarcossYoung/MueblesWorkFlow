package com.example.demo.service;

import com.example.demo.dto.ProductMaterialRequest;
import com.example.demo.dto.ProductMaterialResponse;
import com.example.demo.model.InventoryItem;
import com.example.demo.model.Product;
import com.example.demo.model.ProductMaterial;
import com.example.demo.repository.InventoryItemRepo;
import com.example.demo.repository.ProductMaterialRepo;
import com.example.demo.repository.ProductRepo;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductMaterialService {

    private final ProductMaterialRepo productMaterialRepo;
    private final ProductRepo productRepo;
    private final InventoryItemRepo inventoryItemRepo;

    public ProductMaterialService(ProductMaterialRepo productMaterialRepo,
                                   ProductRepo productRepo,
                                   InventoryItemRepo inventoryItemRepo) {
        this.productMaterialRepo = productMaterialRepo;
        this.productRepo = productRepo;
        this.inventoryItemRepo = inventoryItemRepo;
    }

    public List<ProductMaterialResponse> getMaterialsForProduct(Long productId) {
        return productMaterialRepo.findByProduct_Id(productId).stream()
                .map(ProductMaterialResponse::from)
                .collect(Collectors.toList());
    }

    public ProductMaterialResponse addMaterial(Long productId, ProductMaterialRequest req) {
        Product product = productRepo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
        InventoryItem item = inventoryItemRepo.findById(req.inventoryItemId())
                .orElseThrow(() -> new RuntimeException("InventoryItem not found: " + req.inventoryItemId()));

        ProductMaterial pm = new ProductMaterial();
        pm.setProduct(product);
        pm.setInventoryItem(item);
        pm.setQuantityUsed(req.quantityUsed());
        return ProductMaterialResponse.from(productMaterialRepo.save(pm));
    }

    @Transactional
    public void removeMaterial(Long productId, Long materialId) {
        productMaterialRepo.deleteByProduct_IdAndId(productId, materialId);
    }

    public BigDecimal calculateCogs(Long productId) {
        return productMaterialRepo.findByProduct_Id(productId).stream()
                .map(pm -> {
                    BigDecimal qty = pm.getQuantityUsed() == null ? BigDecimal.ZERO : pm.getQuantityUsed();
                    BigDecimal cost = pm.getInventoryItem().getUnitCost() == null ? BigDecimal.ZERO : pm.getInventoryItem().getUnitCost();
                    return qty.multiply(cost);
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Transactional
    public void syncCogsToProduct(Long productId) {
        List<ProductMaterial> materials = productMaterialRepo.findByProduct_Id(productId);
        if (!materials.isEmpty()) {
            BigDecimal cogs = materials.stream()
                    .map(pm -> {
                        BigDecimal qty = pm.getQuantityUsed() == null ? BigDecimal.ZERO : pm.getQuantityUsed();
                        BigDecimal cost = pm.getInventoryItem().getUnitCost() == null ? BigDecimal.ZERO : pm.getInventoryItem().getUnitCost();
                        return qty.multiply(cost);
                    })
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new RuntimeException("Product not found: " + productId));
            product.setCogsAmount(cogs);
            productRepo.save(product);
        }
    }
}
