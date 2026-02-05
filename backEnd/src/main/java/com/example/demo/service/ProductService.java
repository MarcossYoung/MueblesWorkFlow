package com.example.demo.service;

import com.example.demo.dto.ProductCreateRequest;
import com.example.demo.dto.ProductResponse;
import com.example.demo.dto.ProductUpdateDto;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.model.*;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import com.example.demo.repository.WorkOrderRepo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepo productRepo;
    private final WorkOrderRepo workOrderRepo;
    private final AppUserService userService;
    private final PaymentRepo orderPaymentsRepo;

    public ProductService(ProductRepo productRepo,
                          WorkOrderRepo workOrderRepo,
                          AppUserService userService,
                          PaymentRepo orderPaymentsRepo) {
        this.productRepo = productRepo;
        this.workOrderRepo = workOrderRepo;
        this.userService = userService;
        this.orderPaymentsRepo = orderPaymentsRepo;
    }

    // ---------------- CREATE ----------------

    public ProductResponse createProduct(ProductCreateRequest req) {
        Product p = new Product();

        p.setTitulo(req.titulo());
        p.setProductType(req.productType());
        p.setMedidas(req.medidas());
        p.setMaterial(req.material());
        p.setPintura(req.pintura());
        p.setColor(req.color());
        p.setLaqueado(req.laqueado());
        p.setCantidad(req.cantidad() != null ? req.cantidad() : 0L);
        // if you’re using precio in Product, set it here:
        p.setPrecio(req.precio());
        p.setStartDate(LocalDate.now());
        p.setFechaEntrega(req.fechaEntrega());
        p.setFechaEstimada(LocalDate.now().plusDays(35));
        p.setFoto(req.foto());
        p.setNotas(req.notas());
        p.setOwner(userService.getCurrentUser());
        p.setClientEmail(req.clientEmail());

        Product saved = productRepo.save(p);

        //WorkOrder Creation
        WorkOrder wo = new WorkOrder();
        wo.setProduct(saved);
        wo.setStatus(Status.CREADO);
        wo.setUpdateAt(LocalDateTime.now());

        workOrderRepo.save(wo); // Save the WorkOrder

        saved.setWorkOrder(wo);

        // ----- CREATE PAYMENT: DEPOSIT -----
        if (req.amount() != null) {
            OrderPayments deposit = new OrderPayments();
            deposit.setProduct(saved);
            deposit.setPaymentType(PaymentType.DEPOSIT);
            deposit.setAmount(req.amount());

            LocalDate depositDate =
                    (req.startDate() != null) ? req.startDate() : LocalDate.now();
            deposit.setPaymentDate(depositDate);

            // you can set pagoStatus if you want an initial value:
            // deposit.setPagoStatus(PaymentStatus.PAID); or PENDING

            orderPaymentsRepo.save(deposit);
        }

        return ProductResponse.from(saved);
    }

    // ---------------- READ (unchanged) ----------------

    public ProductResponse getById(long id) throws ResourceNotFoundException {
        Product p = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));
        return ProductResponse.from(p);
    }

    public Page<ProductResponse> getAll(Pageable pageable) {
        return productRepo.findAll(pageable).map(ProductResponse::from);
    }


    public Page<ProductResponse> findByType(ProductType productType, Pageable pageable) {
        return productRepo.findByProductType(productType, pageable).map(ProductResponse::from);
    }

    // ---------------- UPDATE ----------------

    public ProductResponse update(Long id, ProductUpdateDto dto) throws ResourceNotFoundException {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        applyProductUpdates(product, dto);

        Product saved = productRepo.save(product);

        // ----- CREATE PAYMENT: RESTO -----
        // For updates, dto.deposit = remainder
        if (dto.getAmount() != null) {
            OrderPayments pago = new OrderPayments();
            pago.setProduct(saved);
            pago.setPaymentType(dto.getPaymentType());
            pago.setAmount(dto.getAmount());
            pago.setPaymentDate(LocalDate.now()); // or saved.getFechaEntrega()

            // resto.setPagoStatus(PaymentStatus.PAID);

            orderPaymentsRepo.save(pago);
        }

        return ProductResponse.from(saved);
    }

    private void applyProductUpdates(Product product, ProductUpdateDto dto) {
        if (dto.getTitulo() != null) product.setTitulo(dto.getTitulo());
        if (dto.getProductType() != null) product.setProductType(dto.getProductType());
        if (dto.getMedidas() != null) product.setMedidas(dto.getMedidas());
        if (dto.getMaterial() != null) product.setMaterial(dto.getMaterial());
        if (dto.getPintura() != null) product.setPintura(dto.getPintura());
        if (dto.getColor() != null) product.setColor(dto.getColor());
        if (dto.getLaqueado() != null) product.setLaqueado(dto.getLaqueado());
        if (dto.getNotas() != null) product.setNotas(dto.getNotas());
        if (dto.getFoto() != null) product.setFoto(dto.getFoto());
        if (dto.getCantidad() != null) product.setCantidad(dto.getCantidad());

        if (dto.getFechaEstimada() != null && !dto.getFechaEstimada().isBlank()) {
            product.setFechaEstimada(LocalDate.parse(dto.getFechaEstimada()));
        }

        WorkOrder wo = product.getWorkOrder();
        if (wo != null) {
            if (dto.getStatus() != null) wo.setStatus(dto.getStatus());
            wo.setUpdateAt(LocalDateTime.now());
        }
    }

    // ---------------- DELETE ----------------

    public boolean delete(Long id) throws ResourceNotFoundException {
        Product product = productRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with ID: " + id));

        workOrderRepo.findByProductId(id).ifPresent(workOrderRepo::delete);

        // delete ALL payments for this product (OneToMany)
        List<OrderPayments> payments = orderPaymentsRepo.findAllByProductId(id);
        if (!payments.isEmpty()) {
            orderPaymentsRepo.deleteAll(payments);
        }

        productRepo.delete(product);
        return false;
    }

    public void guardar(Product p) {
        productRepo.save(p);
    }
    public List<ProductResponse> getProductsDueThisWeek() {
        LocalDate today = LocalDate.now();
        LocalDate endOfWeek = today.plusDays(7);

        // 1. Get the List<Product> from the Repo
        List<Product> products = productRepo.findByFechaEstimadaBetween(today, endOfWeek);

        // 2. Convert each Product -> ProductResponse one by one
        return products.stream()
                .map(ProductResponse::from) // Use your static 'from' method
                .collect(Collectors.toList());
    }

    public long countOrders() {
        return productRepo.count();
    }



    public List<Object[]> findTopProducts() {
        return productRepo.findTopOrders();
    }
    public Product findByTitle(String title) { return productRepo.findByTitulo(title) .orElseThrow(() -> new RuntimeException("Product not found")); }

    public List<ProductResponse> getProductsPastDue() {

        List<Product> products = productRepo.findByWorkOrderStatus(Status.ATRASADO);

        // 2. Convert each Product -> ProductResponse one by one
        return products.stream()
                .map(ProductResponse::from) // Use your static 'from' method
                .collect(Collectors.toList());

    }
    public List<ProductResponse> getProductsNotPickedUp(){
        List<Product> products = productRepo.findByWorkOrderStatus(Status.TERMINADO);

        return products.stream()
                .map(ProductResponse::from) // Use your static 'from' method
                .collect(Collectors.toList());
    }
}
