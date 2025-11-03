package com.example.demo.repository;


import com.example.demo.model.Status;
import com.example.demo.model.WorkOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkOrderRepo extends JpaRepository<WorkOrder, Long> {
    @Query("""
    SELECT w 
    FROM WorkOrder w 
    JOIN FETCH w.product p
    WHERE w.status LIKE (:status)
""")
    List<WorkOrder> findByStatus(@Param("status") Status status);

    Optional<WorkOrder> findByProductId(Long productId);


    @Query("""
    SELECT COUNT(w)
    FROM WorkOrder w
    JOIN w.product p
    WHERE p.fechaEntrega BETWEEN :today AND :endOfWeek
""")
    long countFechaEntrega(@Param("today") LocalDate today, @Param("endOfWeek") LocalDate endOfWeek);



}
