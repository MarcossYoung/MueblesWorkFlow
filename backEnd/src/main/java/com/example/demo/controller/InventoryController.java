package com.example.demo.controller;

import com.example.demo.dto.CreateInventoryItemRequest;
import com.example.demo.dto.InventoryItemResponse;
import com.example.demo.service.InventoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@CrossOrigin(origins = "*")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public ResponseEntity<Page<InventoryItemResponse>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String name
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("name"));
        if (name != null && !name.isBlank()) {
            return ResponseEntity.ok(inventoryService.searchByName(name, pageable));
        }
        return ResponseEntity.ok(inventoryService.getAll(pageable));
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<InventoryItemResponse>> getLowStock() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @PostMapping
    public ResponseEntity<InventoryItemResponse> create(@RequestBody CreateInventoryItemRequest req) {
        return ResponseEntity.ok(inventoryService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InventoryItemResponse> update(
            @PathVariable Long id,
            @RequestBody CreateInventoryItemRequest req
    ) {
        return ResponseEntity.ok(inventoryService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        inventoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
