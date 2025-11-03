package com.example.demo.service;

import com.example.demo.model.Product;
import com.example.demo.model.Status;
import com.example.demo.model.WorkOrder;
import com.example.demo.repository.WorkOrderRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class WorkOrderService {
    @Autowired
    private WorkOrderRepo workOrderRepository;

    public WorkOrder createForProduct(Product product) {
        WorkOrder order = new WorkOrder();
        order.setProduct(product);
        order.setStatus(Status.CREADO);
        return workOrderRepository.save(order);
    }

    public WorkOrder updateStatus(Long id, Status status) {
        WorkOrder workOrder = workOrderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("WorkOrder not found"));
        workOrder.setStatus(status);
        workOrder.setUpdateAt(LocalDateTime.now());
        return workOrderRepository.save(workOrder);
    }
    public List<WorkOrder> getAll() {
        return workOrderRepository.findAll();
    }

    public WorkOrder getByProductId(Long productId) {
        return workOrderRepository.findByProductId(productId)
                .orElseThrow(() -> new RuntimeException("WorkOrder not found for product ID " + productId));
    }

    public long countByType(Status type){
        return workOrderRepository.findByStatus(type).size();
    }

    public long countDueBetween(LocalDate today, LocalDate endOfWeek) {
        return workOrderRepository.countFechaEntrega(today,endOfWeek);
    }

    public List<WorkOrder> getLateProducts() {
        return  workOrderRepository.findByStatus(Status.ATRASADO);
    }


    public Map<String, Long> countOrdersByStatus() {
        return workOrderRepository.findAll().stream()
                .collect(Collectors.groupingBy(w -> w.getStatus().name(), Collectors.counting()));
    }

}
