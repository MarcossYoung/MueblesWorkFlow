// src/main/java/com/example/demo/service/FinanceService.java
package com.example.demo.service;

import com.example.demo.dto.FinanceDashboardResponse;
import com.example.demo.dto.FinanceKpis;
import com.example.demo.dto.FinanceSeries;
import com.example.demo.dto.MonthlyAmountRow;

import com.example.demo.repository.CostRepo;
import com.example.demo.repository.PaymentRepo;
import com.example.demo.repository.ProductRepo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.*;

@Service
public class FinanceService {

    private final ProductRepo productRepository;
    private final PaymentRepo paymentRepository;
    private final CostRepo costsRepository;

    public FinanceService(ProductRepo productRepository,
                          PaymentRepo paymentRepository,
                          CostRepo costsRepository) {
        this.productRepository = productRepository;
        this.paymentRepository = paymentRepository;
        this.costsRepository = costsRepository;
    }

    /**
     * Builds a full finance dashboard response for the given date range.
     *
     * Business rules:
     * - income: sum(product.precio) grouped by product.fechaEntrega (delivered revenue)
     * - cashflow: sum(payments.amount) grouped by payments.date (money-in)
     * - expenses: sum(costs.amount) grouped by costs.date (money-out)
     * - profit: income - expenses (per month + total KPI)
     */
    public FinanceDashboardResponse dashboard(java.time.LocalDate from, java.time.LocalDate to) {
        // 1) Fetch monthly aggregates from DB
        List<MonthlyAmountRow> incomeByMonth = safe(productRepository.incomeByMonth(from, to));
        List<MonthlyAmountRow> cashflowByMonth = safe(paymentRepository.cashflowByMonth(from, to));
        List<MonthlyAmountRow> expensesByDate = safe(costsRepository.expensesByDate(from, to));

        // 2) Normalize month keys and merge into a single ordered month set
        SortedSet<String> months = new TreeSet<>(Comparator.naturalOrder());
        incomeByMonth.forEach(r -> months.add(r.month()));
        cashflowByMonth.forEach(r -> months.add(r.month()));
        expensesByDate.forEach(r -> months.add(r.month()));

        // Optional: ensure we include every month between from..to, even if empty
        months.addAll(allMonthsBetween(from, to));

        Map<String, BigDecimal> incomeMap = toMap(incomeByMonth);
        Map<String, BigDecimal> cashflowMap = toMap(cashflowByMonth);
        Map<String, BigDecimal> expensesMap = toMap(expensesByDate);

        // 3) Build profitByMonth aligned to same month axis
        List<MonthlyAmountRow> profitByMonth = new ArrayList<>();
        List<MonthlyAmountRow> incomeAligned = new ArrayList<>();
        List<MonthlyAmountRow> cashflowAligned = new ArrayList<>();
        List<MonthlyAmountRow> expensesAligned = new ArrayList<>();

        for (String m : months) {
            BigDecimal inc = nz(incomeMap.get(m));
            BigDecimal cf = nz(cashflowMap.get(m));
            BigDecimal exp = nz(expensesMap.get(m));
            BigDecimal prof = inc.subtract(exp);

            incomeAligned.add(new MonthlyAmountRow(m, inc));
            cashflowAligned.add(new MonthlyAmountRow(m, cf));
            expensesAligned.add(new MonthlyAmountRow(m, exp));
            profitByMonth.add(new MonthlyAmountRow(m, prof));
        }

        // 4) KPI totals for the selected range
        BigDecimal totalIncome = sumValues(incomeAligned);
        BigDecimal totalCashflow = sumValues(cashflowAligned);
        BigDecimal totalExpenses = sumValues(expensesAligned);
        BigDecimal totalProfit = totalIncome.subtract(totalExpenses);

        FinanceKpis kpis = new FinanceKpis(totalIncome, totalCashflow, totalExpenses, totalProfit);
        FinanceSeries series = new FinanceSeries(incomeAligned, cashflowAligned, expensesAligned, profitByMonth);

        return new FinanceDashboardResponse(from, to, kpis, series);
    }

    // ---------- helpers ----------

    private static BigDecimal nz(BigDecimal v) {
        return v == null ? BigDecimal.ZERO : v;
    }

    private static List<MonthlyAmountRow> safe(List<MonthlyAmountRow> rows) {
        return rows == null ? List.of() : rows;
    }

    private static BigDecimal sumValues(List<MonthlyAmountRow> rows) {
        BigDecimal total = BigDecimal.ZERO;
        for (MonthlyAmountRow r : rows) total = total.add(nz(r.total()));
        return total;
    }

    private static Map<String, BigDecimal> toMap(List<MonthlyAmountRow> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (MonthlyAmountRow r : rows) {
            if (r == null || r.month() == null) continue;
            map.put(r.month(), nz(r.total()));
        }
        return map;
    }

    private static Set<String> allMonthsBetween(java.time.LocalDate from, java.time.LocalDate to) {
        if (from == null || to == null) return Set.of();
        YearMonth start = YearMonth.from(from);
        YearMonth end = YearMonth.from(to);

        Set<String> out = new HashSet<>();
        YearMonth cur = start;
        while (!cur.isAfter(end)) {
            out.add(cur.toString()); // "YYYY-MM"
            cur = cur.plusMonths(1);
        }
        return out;
    }
}
