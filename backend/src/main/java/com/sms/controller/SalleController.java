package com.sms.controller;

import com.sms.dto.SalleDTO;
import com.sms.service.SalleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/salles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalleController {

    private final SalleService salleService;

    @GetMapping
    public ResponseEntity<List<SalleDTO>> getAllSalles(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) Boolean disponible) {
        return ResponseEntity.ok(salleService.getAllSalles(type, disponible));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalleDTO> getSalleById(@PathVariable Long id) {
        return ResponseEntity.ok(salleService.getSalleById(id));
    }

    @PostMapping
    public ResponseEntity<SalleDTO> createSalle(@RequestBody SalleDTO dto) {
        return new ResponseEntity<>(salleService.createSalle(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalleDTO> updateSalle(@PathVariable Long id, @RequestBody SalleDTO dto) {
        return ResponseEntity.ok(salleService.updateSalle(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSalle(@PathVariable Long id) {
        salleService.deleteSalle(id);
        return ResponseEntity.noContent().build();
    }
}
