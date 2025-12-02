package com.example.demo.repository;

import com.example.demo.model.Product;
import com.example.demo.model.ProductType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    // Find products by type
    Page<Product> findByProductType(ProductType type, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findById(@Param("id") Long id);


    @Query("SELECT p FROM Product p WHERE LOWER(p.titulo) LIKE LOWER(CONCAT('%', :query)) ")
    Page<Product> searchByTitulo(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.titulo) LIKE LOWER(:titulo)")
    Optional<Product> findByTitulo(@Param("titulo") String titulo);



    List<Product> findByFechaEstimadaBetween(LocalDate today, LocalDate endOfWeek);


   @Query("""
               SELECT w.status, COUNT(p)
               FROM Product p
               JOIN WorkOrder w ON w.product = p
               GROUP BY w.status""")
   List<Object[]> findTopOrders();

}

