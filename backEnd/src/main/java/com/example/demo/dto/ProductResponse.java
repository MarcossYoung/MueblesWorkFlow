package com.example.demo.dto;

import com.example.demo.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

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
        BigDecimal daysLate
) {

    public static ProductResponse from(Product p) {
        WorkOrder wo = p.getWorkOrder();

        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal depositPaid = BigDecimal.ZERO;


        if (p.getOrderPayments() != null) {
            for (OrderPayments pay : p.getOrderPayments()) {
                // Ensure we use the correct getter (check if it's getValor() or getAmount())
                BigDecimal amount = pay.getAmount();
                if (amount != null) {
                    totalPaid = totalPaid.add(amount);

                    // Check payment type for deposit
                    if (pay.getPaymentType() == PaymentType.DEPOSIT) {
                        depositPaid = depositPaid.add(amount);
                    }
                }
            }
        }
        BigDecimal daysLate = null;
        if (wo.getUpdateAt() != null && wo.getStatus()== Status.TERMINADO || wo.getStatus() == Status.ATRASADO) {
            daysLate = BigDecimal.valueOf(ChronoUnit.DAYS.between(
                    wo.getUpdateAt(),
                    java.time.LocalDateTime.now()
            ));
        }

        return new ProductResponse(
                p.getId(),
                p.getTitulo(),
                p.getProductType(), // Ensure this matches ProductType in your Model
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
                p.getOwner().getId(), // Changed from p.getOwner().getId() to be safer
                wo.getId(),
                wo.getStatus(),
                totalPaid,
                depositPaid,
                daysLate
        );
    }
    }

