package com.example.demo.service;

import com.example.demo.dto.ProductCreateRequest;
import com.example.demo.dto.ProductResponse;
import com.example.demo.dto.ProductUpdateDto;
import com.example.demo.exceptions.ResourceNotFoundException;
import com.example.demo.model.*;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import com.example.demo.repository.WorkOrderRepo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoField;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepo productRepo;
    private final WorkOrderRepo workOrderRepo;
    private final AppUserService userService;
    private final PaymentRepo orderPaymentsRepo;
    private final InventoryService inventoryService;
    private final ProductTypeTemplateService templateService;
    private final RestTemplate restTemplate;

    @Value("${n8n.webhook.product-created:}")
    private String n8nWebhookUrl;

    public ProductService(ProductRepo productRepo,
                          WorkOrderRepo workOrderRepo,
                          AppUserService userService,
                          PaymentRepo orderPaymentsRepo,
                          InventoryService inventoryService,
                          ProductTypeTemplateService templateService,
                          RestTemplate restTemplate) {
        this.productRepo = productRepo;
        this.workOrderRepo = workOrderRepo;
        this.userService = userService;
        this.orderPaymentsRepo = orderPaymentsRepo;
        this.inventoryService = inventoryService;
        this.templateService = templateService;
        this.restTemplate = restTemplate;
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
        p.setPrecio(req.precio());
        p.setStartDate(LocalDate.now());
        p.setFechaEntrega(req.fechaEntrega());
        p.setFechaEstimada(LocalDate.now().plusDays(35));
        p.setFoto(req.foto());
        p.setNotas(req.notas());
        AppUser owner = userService.getCurrentUser();
        if (owner == null) owner = userService.getFirstUser();
        p.setOwner(owner);
        p.setClientPhone(req.clientPhone());

        Product saved = productRepo.save(p);

        //WorkOrder Creation
        WorkOrder wo = new WorkOrder();
        wo.setProduct(saved);
        wo.setStatus(Status.CREADO);
        wo.setUpdateAt(LocalDateTime.now());

        workOrderRepo.save(wo);

        saved.setWorkOrder(wo);

        // Apply material templates for the product type
        templateService.applyTemplatesToProduct(saved);

        // ----- CREATE PAYMENT: DEPOSIT -----
        if (req.amount() != null) {
            OrderPayments deposit = new OrderPayments();
            deposit.setProduct(saved);
            deposit.setPaymentType("DEPOSIT");
            deposit.setAmount(req.amount());

            LocalDate depositDate =
                    (req.startDate() != null) ? req.startDate() : LocalDate.now();
            deposit.setPaymentDate(depositDate);

            orderPaymentsRepo.save(deposit);
        }

        // Fire N8N webhook (non-blocking, best-effort)
        fireN8nWebhook(saved);

        return ProductResponse.from(saved);
    }

    private void fireN8nWebhook(Product p) {
        if (n8nWebhookUrl == null || n8nWebhookUrl.isBlank()) return;
        try {
            Map<String, Object> payload = Map.of(
                "productId", p.getId(),
                "titulo", p.getTitulo() != null ? p.getTitulo() : "",
                "clientPhone", p.getClientPhone() != null ? p.getClientPhone() : "",
                "precio", p.getPrecio(),
                "startDate", p.getStartDate().toString(),
                "fechaEstimada", p.getFechaEstimada() != null ? p.getFechaEstimada().toString() : ""
            );
            restTemplate.postForObject(n8nWebhookUrl, payload, String.class);
        } catch (Exception e) {
            // log but don't fail product creation
        }
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
        if (dto.getAmount() != null) {
            OrderPayments pago = new OrderPayments();
            pago.setProduct(saved);
            pago.setPaymentType(dto.getPaymentType());
            pago.setAmount(dto.getAmount());
            pago.setPaymentDate(LocalDate.now());

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
        if (dto.getPrecio() != null) product.setPrecio(dto.getPrecio());
        if (dto.getClientPhone() != null) product.setClientPhone(dto.getClientPhone());
        if (dto.getCogsAmount() != null) product.setCogsAmount(dto.getCogsAmount());

        if (dto.getFechaEstimada() != null && !dto.getFechaEstimada().isBlank()) {
            product.setFechaEstimada(LocalDate.parse(dto.getFechaEstimada()));
        }
        if (dto.getFechaEntrega() != null && !dto.getFechaEntrega().isBlank()) {
            product.setFechaEntrega(LocalDate.parse(dto.getFechaEntrega()));
        }

        if (dto.getAssignedUserId() != null) {
            AppUser newOwner = userService.getUserById(dto.getAssignedUserId());
            if (newOwner != null) product.setOwner(newOwner);
        }

        WorkOrder wo = product.getWorkOrder();
        if (wo != null) {
            Status prev = wo.getStatus();
            if (dto.getWorkOrderStatus() != null) wo.setStatus(dto.getWorkOrderStatus());
            wo.setUpdateAt(LocalDateTime.now());

            if (Status.ENTREGADO.equals(dto.getWorkOrderStatus())
                    && !Status.ENTREGADO.equals(prev)) {
                inventoryService.deductMaterialsForProduct(product.getId());
            }
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
        return true;
    }

    public void guardar(Product p) {
        productRepo.save(p);
    }
    public List<ProductResponse> getProductsDueThisWeek() {
        LocalDate today = LocalDate.now().with(ChronoField.DAY_OF_WEEK, 1);
        LocalDate endOfWeek = today.plusDays(7);

        List<Product> products = productRepo.findByFechaEstimadaBetween(today, endOfWeek);

        return products.stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    public long countOrders() {
        return productRepo.count();
    }



    public List<Object[]> findTopProducts() {
        return productRepo.findTopOrders();
    }
    public Product findByTitle(String title) { return productRepo.findByTitulo(title) .orElseThrow(() -> new RuntimeException("Product not found")); }

    public Page<ProductResponse> searchByTitle(String query, Pageable pageable) {
        return productRepo.searchByTitulo(query, pageable).map(ProductResponse::from);
    }

    public List<ProductResponse> getProductsPastDue() {

        List<Product> products = productRepo.findByWorkOrderStatus(Status.ATRASADO);

        return products.stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());

    }
    public List<ProductResponse> getProductsNotPickedUp(){
        List<Product> products = productRepo.findByWorkOrderStatus(Status.TERMINADO);

        return products.stream()
                .map(ProductResponse::from)
                .collect(Collectors.toList());
    }

    public Page<ProductResponse> searchWithFilters(
            String titulo, String productTypeStr, String material, String color,
            String workOrderStatusStr, String from, String to, Pageable pageable) {

        ProductType productType = null;
        if (productTypeStr != null && !productTypeStr.isBlank()) {
            try { productType = ProductType.valueOf(productTypeStr.toUpperCase()); } catch (Exception ignored) {}
        }

        Status workOrderStatus = null;
        if (workOrderStatusStr != null && !workOrderStatusStr.isBlank()) {
            try { workOrderStatus = Status.valueOf(workOrderStatusStr.toUpperCase()); } catch (Exception ignored) {}
        }

        LocalDate fromDate = (from != null && !from.isBlank()) ? LocalDate.parse(from) : null;
        LocalDate toDate = (to != null && !to.isBlank()) ? LocalDate.parse(to) : null;

        String tituloParam = (titulo != null && !titulo.isBlank()) ? titulo : null;
        String materialParam = (material != null && !material.isBlank()) ? material : null;
        String colorParam = (color != null && !color.isBlank()) ? color : null;

        return productRepo.filterProducts(
                tituloParam, productType, materialParam, colorParam,
                workOrderStatus, fromDate, toDate, pageable
        ).map(ProductResponse::from);
    }
}
