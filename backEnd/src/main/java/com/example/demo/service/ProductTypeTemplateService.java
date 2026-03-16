package com.example.demo.service;

import com.example.demo.dto.ProductTypeTemplateRequest;
import com.example.demo.dto.ProductTypeTemplateResponse;
import com.example.demo.model.*;
import com.example.demo.repository.InventoryItemRepo;
import com.example.demo.repository.ProductMaterialRepo;
import com.example.demo.repository.ProductTypeTemplateRepo;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductTypeTemplateService {

    private final ProductTypeTemplateRepo templateRepo;
    private final InventoryItemRepo inventoryItemRepo;
    private final ProductMaterialRepo productMaterialRepo;

    public ProductTypeTemplateService(ProductTypeTemplateRepo templateRepo,
                                      InventoryItemRepo inventoryItemRepo,
                                      ProductMaterialRepo productMaterialRepo) {
        this.templateRepo = templateRepo;
        this.inventoryItemRepo = inventoryItemRepo;
        this.productMaterialRepo = productMaterialRepo;
    }

    public List<ProductTypeTemplateResponse> getAll() {
        return templateRepo.findAll().stream()
                .map(ProductTypeTemplateResponse::from)
                .collect(Collectors.toList());
    }

    public ProductTypeTemplateResponse create(ProductTypeTemplateRequest req) {
        InventoryItem item = inventoryItemRepo.findById(req.inventoryItemId())
                .orElseThrow(() -> new RuntimeException("InventoryItem not found: " + req.inventoryItemId()));
        ProductTypeTemplate t = new ProductTypeTemplate();
        t.setProductType(req.productType());
        t.setInventoryItem(item);
        t.setQuantityUsed(req.quantityUsed());
        return ProductTypeTemplateResponse.from(templateRepo.save(t));
    }

    public void delete(Long id) {
        templateRepo.deleteById(id);
    }

    public void applyTemplatesToProduct(Product p) {
        if (p.getProductType() == null) return;
        List<ProductTypeTemplate> templates = templateRepo.findByProductType(p.getProductType());
        for (ProductTypeTemplate t : templates) {
            ProductMaterial pm = new ProductMaterial();
            pm.setProduct(p);
            pm.setInventoryItem(t.getInventoryItem());
            pm.setQuantityUsed(t.getQuantityUsed());
            productMaterialRepo.save(pm);
        }
    }
}
