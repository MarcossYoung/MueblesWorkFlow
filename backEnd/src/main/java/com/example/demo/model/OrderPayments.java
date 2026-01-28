package com.example.demo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity

    @Table(name= "pagos")
    public class OrderPayments {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="product_id", nullable=false)
    private Product product;

    @Column(name = "type")
    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    @Column(name = "valor")
    private BigDecimal amount;


    @Column(name = "fecha")
    private LocalDate paymentDate;








}
