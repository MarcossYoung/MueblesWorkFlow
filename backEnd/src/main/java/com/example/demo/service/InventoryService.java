package com.example.demo.service;

import com.example.demo.dto.CreateInventoryItemRequest;
import com.example.demo.dto.InventoryItemResponse;
import com.example.demo.model.InventoryItem;
import com.example.demo.model.ProductMaterial;
import com.example.demo.repository.InventoryItemRepo;
import com.example.demo.repository.ProductMaterialRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class InventoryService {

    private final InventoryItemRepo inventoryItemRepo;
    private final ProductMaterialRepo productMaterialRepo;

    public InventoryService(InventoryItemRepo inventoryItemRepo, ProductMaterialRepo productMaterialRepo) {
        this.inventoryItemRepo = inventoryItemRepo;
        this.productMaterialRepo = productMaterialRepo;
    }

    public Page<InventoryItemResponse> getAll(Pageable pageable) {
        return inventoryItemRepo.findAll(pageable).map(InventoryItemResponse::from);
    }

    public Page<InventoryItemResponse> searchByName(String name, Pageable pageable) {
        return inventoryItemRepo.findByNameContainingIgnoreCase(name, pageable).map(InventoryItemResponse::from);
    }

    public InventoryItemResponse create(CreateInventoryItemRequest req) {
        InventoryItem item = new InventoryItem();
        item.setName(req.name());
        item.setUnit(req.unit());
        item.setQuantityInStock(req.quantityInStock());
        item.setUnitCost(req.unitCost());
        item.setMinStock(req.minStock());
        item.setLastUpdated(LocalDateTime.now());
        return InventoryItemResponse.from(inventoryItemRepo.save(item));
    }

    public InventoryItemResponse update(Long id, CreateInventoryItemRequest req) {
        InventoryItem item = inventoryItemRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("InventoryItem not found: " + id));
        item.setName(req.name());
        item.setUnit(req.unit());
        item.setQuantityInStock(req.quantityInStock());
        item.setUnitCost(req.unitCost());
        item.setMinStock(req.minStock());
        item.setLastUpdated(LocalDateTime.now());
        return InventoryItemResponse.from(inventoryItemRepo.save(item));
    }

    public void delete(Long id) {
        inventoryItemRepo.deleteById(id);
    }

    public List<InventoryItemResponse> getLowStockItems() {
        return inventoryItemRepo.findLowStockItems().stream()
                .map(InventoryItemResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deductMaterialsForProduct(Long productId) {
        List<ProductMaterial> materials = productMaterialRepo.findByProduct_Id(productId);
        for (ProductMaterial pm : materials) {
            InventoryItem item = pm.getInventoryItem();
            if (item != null && pm.getQuantityUsed() != null) {
                item.setQuantityInStock(item.getQuantityInStock().subtract(pm.getQuantityUsed()));
                item.setLastUpdated(LocalDateTime.now());
                inventoryItemRepo.save(item);
            }
        }
    }
}
