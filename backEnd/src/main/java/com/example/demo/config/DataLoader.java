package com.example.demo.config;

import com.example.demo.model.*;
import com.example.demo.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Component
@Order(1)
public class DataLoader implements CommandLineRunner {

    private final ProductRepo productRepo;
    private final UserRepo userRepo;
    private final WorkOrderRepo workOrderRepo;
    private final PaymentRepo paymentRepo;
    private final CostRepo costRepo;
    private final InventoryItemRepo inventoryItemRepo;
    private final ProductMaterialRepo productMaterialRepo;
    private final PasswordEncoder passwordEncoder;

    public DataLoader(ProductRepo productRepo, UserRepo userRepo, WorkOrderRepo workOrderRepo,
                      PaymentRepo paymentRepo, CostRepo costRepo,
                      InventoryItemRepo inventoryItemRepo, ProductMaterialRepo productMaterialRepo,
                      PasswordEncoder passwordEncoder) {
        this.productRepo = productRepo;
        this.userRepo = userRepo;
        this.workOrderRepo = workOrderRepo;
        this.paymentRepo = paymentRepo;
        this.costRepo = costRepo;
        this.inventoryItemRepo = inventoryItemRepo;
        this.productMaterialRepo = productMaterialRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        AppUser admin  = ensureUser("admin",  "admin123",  AppUserRole.ADMIN,  "1140000001");
        AppUser carlos = ensureUser("carlos", "seller123", AppUserRole.SELLER, "1140000002");
        AppUser laura  = ensureUser("laura",  "seller123", AppUserRole.SELLER, "1140000003");
        ensureUser("viewer", "viewer123", AppUserRole.VIEWER, "");

        if (productRepo.count() > 0) return;

        List<InventoryItem> inv = seedInventory();
        seedOrders(admin, carlos, laura, inv);
        seedCosts();
    }

    // ─── Users ───────────────────────────────────────────────────────────────

    private AppUser ensureUser(String username, String rawPassword, AppUserRole role, String phone) {
        return userRepo.findByUsername(username).orElseGet(() -> {
            AppUser u = new AppUser(username, passwordEncoder.encode(rawPassword), role, phone);
            return userRepo.save(u);
        });
    }

    // ─── Inventory ───────────────────────────────────────────────────────────

    private List<InventoryItem> seedInventory() {
        return List.of(
            saveItem("Pino en tablas",         InventoryUnit.M2,    new BigDecimal("850.00"),  new BigDecimal("185.000"), new BigDecimal("40.000")),
            saveItem("MDF 18mm",               InventoryUnit.M2,    new BigDecimal("1200.00"), new BigDecimal("92.500"),  new BigDecimal("20.000")),
            saveItem("Melamina blanca 18mm",   InventoryUnit.M2,    new BigDecimal("980.00"),  new BigDecimal("115.000"), new BigDecimal("25.000")),
            saveItem("Roble americano",        InventoryUnit.M2,    new BigDecimal("2800.00"), new BigDecimal("38.500"),  new BigDecimal("10.000")),
            saveItem("Pintura látex blanca",   InventoryUnit.LITERS,new BigDecimal("650.00"),  new BigDecimal("28.000"),  new BigDecimal("5.000")),
            saveItem("Laca nitrocelulosa",     InventoryUnit.LITERS,new BigDecimal("890.00"),  new BigDecimal("16.500"),  new BigDecimal("4.000")),
            saveItem("Bisagras 35mm",          InventoryUnit.UNITS, new BigDecimal("120.00"),  new BigDecimal("210.000"), new BigDecimal("50.000")),
            saveItem("Corredor cajones 45cm",  InventoryUnit.UNITS, new BigDecimal("850.00"),  new BigDecimal("74.000"),  new BigDecimal("20.000")),
            saveItem("Tornillos 3.5x40",       InventoryUnit.UNITS, new BigDecimal("8.00"),    new BigDecimal("1450.000"),new BigDecimal("200.000")),
            saveItem("Lija grano 80",          InventoryUnit.UNITS, new BigDecimal("150.00"),  new BigDecimal("55.000"),  new BigDecimal("10.000")),
            saveItem("Cola vinílica 1kg",      InventoryUnit.UNITS, new BigDecimal("420.00"),  new BigDecimal("11.000"),  new BigDecimal("3.000")),
            saveItem("Vidrio templado 6mm",    InventoryUnit.M2,    new BigDecimal("3200.00"), new BigDecimal("6.500"),   new BigDecimal("2.000"))
        );
    }

