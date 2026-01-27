package com.example.demo.controller;

import com.example.demo.dto.CreatePaymentRequest;
import com.example.demo.dto.ProductPayments;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.model.OrderPayments;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentsController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping("/{id}")
    public ResponseEntity<List<ProductPayments>> getPayments(@PathVariable Long id) throws ResourceNotFoundException {
        List<ProductPayments> payments= paymentService.getPayments(id);
        if (payments == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(payments);
    }
    @PostMapping
    public ResponseEntity<OrderPayments> createPayment(@RequestBody CreatePaymentRequest req) {
        OrderPayments p = paymentService.createPayment(req);
        return ResponseEntity.ok(p);
    }
}
