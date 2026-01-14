package com.example.demo.model;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Setter
@Getter
@Entity

    @Table(name = "products")
    public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "titulo")
    private String titulo;

    @Enumerated(EnumType.STRING )
    @Column(name="type")
    private ProductType productType;

    @Column(name = "medidas")
    private String medidas;

    @Column(name="material")
    private String material;

    @Column(name="pintura")
    private String pintura;

    @Column(name="color")
    private String color;

    @Column(name="laqueado")
    private String laqueado;

    @Column(name = "cantidad")
    private long cantidad;

    @Column(name = "startdate")
    private LocalDate startDate;

    @Column(name = "fechaentrega")
    private LocalDate fechaEntrega;

    @Column(name = "fechaestimada")
    private LocalDate fechaEstimada;

    @Column(name = "foto")
    private String foto;

    @Column(name = "notas")
    private String notas;

    @Column(name = "precio", nullable = false, precision = 12, scale = 2)
    private BigDecimal precio;


    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private WorkOrder workOrder;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderPayments> orderPayments;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerid",referencedColumnName = "id")
    @JsonIgnore
    private AppUser owner;




}
