package com.example.demo.service;

import com.example.demo.dto.ProductUpdateDto;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.model.Product;
import com.example.demo.model.ProductType;
import com.example.demo.model.WorkOrder;
import com.example.demo.repository.ProductRepo;
import com.example.demo.repository.WorkOrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.time.LocalDate;
import java.time.LocalDateTime;
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

    public Product editar(Long id, ProductUpdateDto dto) throws ResourceNotFoundException {
            Product product = productRepo.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

            // --- Update product fields ---
            if (dto.getTitulo() != null) product.setTitulo(dto.getTitulo());
            if (dto.getProductType() != null) product.setProductType(dto.getProductType());
            if (dto.getMedidas() != null) product.setMedidas(dto.getMedidas());
            if (dto.getMaterial() != null) product.setMaterial(dto.getMaterial());
            if (dto.getPintura() != null) product.setPintura(dto.getPintura());
            if (dto.getColor() != null) product.setColor(dto.getColor());
            if (dto.getLaqueado() != null) product.setLaqueado(dto.getLaqueado());
            if (dto.getCantidad() != null) product.setCantidad(dto.getCantidad());
            if (dto.getPrecio() != null) product.setPrecio(dto.getPrecio());
            if (dto.getNotas() != null) product.setNotas(dto.getNotas());
            if (dto.getFoto() != null) product.setFoto(dto.getFoto());

            if (dto.getFechaEstimada() != null)
                product.setFechaEstimada(LocalDate.parse(dto.getFechaEstimada()));

            // --- Update work order ---
            WorkOrder wo = product.getWorkOrder();
            if (wo != null) {
                if (dto.getStatus() != null) wo.setStatus(dto.getStatus());
                wo.setUpdateAt(LocalDateTime.now());
            }

            productRepo.save(product);
            return product;
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