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
import java.time.YearMonth;
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
        List<MonthlyAmountRow> cashflowRows = safe(paymentRepository.cashflowByMonth(from, to));
        List<MonthlyAmountRow> expenseRows = safe(costsRepository.expensesByDate(from, to));

        // 2) Fetch Expense Breakdown (Pie Chart Data)
        List<Costs> allCosts = costsRepository.findByDateBetween(from, to);

        // Group by Enum name and sum the 'amount' field
        Map<String, BigDecimal> breakdownMap = allCosts.stream()
                .filter(c -> c.getCostType() != null)
                .collect(Collectors.groupingBy(
                        c -> c.getCostType().name(),
                        Collectors.mapping(Costs::getAmount, Collectors.reducing(BigDecimal.ZERO, BigDecimal::add))
                ));

        // Convert Map to List of Maps safely
        List<Map<String, Object>> expenseBreakdown = new ArrayList<>();
        breakdownMap.forEach((name, value) -> {
            Map<String, Object> item = new HashMap<>();
            item.put("name", name);
            item.put("value", nz(value)); // Ensure no nulls reach the Pie Chart
            expenseBreakdown.add(item);
        });

        // 3) Build Comparison Series (Bar Chart)
        SortedSet<String> months = new TreeSet<>(allMonthsBetween(from, to));
        Map<String, BigDecimal> incMap = toMap(incomeRows);
        Map<String, BigDecimal> expMap = toMap(expenseRows);

        List<Map<String, Object>> comparisonSeries = new ArrayList<>();
        for (String m : months) {
            BigDecimal inc = nz(incMap.get(m));
            BigDecimal exp = nz(expMap.get(m));

            Map<String, Object> row = new HashMap<>();
            row.put("label", m);
            row.put("income", inc);
            row.put("expenses", exp);
            comparisonSeries.add(row);
        }

        // KPIs
        BigDecimal tInc = sumValues(incomeRows);
        BigDecimal tExp = sumValues(expenseRows);
        BigDecimal tDep = nz(paymentRepository.cashflowTotal(from, to));

        return new FinanceDashboardResponse(
                from, to, tInc, tDep, tExp, tInc.subtract(tExp),
                comparisonSeries, expenseBreakdown
        );
    }



    private static BigDecimal nz(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private List<MonthlyAmountRow> safe(List<MonthlyAmountRow> rows) { return rows == null ? List.of() : rows; }

    private Map<String, BigDecimal> toMap(List<MonthlyAmountRow> rows) {
        Map<String, BigDecimal> map = new HashMap<>();
        for (MonthlyAmountRow r : rows) {
            if (r != null && r.getMonth() != null) map.put(r.getMonth(), nz(r.getTotal()));
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

    // Ensure these are inside your FinanceService class but outside your dashboard method




    private static BigDecimal sumValues(List<MonthlyAmountRow> rows) {
        BigDecimal total = BigDecimal.ZERO;
        for (MonthlyAmountRow r : rows) {
            // Change from r.total() to r.getTotal() to match the Interface
            total = total.add(nz(r.getTotal()));
        }
        return total;
    }

    public List<Map<String, Object>> getMonthlyUserStats() {
        LocalDate start = LocalDate.now().withDayOfMonth(1);
        LocalDate end = LocalDate.now().withDayOfMonth(LocalDate.now().lengthOfMonth());
        return productRepository.getUserPerformanceData(start,end);
    }
}