    private InventoryItem saveItem(String name, InventoryUnit unit, BigDecimal cost, BigDecimal qty, BigDecimal minStock) {
        InventoryItem item = new InventoryItem();
        item.setName(name);
        item.setUnit(unit);
        item.setUnitCost(cost);
        item.setQuantityInStock(qty);
        item.setMinStock(minStock);
        item.setLastUpdated(LocalDateTime.now().minusDays(3));
        return inventoryItemRepo.save(item);
    }

    // ─── Orders ──────────────────────────────────────────────────────────────

    private void seedOrders(AppUser admin, AppUser carlos, AppUser laura, List<InventoryItem> inv) {
        InventoryItem pino     = inv.get(0);
        InventoryItem mdf      = inv.get(1);
        InventoryItem roble    = inv.get(3);
        InventoryItem vidrio   = inv.get(11);
        InventoryItem corredor = inv.get(7);

        // ── February (orders 1–12, all ENTREGADO / ABONADO) ───────────────────
        order("Mesa de comedor 8 personas",  ProductType.MESA,      "240x90x75cm", "Pino macizo",   "Barniz mate",       "Natural",  1, d("2026-02-20"), d("2026-03-13"), d("2026-03-10"), 320_000, 128_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "gonzalez@gmail.com",  "Gonzalez Ricardo",
            List.of(pay(d("2026-02-20"), "DEPOSIT", 128_000, "BANK_TRANSFER"),
                    pay(d("2026-03-12"), "RESTO",   192_000, "CASH")));

        order("Sillas comedor x4",           ProductType.SILLA,     "45x45x90cm",  "Pino macizo",   "Esmalte blanco",    "Blanco",   4, d("2026-02-21"), d("2026-03-07"), d("2026-03-05"), 180_000,  72_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "martinez@gmail.com",  "Martínez Ana",
            List.of(pay(d("2026-02-21"), "DEPOSIT",  72_000, "CASH"),
                    pay(d("2026-03-06"), "RESTO",   108_000, "CASH")));

        order("Cómoda 5 cajones",            ProductType.COMODA,    "120x45x100cm","MDF laqueado",  "Laca blanca",       "Blanco",   1, d("2026-02-22"), d("2026-03-15"), d("2026-03-12"), 290_000, 116_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "lopez@hotmail.com",   "López Carla",
            List.of(pay(d("2026-02-22"), "DEPOSIT", 116_000, "BANK_TRANSFER"),
                    pay(d("2026-03-14"), "RESTO",   174_000, "BANK_TRANSFER")));

        order("Rack para TV 65\"",           ProductType.RACKTV,    "180x40x55cm", "MDF melamina",  "Sin pintura",       "Blanco",   1, d("2026-02-24"), d("2026-03-10"), d("2026-03-08"), 195_000,  78_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "fernandez@gmail.com", "Fernández José",
            List.of(pay(d("2026-02-24"), "DEPOSIT",  78_000, "CREDIT_DEBIT_CARD"),
                    pay(d("2026-03-09"), "RESTO",   117_000, "BANK_TRANSFER")));

        order("Sillón 3 cuerpos",            ProductType.SILLONES,  "220x90x85cm", "Pino + espuma", "Tela gris",         "Gris",     1, d("2026-02-25"), d("2026-03-20"), d("2026-03-18"), 420_000, 168_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "garcia@gmail.com",   "García Pedro",
            List.of(pay(d("2026-02-25"), "DEPOSIT", 168_000, "BANK_TRANSFER"),
                    pay(d("2026-03-17"), "RESTO",   252_000, "BANK_TRANSFER")));

        order("Mesa ratona centro",          ProductType.RATONA,    "110x60x40cm", "Roble",         "Barniz satinado",   "Natural",  1, d("2026-02-26"), d("2026-03-12"), d("2026-03-10"), 120_000,  48_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "rodriguez@gmail.com", "Rodríguez Marta",
            List.of(pay(d("2026-02-26"), "DEPOSIT",  48_000, "CASH"),
                    pay(d("2026-03-10"), "RESTO",    72_000, "CASH")));

        order("Cristalero con puertas",      ProductType.CRISTALERO,"90x40x180cm", "MDF + vidrio",  "Laca blanca",       "Blanco",   1, d("2026-02-27"), d("2026-03-25"), d("2026-03-22"), 480_000, 192_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "sanchez@gmail.com",  "Sánchez Laura",
            List.of(pay(d("2026-02-27"), "DEPOSIT", 192_000, "BANK_TRANSFER"),
                    pay(d("2026-03-22"), "RESTO",   288_000, "BANK_TRANSFER")));

        order("Bancos de cocina x2",         ProductType.BANCOS,    "35x35x60cm",  "Pino macizo",   "Esmalte negro",     "Negro",    2, d("2026-02-28"), d("2026-03-10"), d("2026-03-08"), 160_000,  64_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "perez@gmail.com",    "Pérez Fernando",
            List.of(pay(d("2026-02-28"), "DEPOSIT",  64_000, "CASH"),
                    pay(d("2026-03-09"), "RESTO",    96_000, "CASH")));

        order("Mesa escritorio home office", ProductType.MESA,      "150x70x75cm", "MDF melamina",  "Sin pintura",       "Roble",    1, d("2026-03-01"), d("2026-03-20"), d("2026-03-18"), 220_000,  88_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "diaz@gmail.com",     "Díaz Valentina",
            List.of(pay(d("2026-03-01"), "DEPOSIT",  88_000, "BANK_TRANSFER"),
                    pay(d("2026-03-17"), "RESTO",   132_000, "CREDIT_DEBIT_CARD")));

        order("Cómoda infantil 3 cajones",   ProductType.COMODA,    "90x40x80cm",  "MDF laqueado",  "Laca celeste",      "Celeste",  1, d("2026-03-02"), d("2026-03-22"), d("2026-03-20"), 260_000, 104_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "gomez@gmail.com",    "Gómez Sofía",
            List.of(pay(d("2026-03-02"), "DEPOSIT", 104_000, "CASH"),
                    pay(d("2026-03-20"), "RESTO",   156_000, "CASH")));

        order("Mesa comedor con vidrio",     ProductType.MESA,      "180x90x75cm", "Roble + vidrio","Barniz mate",       "Natural",  1, d("2026-03-03"), d("2026-03-28"), d("2026-03-26"), 580_000, 232_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "torres@gmail.com",   "Torres Marcos",
            List.of(pay(d("2026-03-03"), "DEPOSIT", 232_000, "BANK_TRANSFER"),
                    pay(d("2026-03-08"), "EXTRA",    50_000, "CASH"),
                    pay(d("2026-03-25"), "RESTO",   298_000, "BANK_TRANSFER")));

        order("Sillón cama 2 plazas",        ProductType.SILLONES,  "190x80x85cm", "Pino + espuma", "Tela beige",        "Beige",    1, d("2026-03-04"), d("2026-03-28"), d("2026-03-26"), 490_000, 196_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "alvarez@gmail.com",  "Álvarez Diego",
            List.of(pay(d("2026-03-04"), "DEPOSIT", 196_000, "BANK_TRANSFER"),
                    pay(d("2026-03-26"), "RESTO",   294_000, "BANK_TRANSFER")));

        // ── March batch 1 (orders 13–25, mix TERMINADO / ENTREGADO) ──────────
        order("Rack TV bajo estilo nórdico", ProductType.RACKTV,    "160x35x45cm", "MDF melamina",  "Sin pintura",       "Blanco",   1, d("2026-03-05"), d("2026-03-26"), d("2026-03-24"), 195_000,  78_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "morales@gmail.com",  "Morales Cecilia",
            List.of(pay(d("2026-03-05"), "DEPOSIT",  78_000, "CREDIT_DEBIT_CARD"),
                    pay(d("2026-03-24"), "RESTO",   117_000, "BANK_TRANSFER")));

        order("Mesa de luz x2 (par)",        ProductType.MESA,      "45x40x55cm",  "MDF laqueado",  "Laca blanca",       "Blanco",   2, d("2026-03-06"), d("2026-03-24"), d("2026-03-22"), 140_000,  56_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "romero@gmail.com",   "Romero Patricia",
            List.of(pay(d("2026-03-06"), "DEPOSIT",  56_000, "CASH"),
                    pay(d("2026-03-22"), "RESTO",    84_000, "CASH")));

        order("Bancos de barra x3",          ProductType.BANCOS,    "30x30x75cm",  "Pino macizo",   "Esmalte blanco",    "Blanco",   3, d("2026-03-07"), d("2026-03-28"), d("2026-03-26"), 270_000, 108_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "castro@gmail.com",   "Castro Hernán",
            List.of(pay(d("2026-03-07"), "DEPOSIT", 108_000, "BANK_TRANSFER"),
                    pay(d("2026-03-26"), "RESTO",   162_000, "BANK_TRANSFER")));

        order("Cómoda esquinera TV",         ProductType.COMODA,    "80x80x120cm", "MDF melamina",  "Sin pintura",       "Nogal",    1, d("2026-03-08"), d("2026-04-01"), d("2026-03-30"), 310_000, 124_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "gutierrez@gmail.com","Gutiérrez Elena",
            List.of(pay(d("2026-03-08"), "DEPOSIT", 124_000, "CASH"),
                    pay(d("2026-03-30"), "RESTO",   186_000, "CASH")));

        order("Mesa plegable multiuso",      ProductType.MESA,      "120x60x75cm", "Pino macizo",   "Barniz brillante",  "Natural",  1, d("2026-03-10"), d("2026-03-31"), d("2026-03-29"), 185_000,  74_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "mendez@gmail.com",   "Méndez Tomás",
            List.of(pay(d("2026-03-10"), "DEPOSIT",  74_000, "BANK_TRANSFER"),
                    pay(d("2026-03-28"), "RESTO",   111_000, "BANK_TRANSFER")));

        order("Silla alta para niño",        ProductType.SILLA,     "35x35x90cm",  "Pino + plástico","Esmalte rojo",     "Rojo",     1, d("2026-03-11"), d("2026-03-28"), d("2026-03-26"),  95_000,  38_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "ramos@gmail.com",    "Ramos Luciana",
            List.of(pay(d("2026-03-11"), "DEPOSIT",  38_000, "CASH"),
                    pay(d("2026-03-26"), "RESTO",    57_000, "CASH")));

        order("Placard 2 puertas corredizas",ProductType.COMODA,    "160x60x200cm","MDF melamina",  "Sin pintura",       "Blanco",   1, d("2026-03-12"), d("2026-04-08"), d("2026-04-05"), 650_000, 260_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "ruiz@gmail.com",     "Ruiz Santiago",
            List.of(pay(d("2026-03-12"), "DEPOSIT", 260_000, "BANK_TRANSFER"),
                    pay(d("2026-04-01"), "EXTRA",    50_000, "BANK_TRANSFER"),
                    pay(d("2026-04-05"), "RESTO",   340_000, "BANK_TRANSFER")));

        order("Mesa de jardín y exterior",   ProductType.MESA,      "150x80x75cm", "Cedro tratado", "Lasur exterior",    "Natural",  1, d("2026-03-13"), d("2026-04-03"), d("2026-04-01"), 280_000, 112_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "herrera@gmail.com",  "Herrera Claudia",
            List.of(pay(d("2026-03-13"), "DEPOSIT", 112_000, "CASH"),
                    pay(d("2026-04-01"), "RESTO",   168_000, "CASH")));

        order("Cómoda tocador con espejo",   ProductType.COMODA,    "100x45x160cm","MDF laqueado",  "Laca blanca",       "Blanco",   1, d("2026-03-14"), d("2026-04-10"), d("2026-04-08"), 390_000, 156_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "medina@gmail.com",   "Medina Roxana",
            List.of(pay(d("2026-03-14"), "DEPOSIT", 156_000, "BANK_TRANSFER"),
                    pay(d("2026-04-08"), "RESTO",   234_000, "BANK_TRANSFER")));

        order("Sillones individuales x2",    ProductType.SILLONES,  "85x90x85cm",  "Pino + espuma", "Tela azul marino",  "Azul",     2, d("2026-03-15"), d("2026-04-12"), d("2026-04-10"), 720_000, 288_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "luna@gmail.com",     "Luna Fabián",
            List.of(pay(d("2026-03-15"), "DEPOSIT", 288_000, "BANK_TRANSFER"),
                    pay(d("2026-04-10"), "RESTO",   432_000, "BANK_TRANSFER")));

        order("Mesa cocina pequeña",         ProductType.MESA,      "80x80x75cm",  "Pino macizo",   "Esmalte blanco",    "Blanco",   1, d("2026-03-17"), d("2026-04-05"), d("2026-04-03"), 145_000,  58_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "vargas@gmail.com",   "Vargas Miriam",
            List.of(pay(d("2026-03-17"), "DEPOSIT",  58_000, "CASH"),
                    pay(d("2026-04-03"), "RESTO",    87_000, "CASH")));

        order("Rack TV esquinero",           ProductType.RACKTV,    "100x100x55cm","MDF melamina",  "Sin pintura",       "Nogal",    1, d("2026-03-18"), d("2026-04-07"), d("2026-04-05"), 235_000,  94_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "silva@gmail.com",    "Silva Gastón",
            List.of(pay(d("2026-03-18"), "DEPOSIT",  94_000, "BANK_TRANSFER"),
                    pay(d("2026-04-05"), "RESTO",   141_000, "BANK_TRANSFER")));

        order("Banco largo para entrada",    ProductType.BANCOS,    "120x35x45cm", "Pino macizo",   "Barniz mate",       "Natural",  1, d("2026-03-19"), d("2026-04-05"), d("2026-04-03"), 175_000,  70_000, PaymentStatus.ABONADO, Status.ENTREGADO, carlos, "aguilar@gmail.com",  "Aguilar Jimena",
            List.of(pay(d("2026-03-19"), "DEPOSIT",  70_000, "CASH"),
                    pay(d("2026-04-03"), "RESTO",   105_000, "CASH")));

        // ── March batch 2 (orders 26–35, TERMINADO / PRODUCCION) ─────────────
        order("Mesa de reuniones 10 pers.",  ProductType.MESA,      "300x100x75cm","Roble americano","Barniz satinado",  "Natural",  1, d("2026-03-20"), d("2026-04-20"), d("2026-04-18"), 890_000, 356_000, PaymentStatus.PAGO_SEÑA, Status.TERMINADO, laura,  "ortiz@gmail.com",    "Ortiz Empresa SRL",
            List.of(pay(d("2026-03-20"), "DEPOSIT", 356_000, "BANK_TRANSFER")));

        order("Estantería flotante 3 tramos",ProductType.OTROS,     "200x25x30cm", "MDF laqueado",  "Laca gris",         "Gris",     3, d("2026-03-21"), d("2026-04-12"), d("2026-04-10"), 160_000,  64_000, PaymentStatus.PAGO_SEÑA, Status.TERMINADO, carlos, "molina@gmail.com",   "Molina Beatriz",
            List.of(pay(d("2026-03-21"), "DEPOSIT",  64_000, "CASH")));

        order("Cómoda infantil temática",    ProductType.COMODA,    "100x45x90cm", "MDF laqueado",  "Laca verde",        "Verde",    1, d("2026-03-22"), d("2026-04-15"), d("2026-04-13"), 320_000, 128_000, PaymentStatus.PAGO_SEÑA, Status.TERMINADO, laura,  "moreno@gmail.com",   "Moreno Adriana",
            List.of(pay(d("2026-03-22"), "DEPOSIT", 128_000, "BANK_TRANSFER")));

        order("Sillas comedor tapizadas x6", ProductType.SILLA,     "45x45x92cm",  "Pino + espuma", "Tela mostaza",      "Mostaza",  6, d("2026-03-24"), d("2026-04-18"), d("2026-04-16"), 420_000, 168_000, PaymentStatus.PAGO_SEÑA, Status.TERMINADO, carlos, "flores@gmail.com",   "Flores Nicolás",
            List.of(pay(d("2026-03-24"), "DEPOSIT", 168_000, "CASH")));

        order("Mesa ratona redonda",         ProductType.RATONA,    "90x90x42cm",  "Roble",         "Barniz mate",       "Natural",  1, d("2026-03-25"), d("2026-04-14"), d("2026-04-12"), 195_000,  78_000, PaymentStatus.ABONADO, Status.ENTREGADO, laura,  "cruz@gmail.com",     "Cruz Alejandra",
            List.of(pay(d("2026-03-25"), "DEPOSIT",  78_000, "CREDIT_DEBIT_CARD"),
                    pay(d("2026-04-12"), "RESTO",   117_000, "BANK_TRANSFER")));

        order("Mesa comedor industrial",     ProductType.MESA,      "200x90x75cm", "Pino + hierro", "Barniz + pintura",  "Negro",    1, d("2026-03-26"), d("2026-04-22"), d("2026-04-20"), 650_000, 260_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, carlos, "reyes@gmail.com",    "Reyes Gabriel",
            List.of(pay(d("2026-03-26"), "DEPOSIT", 260_000, "BANK_TRANSFER")));

        order("Estantería biblioteca 5 mod.",ProductType.OTROS,     "180x30x200cm","MDF melamina",  "Sin pintura",       "Blanco",   1, d("2026-03-27"), d("2026-04-24"), d("2026-04-22"), 480_000, 192_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, laura,  "santos@gmail.com",   "Santos Valeria",
            List.of(pay(d("2026-03-27"), "DEPOSIT", 192_000, "BANK_TRANSFER")));

        order("Bancos de bar altos x4",      ProductType.BANCOS,    "35x35x80cm",  "Pino macizo",   "Esmalte negro",     "Negro",    4, d("2026-03-28"), d("2026-04-20"), d("2026-04-18"), 360_000, 144_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, carlos, "rivera@gmail.com",   "Rivera Carlos",
            List.of(pay(d("2026-03-28"), "DEPOSIT", 144_000, "CASH")));

        order("Mesa auxiliar estilo nórdico",ProductType.MESA,      "55x55x55cm",  "MDF lacado",    "Laca blanca",       "Blanco",   1, d("2026-03-29"), d("2026-04-18"), d("2026-04-16"), 135_000,  54_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, laura,  "ramirez@gmail.com",  "Ramírez Florencia",
            List.of(pay(d("2026-03-29"), "DEPOSIT",  54_000, "BANK_TRANSFER")));

        order("Cómoda vintage 6 cajones",    ProductType.COMODA,    "110x50x110cm","Pino macizo",   "Barniz envejecido", "Nogal",    1, d("2026-03-30"), d("2026-04-25"), d("2026-04-23"), 410_000, 164_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, carlos, "rojas@gmail.com",    "Rojas Inés",
            List.of(pay(d("2026-03-30"), "DEPOSIT", 164_000, "CASH")));

        // ── April (orders 36–45, PRODUCCION / CREADO) ────────────────────────
        order("Sillón individual reclinable",ProductType.SILLONES,  "90x95x100cm", "Pino + espuma", "Tela verde oliva",  "Verde",    1, d("2026-04-01"), d("2026-04-28"), d("2026-04-26"), 380_000, 152_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, laura,  "nunez@gmail.com",    "Núñez Esteban",
            List.of(pay(d("2026-04-01"), "DEPOSIT", 152_000, "BANK_TRANSFER")));

        order("Mesa de ping-pong plegable",  ProductType.MESA,      "274x152x76cm","Pino + MDF",    "Pintura verde",     "Verde",    1, d("2026-04-02"), d("2026-05-02"), d("2026-04-30"), 520_000, 208_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, carlos, "vega@gmail.com",     "Vega Martín",
            List.of(pay(d("2026-04-02"), "DEPOSIT", 208_000, "BANK_TRANSFER")));

        order("Cristalero moderno 2 puertas",ProductType.CRISTALERO,"100x40x190cm","MDF + vidrio",  "Laca negra",        "Negro",    1, d("2026-04-03"), d("2026-05-05"), d("2026-05-03"), 790_000, 316_000, PaymentStatus.PAGO_SEÑA, Status.PRODUCCION, laura,  "mora@gmail.com",     "Mora Daniela",
            List.of(pay(d("2026-04-03"), "DEPOSIT", 316_000, "CREDIT_DEBIT_CARD")));

        order("Mesa escritorio en L",        ProductType.MESA,      "160x120x75cm","MDF melamina",  "Sin pintura",       "Roble",    1, d("2026-04-04"), d("2026-05-02"), d("2026-04-30"), 490_000, 196_000, PaymentStatus.PAGO_SEÑA, Status.CREADO, carlos, "jimenez@gmail.com",  "Jiménez Roberto",
            List.of(pay(d("2026-04-04"), "DEPOSIT", 196_000, "BANK_TRANSFER")));

        order("Banco de piano tapizado",     ProductType.BANCOS,    "75x35x55cm",  "MDF + espuma",  "Cuero negro",       "Negro",    1, d("2026-04-06"), d("2026-04-28"), d("2026-04-26"), 280_000, 112_000, PaymentStatus.PAGO_SEÑA, Status.CREADO, laura,  "guerrero@gmail.com", "Guerrero Liliana",
            List.of(pay(d("2026-04-06"), "DEPOSIT", 112_000, "CASH")));

        order("Mesa de noche flotante",      ProductType.MESA,      "40x30x35cm",  "MDF laqueado",  "Laca blanca",       "Blanco",   1, d("2026-04-07"), d("2026-04-28"), d("2026-04-26"), 185_000,  74_000, PaymentStatus.PAGO_SEÑA, Status.CREADO, carlos, "sosa@gmail.com",     "Sosa Mariela",
            List.of(pay(d("2026-04-07"), "DEPOSIT",  74_000, "BANK_TRANSFER")));

        order("Rack abierto 5 estantes",     ProductType.RACKTV,    "100x35x175cm","MDF melamina",  "Sin pintura",       "Blanco",   1, d("2026-04-08"), d("2026-05-05"), d("2026-05-03"), 220_000,  88_000, PaymentStatus.PAGO_SEÑA, Status.CREADO, laura,  "carrillo@gmail.com", "Carrillo Horacio",
            List.of(pay(d("2026-04-08"), "DEPOSIT",  88_000, "BANK_TRANSFER")));

        order("Cómoda baja estilo oriental", ProductType.COMODA,    "130x40x50cm", "MDF laqueado",  "Laca negra",        "Negro",    1, d("2026-04-10"), d("2026-05-08"), d("2026-05-06"), 340_000, 136_000, PaymentStatus.PAGO_SEÑA, Status.CREADO, carlos, "mendoza@gmail.com",  "Mendoza Patricia",
            List.of(pay(d("2026-04-10"), "DEPOSIT", 136_000, "CASH")));

        order("Sillas tapizadas comedor x4", ProductType.SILLA,     "45x45x90cm",  "Pino + espuma", "Tela burdeos",      "Burdeos",  4, d("2026-04-12"), d("2026-05-10"), d("2026-05-08"), 520_000, 208_000, PaymentStatus.PAGO_SEÑA, Status.CREADO, laura,  "ibarra@gmail.com",   "Ibarra Cristina",
            List.of(pay(d("2026-04-12"), "DEPOSIT", 208_000, "BANK_TRANSFER")));

        order("Mesa de terraza 6 personas",  ProductType.MESA,      "180x90x75cm", "Cedro tratado", "Lasur exterior",    "Natural",  1, d("2026-04-14"), d("2026-05-12"), d("2026-05-10"), 310_000, 124_000, PaymentStatus.PAGO_SEÑA, Status.CREADO, carlos, "cabrera@gmail.com",  "Cabrera Ignacio",
            List.of(pay(d("2026-04-14"), "DEPOSIT", 124_000, "CREDIT_DEBIT_CARD")));
    }

