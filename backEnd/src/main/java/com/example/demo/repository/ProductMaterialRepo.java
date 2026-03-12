package com.example.demo.repository;

import com.example.demo.model.ProductMaterial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductMaterialRepo extends JpaRepository<ProductMaterial, Long> {

    List<ProductMaterial> findByProduct_Id(Long productId);

    void deleteByProduct_IdAndId(Long productId, Long materialId);
}
