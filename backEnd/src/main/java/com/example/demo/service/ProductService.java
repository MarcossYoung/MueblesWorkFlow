package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.model.ProductType;
import com.example.demo.model.Status;
import com.example.demo.model.WorkOrder;
import com.example.demo.repository.ProductRepo;
import com.example.demo.repository.WorkOrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepo productRepo;
    @Autowired
    private final WorkOrderRepo workOrderRepo;

    @Autowired
    public ProductService(ProductRepo productRepo, WorkOrderRepo workOrderRepo) {
        this.productRepo = productRepo;
        this.workOrderRepo = workOrderRepo;
    }

    private final String UPLOAD_DIR = "uploads/";

    public Product guardar(Product p) {
        return productRepo.save(p);
    }


    public Product buscar(long id) throws RuntimeException {
        return productRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with ID: " + id));
    }

    public void editar(Long id, Product product) {
        Product existingProduct = productRepo.findById(id).orElse(null);
        if (existingProduct != null) {
            existingProduct.setTitulo(product.getTitulo());
            existingProduct.setMedidas(product.getMedidas());
            existingProduct.setMaterial(product.getMaterial());
            existingProduct.setPintura(product.getPintura());
            existingProduct.setColor(product.getColor());
            existingProduct.setLaqueado(product.getLaqueado());
            existingProduct.setCantidad(product.getCantidad());
            existingProduct.setFoto(product.getFoto());
            existingProduct.setNotas(product.getNotas());
            productRepo.save(existingProduct); // Save the updated product
        } else {
            throw new RuntimeException("No se pudo editar");
        }
    }

    public boolean borrar(Long id) {
        Optional<Product> productOpt = productRepo.findById(id);
        Optional<WorkOrder> workOrderOpt = workOrderRepo.findByProductId(id);
        if (productOpt.isPresent() && workOrderOpt.isPresent() ) {
            workOrderRepo.delete(workOrderOpt.get());
            productRepo.delete(productOpt.get());
            return true;
        }
        throw new RuntimeException("Product with ID " + id + " not found");
    }


    public Page<Product> findByType(ProductType productType, Pageable pageable) {
        return productRepo.findByProductType(productType, pageable);
    }


    public List<Product> getProductsDueThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.plusDays(7);
        return productRepo.findByFechaEstimadaBetween(today, endOfWeek);
    }

    public Product findByTitle(String title) {
        return productRepo.findByTitulo(title)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    public long countOrders() {
        return productRepo.count();
    }


    public List<Object[]> findTopProducts() {
        return productRepo.findTopOrders();
    }



    public Page<Product> getAll(Pageable pageable) {
        return productRepo.findAll(pageable);
    }

}