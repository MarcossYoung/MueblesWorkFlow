package com.example.demo.controller;

import com.example.demo.dto.ProductCreateRequest;
import com.example.demo.dto.ProductResponse;
import com.example.demo.dto.ProductUpdateDto;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.model.Product;
import com.example.demo.model.ProductType;
import com.example.demo.service.AppUserService;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.ProductService;
import com.example.demo.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private AppUserService userService;

    @Autowired
    private WorkOrderService workOrderService;


    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductResponse> products = productService.getAll(pageable);
        return ResponseEntity.ok(products);
    }


    @PostMapping("/create")
    public ResponseEntity<ProductResponse> createProduct(
            @RequestBody ProductCreateRequest req
    ) {
        ProductResponse p = productService.createProduct(req);
        return ResponseEntity.ok(p);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProduct(@PathVariable Long id) throws ResourceNotFoundException {
        ProductResponse product = productService.getById(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductUpdateDto dto
    ) {
        try {
            ProductResponse updated = productService.update(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) throws ResourceNotFoundException {
        if (productService.delete(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/due-this-week")
    public ResponseEntity<List<ProductResponse>> getProductsDueThisWeek() {
       List<ProductResponse> productsDueThisWeek = productService.getProductsDueThisWeek();
        return ResponseEntity.ok(productsDueThisWeek);
    }

    @PostMapping("/add-existing")
    public ResponseEntity<Product> addExistingOrder(@RequestBody Map<String, String> request) {
        String titulo = request.get("titulo");
        Product product = productService.findByTitle(titulo);

        product.setFechaEstimada(LocalDate.now().plusDays(3)); // middle of this week
        productService.guardar(product);

        return ResponseEntity.ok(product);
    }


    @GetMapping("/types")
    public ResponseEntity<ProductType[]> getAllTypes() {
        return ResponseEntity.ok(ProductType.values());
    }

    @GetMapping("/past-due")
    public ResponseEntity<List<ProductResponse>> getProductsPastDue() {
        List<ProductResponse> productsDueThisWeek = productService.getProductsPastDue();
        return ResponseEntity.ok(productsDueThisWeek);
    }
    @GetMapping("/not-picked-up")
    public ResponseEntity<List<ProductResponse>> getProductsNotPickedUp() {
        List<ProductResponse> productsDueThisWeek = productService.getProductsNotPickedUp();
        return ResponseEntity.ok(productsDueThisWeek);
    }

}
