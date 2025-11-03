package com.example.demo.controller;

import com.example.demo.model.Product;
import com.example.demo.model.Status;
import com.example.demo.model.WorkOrder;
import com.example.demo.service.ProductService;
import com.example.demo.service.WorkOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workorders")
@CrossOrigin(origins = "http://localhost:3000")
public class WorkOrderController {

    @Autowired
    private WorkOrderService workOrderService;

    @Autowired
    private ProductService productService;

    @PostMapping("/create/{productId}")
    public ResponseEntity<WorkOrder> createWorkOrder(@PathVariable Long productId) {
        Product product = productService.buscar(productId);
        WorkOrder workOrder = workOrderService.createForProduct(product);
        return ResponseEntity.ok(workOrder);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<WorkOrder> updateStatus(
            @PathVariable Long id,
            @RequestParam Status status
    ) {
        WorkOrder updated = workOrderService.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<List<WorkOrder>> getAll() {
        return ResponseEntity.ok(workOrderService.getAll());
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<WorkOrder> getByProduct(@PathVariable Long productId) {
        return ResponseEntity.ok(workOrderService.getByProductId(productId));
    }
    @GetMapping("/late")
    public ResponseEntity<List<WorkOrder>> getLateProducts(){
        List<WorkOrder> lateProducts = workOrderService.getLateProducts();
        return ResponseEntity.ok(lateProducts);
    }

    @GetMapping("/statuses")
    public ResponseEntity<Status []> getAllStatus(){return ResponseEntity.ok(Status.values());
    }
}
