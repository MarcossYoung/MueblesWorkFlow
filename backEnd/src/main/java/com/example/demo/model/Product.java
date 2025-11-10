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
    @SequenceGenerator(name = "id",sequenceName = "prodSequence",allocationSize = 1)
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "prodSequence")
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

    @Column(name = "startDate")
    private LocalDate startDate;

    @Column(name = "fechaEntrega")
    private LocalDate fechaEntrega;

    @Column(name = "fechaEstimada")
    private LocalDate fechaEstimada;

    @Column(name = "foto")
    private String foto;

    @Column(name = "notas")
    private String notas;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private WorkOrder workOrder;

    @ManyToOne( fetch = FetchType.LAZY)
    @JoinColumn(name = "ownerId")
    private AppUser owner;


}
