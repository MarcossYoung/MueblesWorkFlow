package com.example.demo.service;

import com.example.demo.dto.ProductPayments;
import com.example.demo.model.OrderPayments;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {
    private final PaymentRepo orderPaymentsRepo;

    public PaymentService(ProductRepo productRepo, PaymentRepo orderPaymentsRepo) {
        this.orderPaymentsRepo = orderPaymentsRepo;
    }

    public ProductPayments getPayments(Long id){
        return  orderPaymentsRepo.findByProduct_Id(id);
    }
}
