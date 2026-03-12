package com.example.demo.dto;

import com.example.demo.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

public record ProductResponse(
        Long id,
        String titulo,
        ProductType productType,
        String medidas,
        String material,
        String pintura,
        String color,
        String laqueado,
        Long cantidad,
        LocalDate startDate,
        LocalDate fechaEntrega,
        LocalDate fechaEstimada,
        String foto,
        String notas,
        BigDecimal precio,
        Long ownerId,
        Long workOrderId,
        Status workOrderStatus,
        BigDecimal totalPaid,
        BigDecimal depositPaid,
        BigDecimal daysLate,
        String clientEmail,
        BigDecimal cogsAmount,
        BigDecimal calculatedCogs,
        List<ProductMaterialResponse> materials
) {

    public static ProductResponse from(Product p) {
        WorkOrder wo = p.getWorkOrder();

        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal depositPaid = BigDecimal.ZERO;

        if (p.getOrderPayments() != null) {
            for (OrderPayments pay : p.getOrderPayments()) {
                BigDecimal amount = pay.getAmount();
                if (amount != null) {
                    totalPaid = totalPaid.add(amount);
                    if (pay.getPaymentType() == PaymentType.DEPOSIT) {
                        depositPaid = depositPaid.add(amount);
                    }
                }
            }
        }

        BigDecimal daysLate = null;
        if (wo.getUpdateAt() != null && wo.getStatus() == Status.TERMINADO || wo.getStatus() == Status.ATRASADO) {
            daysLate = BigDecimal.valueOf(ChronoUnit.DAYS.between(
                    wo.getUpdateAt(),
                    java.time.LocalDateTime.now()
            ));
        }

        List<ProductMaterialResponse> materialResponses = null;
        BigDecimal calculatedCogs = BigDecimal.ZERO;
        if (p.getMaterials() != null) {
            materialResponses = p.getMaterials().stream()
                    .map(ProductMaterialResponse::from)
                    .collect(Collectors.toList());
            calculatedCogs = materialResponses.stream()
                    .map(ProductMaterialResponse::subtotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        return new ProductResponse(
                p.getId(),
                p.getTitulo(),
                p.getProductType(),
                p.getMedidas(),
                p.getMaterial(),
                p.getPintura(),
                p.getColor(),
                p.getLaqueado(),
                p.getCantidad(),
                p.getStartDate(),
                p.getFechaEntrega(),
                p.getFechaEstimada(),
                p.getFoto(),
                p.getNotas(),
                p.getPrecio(),
                p.getOwner().getId(),
                wo.getId(),
                wo.getStatus(),
                totalPaid,
                depositPaid,
                daysLate,
                p.getClientEmail(),
                p.getCogsAmount(),
                calculatedCogs,
                materialResponses
        );
    }
}
