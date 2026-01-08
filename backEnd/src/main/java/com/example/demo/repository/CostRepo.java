package com.example.demo.repository;

import com.example.demo.dto.MonthlyAmountRow;
import com.example.demo.model.CostType;
import com.example.demo.model.Costs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface CostRepo extends JpaRepository<Costs, Long> {

    // Fix: Using 'date' to match the model
    List<Costs> findByDateBetween(LocalDate from, LocalDate to);

    // 1. Fixed JPQL: Changed e.paymentDate to e.date
    @Query("SELECT new com.example.demo.dto.MonthlyAmountRow(CAST(e.date AS string), SUM(e.amount)) " +
            "FROM Costs e " +
            "WHERE e.date >= :from AND e.date <= :to " +
            "GROUP BY e.date")
    List<MonthlyAmountRow> expensesByDate(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // 2. Fixed JPQL: Changed e.paymentDate to e.date
    @Query("SELECT SUM(e.amount) FROM Costs e WHERE e.date >= :from AND e.date <= :to")
    BigDecimal expensesTotal(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // 3. Native Query: Changed 'c.fechapago' to 'c.fecha' and 'c.valor' to 'c.valor' (column names)
    @Query(value = """
        SELECT to_char(date_trunc('month', c.fecha), 'YYYY-MM') AS month,
               COALESCE(SUM(c.valor), 0) AS total
        FROM costos c
        WHERE c.tipo = :type
          AND c.fecha BETWEEN :from AND :to
        GROUP BY 1
        ORDER BY 1
        """, nativeQuery = true)
    List<Object[]> expensesByMonthForCostTypeRaw(@Param("type") String type,
                                                 @Param("from") LocalDate from,
                                                 @Param("to") LocalDate to);
}