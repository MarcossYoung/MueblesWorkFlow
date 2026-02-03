package com.example.demo.controller;

import com.example.demo.model.Costs;
import com.example.demo.repository.CostRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/costs")
@CrossOrigin(origins = "http://localhost:3000")
public class CostController {

    @Autowired
    private CostRepo costRepo;

    @GetMapping
    public Page<Costs> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "date"));
        return costRepo.findAll(pageable);
    }

    @PostMapping
    public Costs create(@RequestBody Costs cost) {
        if (cost.getCreatedAt() == null) cost.setCreatedAt(LocalDateTime.now());
        return costRepo.save(cost);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        costRepo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
