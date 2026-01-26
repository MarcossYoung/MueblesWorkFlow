package com.example.demo.service;

import com.example.demo.dto.FinanceDashboardResponse;
import com.example.demo.dto.MonthlyAmountRow;
import com.example.demo.model.Costs;
import com.example.demo.repository.CostRepo;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinanceService {
    @Autowired
    private final ProductRepo productRepository;
    private final PaymentRepo paymentRepository;
    private final CostRepo costsRepository;


    public FinanceService(ProductRepo productRepository, PaymentRepo paymentRepository, CostRepo costsRepository) {
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
        this.costsRepository = costsRepository;
    }

    public FinanceDashboardResponse dashboard(LocalDate from, LocalDate to) {
        // 1) Fetch base data
        List<MonthlyAmountRow> incomeRows = safe(productRepository.incomeByMonth(from, to));
        List<MonthlyAmountRow> cashFlowRows = safe(paymentRepository.depositsByMonth(from, to)); // Fixed variable name to match use below
        List<MonthlyAmountRow> expenseRows = safe(costsRepository.expensesByDate(from, to));

        // 2) Fetch Expense Breakdown (Pie Chart Data)
        List<Costs> allCosts = costsRepository.findByDateBetween(from, to);

        Map<String, BigDecimal> breakdownMap = allCosts.stream()
                .filter(c -> c.getCostType() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getCostType().name(),
                        Collectors.mapping(Costs::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        List<Map<String, Object>> expenseBreakdown = new ArrayList<>();
        breakdownMap.forEach((name, value) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", name);
            item.put("value", nz(value));
            expenseBreakdown.add(item);
        });

        // 3) NEW: Fetch User Stats (Bar Chart Data)
        // This was MISSING in your previous service code
        List<Map<String, Object>> userStats = getMonthlyUserStats(from, to);

        // KPIs
        BigDecimal tInc = sumValues(incomeRows);
        BigDecimal tExp = sumValues(expenseRows);
        // Using cashflowTotal based on your previous code snippet
        BigDecimal tDep = sumValues(cashFlowRows);

        // 4) Return the Response matching your DTO order:
        // (from, to, income, deposits, spend, profit, expenseBreakdown, userStats)
        return new FinanceDashboardResponse(
                from,
                to,
                tInc,
                tDep,
                tExp,
                tInc.subtract(tExp),
                expenseBreakdown, // Pie Chart
                userStats         // Bar Chart (The critical fix)
        );
    }

    // Helper: Update this to accept arguments
    public List<Map<String, Object>> getMonthlyUserStats(LocalDate from, LocalDate to) {
        return productRepository.getUserPerformanceData(from, to);
    }

    // ... Keep your existing private helpers (nz, safe, sumValues, etc.) ...
    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private List<MonthlyAmountRow> safe(List<MonthlyAmountRow> rows) { return rows == null ? List.of() : rows; }

    private static BigDecimal sumValues(List<MonthlyAmountRow> rows) {
        BigDecimal total = BigDecimal.ZERO;
        for (MonthlyAmountRow r : rows) {
            // Assuming your interface uses getTotal()
            total = total.add(nz(r.getTotal()));
        }
        return total;
    }
}