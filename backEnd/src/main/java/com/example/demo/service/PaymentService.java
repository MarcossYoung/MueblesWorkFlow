package com.example.demo.service;

import com.example.demo.dto.CreatePaymentRequest;
import com.example.demo.dto.ProductPayments;
import com.example.demo.model.OrderPayments;
import com.example.demo.model.Product;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDate;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Set;

@Service
public class PaymentService {
    private final PaymentRepo orderPaymentsRepo;
    private final ProductRepo productRepo;

    @Value("${upload.receipts.path}")
    private String uploadPath;

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("jpg", "jpeg", "png", "pdf");

    public PaymentService(ProductRepo productRepo, PaymentRepo orderPaymentsRepo) {
        this.orderPaymentsRepo = orderPaymentsRepo;
        this.productRepo = productRepo;
    }

    public List<ProductPayments> getPayments(Long id) {
        return orderPaymentsRepo.findByProduct_Id(id)
                .stream()
                .map(ProductPayments::from)
                .toList();
    }

    public OrderPayments createPayment(CreatePaymentRequest req) {
        Product product = productRepo.findById(req.product_id())
                .orElseThrow(() -> new RuntimeException("Product not found"));

        OrderPayments payment = new OrderPayments();
        payment.setAmount(req.valor());
        payment.setPaymentType(req.type());
        payment.setPaymentDate(LocalDate.parse(req.fecha().replace('/', '-')));
        payment.setPaymentMethod(req.paymentMethod());
        payment.setProduct(product);

        return orderPaymentsRepo.save(payment);
    }

    public void uploadReceipt(Long paymentId, MultipartFile file) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isBlank()) {
            throw new IllegalArgumentException("File name is missing");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new IllegalArgumentException("File type not allowed. Accepted: jpg, jpeg, png, pdf");
        }

        OrderPayments payment = orderPaymentsRepo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Path dir = Paths.get(uploadPath);
        if (!Files.exists(dir)) {
            Files.createDirectories(dir);
        }

        String fileName = paymentId + "_" + originalFilename;
        Path destination = dir.resolve(fileName);
        Files.copy(file.getInputStream(), destination, StandardCopyOption.REPLACE_EXISTING);

        payment.setReceiptPath(destination.toString());
        orderPaymentsRepo.save(payment);
    }

    public Resource getReceiptResource(Long paymentId) throws MalformedURLException {
        OrderPayments payment = orderPaymentsRepo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        if (payment.getReceiptPath() == null) {
            throw new RuntimeException("No receipt found for this payment");
        }

        Path filePath = Paths.get(payment.getReceiptPath());
        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new RuntimeException("Receipt file not found or not readable");
        }
        return resource;
    }

    public String getReceiptFilename(Long paymentId) {
        OrderPayments payment = orderPaymentsRepo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        if (payment.getReceiptPath() == null) {
            throw new RuntimeException("No receipt for this payment");
        }
        return Paths.get(payment.getReceiptPath()).getFileName().toString();
    }
}
