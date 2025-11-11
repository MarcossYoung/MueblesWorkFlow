package com.example.demo.dto;

import com.example.demo.model.ProductType;
import com.example.demo.model.Status;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ProductUpdateDto {

    // PRODUCT fields
    private String titulo;
    private ProductType productType;
    private String medidas;
    private String material;
    private String pintura;
    private String color;
    private String laqueado;
    private Long cantidad;
    private Double precio;
    private String notas;
    private String foto;
    private String fechaEstimada; // "2025-01-15"

    // WORK ORDER fields
    private Status status;
    private String workOrderNotes;
}