    private void order(String titulo, ProductType type, String medidas, String material,
                       String pintura, String color, long cantidad,
                       LocalDate start, LocalDate fechaEstimada, LocalDate fechaEntrega,
                       int precio, int seña, PaymentStatus pagoStatus, Status woStatus,
                       AppUser owner, String email, String notas,
                       List<PaymentRecord> payments) {

        Product p = new Product();
        p.setTitulo(titulo);
        p.setProductType(type);
        p.setMedidas(medidas);
        p.setMaterial(material);
        p.setPintura(pintura);
        p.setColor(color);
        p.setCantidad(cantidad);
        p.setStartDate(start);
        p.setFechaEstimada(fechaEstimada);
        p.setFechaEntrega(fechaEntrega);
        p.setPrecio(new BigDecimal(precio));
        p.setCogsAmount(new BigDecimal(precio / 3));
        p.setPagoStatus(pagoStatus);
        p.setOwner(owner);
        p.setClientPhone(email);
        p.setNotas(notas);
        p = productRepo.save(p);

        WorkOrder wo = new WorkOrder();
        wo.setProduct(p);
        wo.setStatus(woStatus);
        wo.setUpdateAt(start.atStartOfDay().plusHours(9));
        workOrderRepo.save(wo);

        for (PaymentRecord pr : payments) {
            OrderPayments op = new OrderPayments();
            op.setProduct(p);
            op.setPaymentDate(pr.date());
            op.setPaymentType(pr.type());
            op.setAmount(new BigDecimal(pr.amount()));
            op.setPaymentMethod(pr.method());
            paymentRepo.save(op);
        }
    }

