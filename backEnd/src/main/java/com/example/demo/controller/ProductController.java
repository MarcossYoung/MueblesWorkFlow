package com.example.demo.controller;

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


    @GetMapping()
    public ResponseEntity<Page<Product>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) throws ResourceNotFoundException {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> products = productService.getAll(pageable);
        return ResponseEntity.ok(products);
    }


    @PostMapping("/create")
    public ResponseEntity<Product> createProduct(@RequestParam("titulo") String titulo,
                                                 @RequestParam("tipo") ProductType type,
                                                 @RequestParam("medida") String medida,
                                                 @RequestParam("material") String material,
                                                 @RequestParam("pintura") String pintura,
                                                 @RequestParam("color") String color,
                                                 @RequestParam("laqueado") String laqueado,
                                                 @RequestParam("cantidad") long cantidad,
                                                 @RequestParam("precio") double precio,
                                                 @RequestParam("foto") String foto,
                                                 @RequestParam("notas") String notas
                                                 ) {

        try {
            Product product = new Product();
            product.setTitulo(titulo);
            product.setProductType(type);
            product.setMedidas(medida);
            product.setMaterial(material);
            product.setPintura(pintura);
            product.setColor(color);
            product.setLaqueado(laqueado);
            product.setCantidad(cantidad);
            product.setPrecio(precio);
            product.setFoto(foto);
            product.setNotas(notas);
            product.setStartDate(LocalDate.now());
            product.setFechaEstimada(LocalDate.now().plusDays(35));
            product.setOwnerid(userService.getCurrentUser());


            Product savedProduct = productService.guardar(product);
            workOrderService.createForProduct(savedProduct);
            return ResponseEntity.ok(savedProduct);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProduct(@PathVariable Long id) {
        Product product = productService.buscar(id);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(product);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductUpdateDto dto
    ) {
        try {
            Product updated = productService.editar(id, dto);
            return ResponseEntity.ok(updated);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        if (productService.borrar(id)) {
            return ResponseEntity.noContent().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/due-this-week")
    public ResponseEntity<List<Product>> getProductsDueThisWeek() {
       List<Product> productsDueThisWeek = productService.getProductsDueThisWeek();
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

}
