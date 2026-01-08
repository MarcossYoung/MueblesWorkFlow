package com.example.demo.repository;


import com.example.demo.dto.MonthlyAmountRow;
import com.example.demo.model.CostType;
import com.example.demo.model.OrderPayments;
import com.example.demo.model.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface PaymentRepo extends JpaRepository<OrderPayments, Long> {

    // All payments for a product (order)
    List<OrderPayments> findByProduct_IdOrderByPaymentDate(Long productId);


    List<OrderPayments> findByPaymentDateBetween(LocalDate from, LocalDate to);

    // Sum of cashflow by month (Postgres / Neon)
    @Query(value = """
        SELECT to_char(date_trunc('month', p.paymentDate), 'YYYY-MM') AS month,
               COALESCE(SUM(p.valor), 0) AS total
        FROM payments p
        WHERE p.date BETWEEN :from AND :to AND p.PaymentType == "DEPOSIT"
        GROUP BY 1
        ORDER BY 1
        """, nativeQuery = true)
    List<MonthlyAmountRow> cashflowByMonth(@Param("from") LocalDate from,
                                           @Param("to") LocalDate to);

    // Cashflow by month for only DEPOSIT (optional, but very useful)
    @Query(value = """
        SELECT to_char(date_trunc('month', p.paymentDate), 'YYYY-MM') AS month,
               COALESCE(SUM(p.valor), 0) AS total
        FROM pagos p
        WHERE p.type = 'DEPOSIT'
          AND p.date BETWEEN :from AND :to
        GROUP BY 1
        ORDER BY 1
        """, nativeQuery = true)
    List<MonthlyAmountRow> depositsByMonth(@Param("from") LocalDate from,
                                           @Param("to") LocalDate to);

    // Total cashflow in a range
    @Query(value = """
        SELECT COALESCE(SUM(p.valor), 0)
        FROM pagos p
        WHERE p.paymentDate BETWEEN :from AND :to
        """, nativeQuery = true)
    java.math.BigDecimal cashflowTotal(@Param("from") LocalDate from,
                                       @Param("to") LocalDate to);

    List<OrderPayments> findAllByProductId(Long id);
}
