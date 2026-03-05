package com.example.demo.service;

import com.example.demo.dto.ChatRequest;
import com.example.demo.dto.FinanceDashboardResponse;
import com.example.demo.dto.ProductResponse;
import com.example.demo.model.Status;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

@Service
public class AiService {

    private final FinanceService financeService;
    private final ProductService productService;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${anthropic.api.key:}")
    private String apiKey;

    // In-memory cache for weekly digest (key = ISO week string e.g. "2026-W10")
    private String cachedDigestText = null;
    private String cachedDigestWeek = null;

    private static final String ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
    private static final String MODEL = "claude-haiku-4-5-20251001";

    public AiService(FinanceService financeService, ProductService productService) {
        this.financeService = financeService;
        this.productService = productService;
    }

    // ─── Core HTTP helpers ────────────────────────────────────────────────────

    private String callClaude(String systemPrompt, String userMessage, int maxTokens) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("model", MODEL);
            body.put("max_tokens", maxTokens);
            body.put("system", systemPrompt);
            body.put("messages", List.of(Map.of("role", "user", "content", userMessage)));

            String bodyJson = objectMapper.writeValueAsString(body);

            String[] responseHolder = {null};

            restTemplate.execute(
                    ANTHROPIC_URL,
                    HttpMethod.POST,
                    request -> {
                        request.getHeaders().set("x-api-key", apiKey);
                        request.getHeaders().set("anthropic-version", "2023-06-01");
                        request.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                        request.getBody().write(bodyJson.getBytes(StandardCharsets.UTF_8));
                    },
                    response -> {
                        String raw = new String(response.getBody().readAllBytes(), StandardCharsets.UTF_8);
                        responseHolder[0] = raw;
                        return null;
                    }
            );

