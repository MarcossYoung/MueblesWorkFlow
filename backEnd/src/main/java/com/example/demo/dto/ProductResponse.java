package com.example.demo.dto;

import com.example.demo.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;

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
        Long ownerId,
        Long workOrderId,
        Status workOrderStatus,
        BigDecimal totalPaid,
        BigDecimal depositPaid
) {

    public static ProductResponse from(Product p) {
        WorkOrder wo = p.getWorkOrder();
        OrderPayments op = (OrderPayments) p.getOrderPayments();

        BigDecimal totalPaid = BigDecimal.ZERO;
        BigDecimal depositPaid = BigDecimal.ZERO;

        if (p.getOrderPayments() != null) {
            for (OrderPayments pay : p.getOrderPayments()) {
                if (pay.getAmount() != null) {
                    totalPaid = totalPaid.add(pay.getAmount());
                }
                if (pay.getPaymentType() == PaymentType.DEPOSIT && pay.getAmount() != null) {
                    depositPaid = depositPaid.add(pay.getAmount());
                }
            }
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
                p.getOwner() != null ? p.getOwner().getId() : null,
                wo != null ? wo.getId() : null,
                wo != null ? wo.getStatus() : null,
                totalPaid,
                depositPaid



        );
    }
}
