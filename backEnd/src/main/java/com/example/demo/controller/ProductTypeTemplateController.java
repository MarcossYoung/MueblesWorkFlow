package com.example.demo.controller;

import com.example.demo.dto.ProductTypeTemplateRequest;
import com.example.demo.dto.ProductTypeTemplateResponse;
import com.example.demo.service.ProductTypeTemplateService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product-type-templates")
@CrossOrigin(origins = "*")
public class ProductTypeTemplateController {

    private final ProductTypeTemplateService templateService;

    public ProductTypeTemplateController(ProductTypeTemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping
    public ResponseEntity<List<ProductTypeTemplateResponse>> getAll() {
        return ResponseEntity.ok(templateService.getAll());
    }

    @PostMapping
    public ResponseEntity<ProductTypeTemplateResponse> create(@RequestBody ProductTypeTemplateRequest req) {
        return ResponseEntity.ok(templateService.create(req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        templateService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
