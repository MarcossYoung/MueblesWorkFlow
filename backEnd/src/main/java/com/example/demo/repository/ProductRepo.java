package com.example.demo.repository;

import com.example.demo.dto.MonthlyAmountRow;
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
import java.util.Map;
import java.util.Optional;

@Repository
public interface ProductRepo extends JpaRepository<Product, Long> {

    // Find products by type
    Page<Product> findByProductType(ProductType type, Pageable pageable);

    @Query(value = """
    SELECT to_char(date_trunc('month', p.startdate), 'YYYY-MM') AS month,
           COALESCE(SUM(p.precio), 0) AS total
    FROM products p
    WHERE p.startdate BETWEEN :from AND :to 
    GROUP BY 1
    ORDER BY 1
    """, nativeQuery = true)
    List<MonthlyAmountRow> incomeByMonth(@Param("from") LocalDate from,
                                         @Param("to") LocalDate to);


    @Query("SELECT p FROM Product p WHERE LOWER(p.titulo) LIKE LOWER(CONCAT('%', :query)) ")
    Page<Product> searchByTitulo(@Param("query") String query, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE LOWER(p.titulo) LIKE LOWER(:titulo)")
    Optional<Product> findByTitulo(@Param("titulo") String titulo);


    @Query(value = """
            SELECT u.username as "userName",
                COALESCE(SUM(p.cantidad), 0) as "unitsSold",
                COALESCE(SUM(p.precio), 0) as "income"
            FROM products p
            JOIN usuarios u ON p.ownerid = u.id
            WHERE p.startdate >= :from AND p.startdate <= :to
            GROUP BY u.username
            """, nativeQuery = true)
    List<Map<String, Object>> getUserPerformanceData(@Param("from") LocalDate from, @Param("to") LocalDate to);

    List<Product> findByFechaEstimadaBetween(LocalDate today, LocalDate endOfWeek);


   @Query("""
               SELECT w.status, COUNT(p)
               FROM Product p
               JOIN WorkOrder w ON w.product = p
               GROUP BY w.status""")
   List<Object[]> findTopOrders();



}

