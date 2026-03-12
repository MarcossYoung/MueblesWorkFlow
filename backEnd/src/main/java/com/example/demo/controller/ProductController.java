package com.example.demo.controller;

import com.example.demo.dto.ProductCreateRequest;
import com.example.demo.dto.ProductMaterialRequest;
import com.example.demo.dto.ProductMaterialResponse;
import com.example.demo.dto.ProductResponse;
import com.example.demo.dto.ProductUpdateDto;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.model.Product;
import com.example.demo.model.ProductType;
import com.example.demo.service.AppUserService;
import com.example.demo.service.FileStorageService;
import com.example.demo.service.ProductMaterialService;
import com.example.demo.service.ProductService;
import com.example.demo.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

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

    @Autowired
    private ProductMaterialService productMaterialService;


    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        Page<ProductResponse> products = productService.getAll(pageable);
        return ResponseEntity.ok(products);
    }


    @GetMapping("/search")
    public ResponseEntity<Page<ProductResponse>> searchProducts(
            @RequestParam String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        return ResponseEntity.ok(productService.searchByTitle(q, pageable));
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


    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadProductImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        String name = file.getOriginalFilename() != null ? file.getOriginalFilename() : "";
        String ext = name.contains(".") ? name.substring(name.lastIndexOf('.') + 1).toLowerCase() : "";
        if (!Set.of("jpg", "jpeg", "png", "webp").contains(ext)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Solo se permiten jpg, jpeg, png, webp"));
        }
        try {
            String url = fileStorageService.saveFile(file);
            ProductUpdateDto dto = new ProductUpdateDto();
            dto.setFoto(url);
            return ResponseEntity.ok(productService.update(id, dto));
        } catch (IOException | ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al guardar imagen"));
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

    @GetMapping("/filter")
    public ResponseEntity<Page<ProductResponse>> filterProducts(
            @RequestParam(required = false) String titulo,
            @RequestParam(required = false) String productType,
            @RequestParam(required = false) String material,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String workOrderStatus,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "startDate"));
        return ResponseEntity.ok(productService.searchWithFilters(
                titulo, productType, material, color, workOrderStatus, from, to, pageable));
    }

    @GetMapping("/{id}/materials")
    public ResponseEntity<List<ProductMaterialResponse>> getMaterials(@PathVariable Long id) {
        return ResponseEntity.ok(productMaterialService.getMaterialsForProduct(id));
    }

    @PostMapping("/{id}/materials")
    public ResponseEntity<ProductMaterialResponse> addMaterial(
            @PathVariable Long id,
            @RequestBody ProductMaterialRequest req
    ) {
        return ResponseEntity.ok(productMaterialService.addMaterial(id, req));
    }

    @DeleteMapping("/{id}/materials/{materialId}")
    public ResponseEntity<Void> removeMaterial(
            @PathVariable Long id,
            @PathVariable Long materialId
    ) {
        productMaterialService.removeMaterial(id, materialId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/cogs")
    public ResponseEntity<Map<String, Object>> getCogs(@PathVariable Long id) throws ResourceNotFoundException {
        BigDecimal calculated = productMaterialService.calculateCogs(id);
        ProductResponse product = productService.getById(id);
        BigDecimal manual = product.cogsAmount();
        BigDecimal effective = (manual != null && manual.compareTo(BigDecimal.ZERO) > 0) ? manual : calculated;
        return ResponseEntity.ok(Map.of(
                "calculated", calculated,
                "manual", manual != null ? manual : BigDecimal.ZERO,
                "effective", effective
        ));
    }

}
