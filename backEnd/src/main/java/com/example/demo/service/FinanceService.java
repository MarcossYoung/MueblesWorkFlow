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
import java.time.YearMonth;
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
        // 1) Fetch data from DB
        List<MonthlyAmountRow> incomeRows = safe(productRepository.incomeByMonth(from, to));
        List<MonthlyAmountRow> cashflowRows = safe(paymentRepository.cashflowByMonth(from, to));
        List<MonthlyAmountRow> expenseRows = safe(costsRepository.expensesByDate(from, to));

        // 2) Generate complete month list for the range
        SortedSet<String> months = new TreeSet<>(allMonthsBetween(from, to));

        Map<String, BigDecimal> incomeMap = toMap(incomeRows);
        Map<String, BigDecimal> cashflowMap = toMap(cashflowRows);
        Map<String, BigDecimal> expensesMap = toMap(expenseRows);

        // 3) Build flat series for the Frontend
        List<Map<String, Object>> incomeSeries = new ArrayList<>();
        List<Map<String, Object>> depositSeries = new ArrayList<>();
        List<Map<String, Object>> profitSeries = new ArrayList<>();

        BigDecimal totalInc = BigDecimal.ZERO;
        BigDecimal totalDep = BigDecimal.ZERO;
        BigDecimal totalExp = BigDecimal.ZERO;

        for (String m : months) {
            BigDecimal inc = nz(incomeMap.get(m));
            BigDecimal dep = nz(cashflowMap.get(m));
            BigDecimal exp = nz(expensesMap.get(m));
            BigDecimal diff = inc.subtract(exp);

            // Keys MUST match BarChart valueKey in finances.jsx
            incomeSeries.add(Map.of("label", m, "income", inc));
            depositSeries.add(Map.of("label", m, "deposits", dep));
            profitSeries.add(Map.of("label", m, "diff", diff));

            totalInc = totalInc.add(inc);
            totalDep = totalDep.add(dep);
            totalExp = totalExp.add(exp);
        }

        return new FinanceDashboardResponse(
                from, to,
                totalInc, totalDep, totalExp, totalInc.subtract(totalExp),
                incomeSeries, depositSeries, profitSeries
        );
    }

    private BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private List<MonthlyAmountRow> safe(List<MonthlyAmountRow> rows) { return rows == null ? List.of() : rows; }

    private Map<String, BigDecimal> toMap(List<MonthlyAmountRow> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (MonthlyAmountRow r : rows) {
            if (r != null && r.month() != null) map.put(r.month(), nz(r.total()));
        }
        return map;
    }

    private Set<String> allMonthsBetween(LocalDate from, LocalDate to) {
        YearMonth start = YearMonth.from(from);
        YearMonth end = YearMonth.from(to);
        Set<String> out = new HashSet<>();
        while (!start.isAfter(end)) {
            out.add(start.toString());
            start = start.plusMonths(1);
        }
        return out;
    }
}