            if (responseHolder[0] == null) return "";
            Map<String, Object> parsed = objectMapper.readValue(responseHolder[0], new TypeReference<>() {});
            List<?> content = (List<?>) parsed.get("content");
            if (content != null && !content.isEmpty()) {
                Map<?, ?> first = (Map<?, ?>) content.get(0);
                return (String) first.get("text");
            }
            return "";
        } catch (Exception e) {
            return "Error al contactar IA: " + e.getMessage();
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> callClaudeForJson(String systemPrompt, String userMessage, int maxTokens) {
        try {
            String raw = callClaude(systemPrompt, userMessage, maxTokens);
            if (raw == null || raw.isBlank()) return Map.of();
            // Strip markdown code fences if present
            String cleaned = raw.trim();
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.replaceAll("^```[a-z]*\\n?", "").replaceAll("```$", "").trim();
            }
            return objectMapper.readValue(cleaned, new TypeReference<>() {});
        } catch (Exception e) {
            return Map.of();
        }
    }

    // ─── Integration 1: Finance Insight ──────────────────────────────────────

    public String generateFinanceInsight(String from, String to) {
        FinanceDashboardResponse data = financeService.dashboard(LocalDate.parse(from), LocalDate.parse(to));

        String context = String.format(
                "Mes: %s a %s\nIngresos totales: $%s\nGastos: $%s\nGanancia neta: $%s\nEfectivo cobrado: $%s\n" +
                "Desglose de gastos: %s\nRendimiento por vendedor: %s",
                from, to,
                data.tInc(), data.tExp(), data.tRev(), data.tDep(),
                data.expenseBreakdown(), data.userStats()
        );

        String system = "Eres un analista financiero de una empresa de muebles. " +
                "Responde SIEMPRE en español. Sé conciso (3-4 oraciones). " +
                "Analiza los KPIs y da insights accionables sobre ingresos, gastos y rendimiento.";

        return callClaude(system, "Analiza estos datos financieros:\n" + context, 400);
    }

    // ─── Integration 2: Parse Order Description ───────────────────────────────

    public Map<String, Object> parseOrderDescription(String description) {
        String system = """
                Eres un asistente para una empresa de muebles. Extrae datos de la descripción del pedido.
                Responde SOLO con JSON válido (sin markdown, sin explicaciones) con estas claves exactas:
                titulo, productType (debe ser uno de: MESA|SILLA|COMODA|BANCOS|RATONA|CRISTALERO|SILLONES|RACKTV|OTROS),
                material, color, medidas, precio (número), amount (número - seña/adelanto),
                clientEmail, notas, fechaEntrega (YYYY-MM-DD).
                Los campos no mencionados deben ser null.
                """;

        String userMsg = "Descripción del pedido: " + description;
        Map<String, Object> result = callClaudeForJson(system, userMsg, 300);

        // Filter out null values to avoid overwriting existing form data
        return result.entrySet().stream()
                .filter(e -> e.getValue() != null)
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));
    }

    // ─── Integration 3: Weekly Digest ────────────────────────────────────────

    public Map<String, Object> generateWeeklyDigest() {
        LocalDate today = LocalDate.now();
        WeekFields wf = WeekFields.ISO;
        String currentWeek = today.getYear() + "-W" + String.format("%02d", today.get(wf.weekOfWeekBasedYear()));

        // Return cached result if same week
        if (currentWeek.equals(cachedDigestWeek) && cachedDigestText != null) {
            return Map.of("digest", cachedDigestText, "generatedAt", today.toString(), "week", currentWeek);
        }

        // Gather data
        List<ProductResponse> pastDue = productService.getProductsPastDue();
        List<ProductResponse> notPickedUp = productService.getProductsNotPickedUp();
        List<ProductResponse> dueThisWeek = productService.getProductsDueThisWeek();

        LocalDate firstOfMonth = today.withDayOfMonth(1);
        FinanceDashboardResponse finance = financeService.dashboard(firstOfMonth, today);

        String oldestNotPickedUp = notPickedUp.isEmpty() ? "ninguno" :
                notPickedUp.get(0).titulo() != null ? notPickedUp.get(0).titulo() : "desconocido";

        String context = String.format(
                "Pedidos atrasados: %d\nPedidos terminados sin retirar: %d (más antiguo: %s)\n" +
                "Entregas esta semana: %d\nGanancia neta del mes: $%s\nIngresos del mes: $%s",
                pastDue.size(), notPickedUp.size(), oldestNotPickedUp,
                dueThisWeek.size(), finance.tRev(), finance.tInc()
        );

        String system = "Eres un asistente de negocio para una empresa de muebles. " +
                "Responde en español con 2-3 oraciones cortas y directas resumiendo la situación semanal. " +
                "Destaca lo más urgente.";

        String digest = callClaude(system, "Resumen semanal del negocio:\n" + context, 150);

        // Cache result
        cachedDigestText = digest;
        cachedDigestWeek = currentWeek;

        return Map.of("digest", digest, "generatedAt", today.toString(), "week", currentWeek);
    }

    // ─── Integration 4: Streaming Chat ───────────────────────────────────────

    public void streamChat(ChatRequest req, String username, SseEmitter emitter) {
        String userRole = SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst().orElse("USER");

        ExecutorService executor = Executors.newSingleThreadExecutor();
        executor.submit(() -> {
            try {
                // Build page context
                String pageContext = buildPageContext(req.page());

                String system = String.format(
                        "Eres un asistente inteligente para una empresa de muebles llamada MueblesWorkFlow. " +
                        "El usuario '%s' tiene rol '%s'. Responde SIEMPRE en español de forma concisa. " +
                        "Contexto de la página actual:\n%s",
                        username, userRole, pageContext
                );

                // Build messages list with history (last 4) + current message
                List<Map<String, String>> messages = new ArrayList<>();
                List<Map<String, String>> history = req.history();
                if (history != null) {
                    int start = Math.max(0, history.size() - 4);
                    messages.addAll(history.subList(start, history.size()));
                }
                messages.add(Map.of("role", "user", "content", req.message()));

                Map<String, Object> body = new LinkedHashMap<>();
                body.put("model", MODEL);
                body.put("max_tokens", 500);
                body.put("stream", true);
                body.put("system", system);
                body.put("messages", messages);

                String bodyJson = objectMapper.writeValueAsString(body);

                restTemplate.execute(
                        ANTHROPIC_URL,
                        HttpMethod.POST,
                        request -> {
                            request.getHeaders().set("x-api-key", apiKey);
                            request.getHeaders().set("anthropic-version", "2023-06-01");
                            request.getHeaders().setContentType(MediaType.APPLICATION_JSON);
                            request.getBody().write(bodyJson.getBytes(StandardCharsets.UTF_8));
                        },
                        response -> {
                            try (BufferedReader reader = new BufferedReader(
                                    new InputStreamReader(response.getBody(), StandardCharsets.UTF_8))) {
                                String line;
                                while ((line = reader.readLine()) != null) {
                                    if (!line.startsWith("data: ")) continue;
                                    String data = line.substring(6).trim();
                                    if ("[DONE]".equals(data)) break;
                                    try {
                                        Map<String, Object> event = objectMapper.readValue(data, new TypeReference<>() {});
                                        String type = (String) event.get("type");
                                        if ("content_block_delta".equals(type)) {
                                            @SuppressWarnings("unchecked")
                                            Map<String, Object> delta = (Map<String, Object>) event.get("delta");
                                            if (delta != null && "text_delta".equals(delta.get("type"))) {
                                                String text = (String) delta.get("text");
                                                if (text != null && !text.isEmpty()) {
                                                    emitter.send(SseEmitter.event().data(text));
                                                }
                                            }
                                        } else if ("message_stop".equals(type)) {
                                            break;
                                        }
                                    } catch (Exception ignored) {
                                        // Skip malformed SSE lines
                                    }
                                }
                            }
                            return null;
                        }
                );
                emitter.complete();
            } catch (Exception e) {
                try {
                    emitter.completeWithError(e);
                } catch (Exception ignored) {}
            }
        });
        executor.shutdown();
    }

    private String buildPageContext(String page) {
        try {
            if ("finance".equals(page)) {
                LocalDate today = LocalDate.now();
                FinanceDashboardResponse data = financeService.dashboard(today.withDayOfMonth(1), today);
                return String.format("Página de finanzas. Ingresos del mes: $%s, Gastos: $%s, Ganancia: $%s",
                        data.tInc(), data.tExp(), data.tRev());
            } else if ("dashboard".equals(page)) {
                int pastDue = productService.getProductsPastDue().size();
                int dueThisWeek = productService.getProductsDueThisWeek().size();
                int notPickedUp = productService.getProductsNotPickedUp().size();
                return String.format("Dashboard de pedidos. Pedidos atrasados: %d, entregas esta semana: %d, terminados sin retirar: %d",
                        pastDue, dueThisWeek, notPickedUp);
            }
        } catch (Exception ignored) {}
        return "Sin datos específicos de página disponibles.";
    }

    // ─── Integration 5: Parse Search Query ───────────────────────────────────

    public Map<String, Object> parseSearchQuery(String query) {
        String today = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE);
        String system = String.format("""
                Hoy es %s. Eres un asistente que extrae filtros de búsqueda para pedidos de muebles.
                Responde SOLO con JSON válido (sin markdown) con estas claves:
                productType (uno de: MESA|SILLA|COMODA|BANCOS|RATONA|CRISTALERO|SILLONES|RACKTV|OTROS, o null),
                material (texto o null),
                workOrderStatus (uno de: CREADO|PRODUCCION|TERMINADO|ENTREGADO|ATRASADO, o null),
                from (YYYY-MM-DD o null),
                to (YYYY-MM-DD o null).
                Los campos no mencionados deben ser null.
                """, today);

        return callClaudeForJson(system, "Búsqueda: " + query, 150);
    }
}
