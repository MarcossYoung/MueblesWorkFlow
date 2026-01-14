package com.example.demo.controller;

import com.example.demo.model.Costs;
import com.example.demo.repository.CostRepo;
import org.springframework.beans.factory.annotation.Autowired;
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
    public List<Costs> getAll() {
        return costRepo.findAll(Sort.by(Sort.Direction.DESC, "date"));
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