    private PaymentRecord pay(LocalDate date, String type, int amount, String method) {
        return new PaymentRecord(date, type, amount, method);
    }

    private record PaymentRecord(LocalDate date, String type, int amount, String method) {}

    // ─── Costs ───────────────────────────────────────────────────────────────

    private void seedCosts() {
        // February costs
        cost(CostType.RENT,     d("2026-02-01"), 250_000, PaymentFrequency.MONTHLY,  "Alquiler taller febrero");
        cost(CostType.SALARY,   d("2026-02-28"), 480_000, PaymentFrequency.MONTHLY,  "Sueldo oficial carpintero Juan");
        cost(CostType.SALARY,   d("2026-02-28"), 350_000, PaymentFrequency.MONTHLY,  "Sueldo ayudante Pablo");
        cost(CostType.SERVICES, d("2026-02-10"), 42_500,  PaymentFrequency.MONTHLY,  "Luz y gas taller");
        cost(CostType.SERVICES, d("2026-02-12"),  8_900,  PaymentFrequency.MONTHLY,  "Internet fibra óptica");
        cost(CostType.MATERIAL, d("2026-02-14"), 185_000, PaymentFrequency.ONE_TIME,  "Compra pino en tablas 80m²");
        cost(CostType.MATERIAL, d("2026-02-18"),  95_000, PaymentFrequency.ONE_TIME,  "MDF y melaminas");
        cost(CostType.ADS,      d("2026-02-20"),  25_000, PaymentFrequency.MONTHLY,  "Publicidad Instagram y Facebook");
        cost(CostType.TAX,      d("2026-02-22"),  68_000, PaymentFrequency.MONTHLY,  "Monotributo AFIP febrero");

        // March costs
        cost(CostType.RENT,     d("2026-03-01"), 250_000, PaymentFrequency.MONTHLY,  "Alquiler taller marzo");
        cost(CostType.SALARY,   d("2026-03-31"), 480_000, PaymentFrequency.MONTHLY,  "Sueldo oficial carpintero Juan");
        cost(CostType.SALARY,   d("2026-03-31"), 350_000, PaymentFrequency.MONTHLY,  "Sueldo ayudante Pablo");
        cost(CostType.SERVICES, d("2026-03-10"),  44_800, PaymentFrequency.MONTHLY,  "Luz y gas taller");
        cost(CostType.SERVICES, d("2026-03-12"),  8_900,  PaymentFrequency.MONTHLY,  "Internet fibra óptica");
        cost(CostType.MATERIAL, d("2026-03-08"), 220_000, PaymentFrequency.ONE_TIME,  "Roble americano 14m² para pedidos especiales");
        cost(CostType.MATERIAL, d("2026-03-15"),  78_000, PaymentFrequency.ONE_TIME,  "Pinturas, laca y barniz");
        cost(CostType.MATERIAL, d("2026-03-20"),  45_000, PaymentFrequency.ONE_TIME,  "Herrajes, bisagras y corredores");
        cost(CostType.ADS,      d("2026-03-20"),  30_000, PaymentFrequency.MONTHLY,  "Publicidad Instagram y Google");
        cost(CostType.TAX,      d("2026-03-22"),  68_000, PaymentFrequency.MONTHLY,  "Monotributo AFIP marzo");
        cost(CostType.OTHERS,   d("2026-03-25"),  18_500, PaymentFrequency.ONE_TIME,  "Reparación sierra circular");

        // April costs (partial month)
        cost(CostType.RENT,     d("2026-04-01"), 250_000, PaymentFrequency.MONTHLY,  "Alquiler taller abril");
        cost(CostType.SALARY,   d("2026-04-15"), 480_000, PaymentFrequency.MONTHLY,  "Sueldo oficial carpintero Juan");
        cost(CostType.SALARY,   d("2026-04-15"), 350_000, PaymentFrequency.MONTHLY,  "Sueldo ayudante Pablo");
        cost(CostType.MATERIAL, d("2026-04-05"), 160_000, PaymentFrequency.ONE_TIME,  "Pino y MDF para pedidos abril");
        cost(CostType.SERVICES, d("2026-04-10"),  46_200, PaymentFrequency.MONTHLY,  "Luz y gas taller");
    }

    private void cost(CostType type, LocalDate date, int amount, PaymentFrequency freq, String reason) {
        Costs c = new Costs();
        c.setCostType(type);
        c.setDate(date);
        c.setAmount(new BigDecimal(amount));
        c.setFrequency(freq);
        c.setReason(reason);
        c.setCreatedAt(date.atStartOfDay().plusHours(10));
        costRepo.save(c);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private LocalDate d(String iso) {
        return LocalDate.parse(iso);
    }
}
