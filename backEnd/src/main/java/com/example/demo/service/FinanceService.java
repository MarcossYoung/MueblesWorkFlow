package com.example.demo.service;

import com.example.demo.dto.FinanceDashboardResponse;
import com.example.demo.dto.MonthlyAmountRow;
import com.example.demo.model.Costs;
import com.example.demo.repository.CostRepo;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinanceService {

    private final ProductRepo productRepository;
    private final PaymentRepo paymentRepository;
    private final CostRepo costsRepository;

    public FinanceService(ProductRepo productRepository, PaymentRepo paymentRepository, CostRepo costsRepository) {
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
        this.costsRepository = costsRepository;
    }

    public FinanceDashboardResponse dashboard(LocalDate from, LocalDate to) {
        List<MonthlyAmountRow> incomeRows = safe(productRepository.incomeByMonth(from, to));
        List<MonthlyAmountRow> cashFlowRows = safe(paymentRepository.cashFlowByMonth(from, to));
        List<MonthlyAmountRow> expenseRows = safe(costsRepository.expensesByDate(from, to));

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

        List<Map<String, Object>> userStats = getMonthlyUserStats(from, to);

        BigDecimal tInc = sumValues(incomeRows);
        BigDecimal tExp = sumValues(expenseRows);
        BigDecimal tDep = sumValues(cashFlowRows);
        BigDecimal tCogs = nz(productRepository.cogsByDateRange(from, to));
        BigDecimal grossProfit = tInc.subtract(tCogs);
        BigDecimal netProfit = grossProfit.subtract(tExp);

        return new FinanceDashboardResponse(
                from,
                to,
                tInc,
                tDep,
                tExp,
                tInc.subtract(tExp),  // tRev kept for backward compat
                expenseBreakdown,
                userStats,
                tCogs,
                grossProfit,
                netProfit
        );
    }

    public List<Map<String, Object>> getMonthlyUserStats(LocalDate from, LocalDate to) {
        return productRepository.getUserPerformanceData(from, to);
    }

    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private List<MonthlyAmountRow> safe(List<MonthlyAmountRow> rows) { return rows == null ? List.of() : rows; }

    private static BigDecimal sumValues(List<MonthlyAmountRow> rows) {
        BigDecimal total = BigDecimal.ZERO;
        for (MonthlyAmountRow r : rows) {
            total = total.add(nz(r.getTotal()));
        }
        return total;
    }
}
