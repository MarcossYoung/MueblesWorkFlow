package com.example.demo.repository;

import com.example.demo.model.ProductType;
import com.example.demo.model.ProductTypeTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductTypeTemplateRepo extends JpaRepository<ProductTypeTemplate, Long> {
    List<ProductTypeTemplate> findByProductType(ProductType productType);
}
