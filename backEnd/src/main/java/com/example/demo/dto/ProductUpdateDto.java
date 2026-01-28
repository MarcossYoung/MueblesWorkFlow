package com.example.demo.dto;

import com.example.demo.model.PaymentType;
import com.example.demo.model.ProductType;
import com.example.demo.model.Status;
import lombok.Getter;
import lombok.Setter;
import org.springframework.cglib.core.Local;

import java.math.BigDecimal;
import java.time.LocalDate;

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
    private BigDecimal precio;
    private String notas;
    private String foto;
    private String fechaEstimada;// "2025-01-15"
    private String fechaEntregada;


    // WORK ORDER fields
    private Status status;
    private String workOrderNotes;

    //Payment fields
    private BigDecimal amount;
    private PaymentType paymentType;


}
