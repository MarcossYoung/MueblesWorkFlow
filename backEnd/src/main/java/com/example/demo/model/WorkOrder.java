package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.IdentifierLoadAccess;

import java.time.LocalDateTime;


@Entity
@Getter
@Setter
@Table(name = "work_orders")
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    @JsonBackReference
    private Product product;

    @Enumerated(EnumType.STRING )
    @Column(name="status")
    private Status status;

    private LocalDateTime updateAt;




}
