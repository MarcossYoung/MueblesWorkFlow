package com.example.demo.model;


import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

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

    @Column(name = "precio")
    private Double precio;

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

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private WorkOrder workOrder;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerid")
    private AppUser owner;


}
