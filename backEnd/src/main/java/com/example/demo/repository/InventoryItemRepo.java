package com.example.demo.repository;

import com.example.demo.model.InventoryItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InventoryItemRepo extends JpaRepository<InventoryItem, Long> {

    Page<InventoryItem> findByNameContainingIgnoreCase(String name, Pageable pageable);

    @Query(value = "SELECT * FROM inventory_items WHERE quantity <= min_stock", nativeQuery = true)
    List<InventoryItem> findLowStockItems();
}
