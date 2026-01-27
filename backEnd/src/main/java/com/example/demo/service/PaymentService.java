package com.example.demo.service;

import com.example.demo.dto.CreatePaymentRequest;
import com.example.demo.dto.ProductPayments;
import com.example.demo.model.OrderPayments;
import com.example.demo.model.Product;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {
    private final PaymentRepo orderPaymentsRepo;
    private final ProductRepo productRepo;

    public PaymentService(ProductRepo productRepo, PaymentRepo orderPaymentsRepo) {
        this.orderPaymentsRepo = orderPaymentsRepo;
        this.productRepo = productRepo;
    }

    public ProductPayments getPayments(Long id){
        return  orderPaymentsRepo.findByProduct_Id(id);
    }
    public OrderPayments createPayment(CreatePaymentRequest req) {
        // 1. Validate and Fetch the Product
        Product product = productRepo.findById(req.product_id())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        // 2. Create the Entity manually
        OrderPayments payment = new OrderPayments();
        payment.setAmount(req.valor());
        payment.setPaymentType(req.type()); // Ensure your Enum/String matches
        payment.setPagoStatus(req.pagostatus());
        payment.setPaymentDate(req.fecha());

        // 3. Link the Relationship
        payment.setProduct(product);

        // 4. Save
        return orderPaymentsRepo.save(payment);
    }
}
