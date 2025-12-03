package com.example.demo.dto;

import com.example.demo.model.Product;
import com.example.demo.model.ProductType;
import com.example.demo.model.WorkOrder;

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
        Double precio,
        LocalDate startDate,
        LocalDate fechaEntrega,
        LocalDate fechaEstimada,
        String foto,
        String notas,
        Long ownerId,        // user id only, avoids lazy serialization
        WorkOrder workOrder// we expose the ID only (optional)
) {

    public static ProductResponse from(Product p) {
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
                p.getPrecio(),
                p.getStartDate(),
                p.getFechaEntrega(),
                p.getFechaEstimada(),
                p.getFoto(),
                p.getNotas(),
                p.getOwner() != null ? p.getOwner().getId() : null,
                p.getWorkOrder() != null ? p.getWorkOrder() : null
        );
    }
}
