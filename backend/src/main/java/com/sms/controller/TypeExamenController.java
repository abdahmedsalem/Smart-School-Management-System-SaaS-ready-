package com.sms.controller;

import com.sms.entity.TypeExamen;
import com.sms.service.TypeExamenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/type-examens")
@RequiredArgsConstructor
public class TypeExamenController {

    private final TypeExamenService typeExamenService;

    @GetMapping
    public ResponseEntity<List<TypeExamen>> getAllTypeExamens() {
        return ResponseEntity.ok(typeExamenService.getAllTypeExamens());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TypeExamen> getTypeExamenById(@PathVariable Long id) {
        return ResponseEntity.ok(typeExamenService.getTypeExamenById(id));
    }
}
