package com.sms.controller;

import com.sms.dto.ClasseMatiereDTO;
import com.sms.service.ClasseMatiereService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classe-matieres")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClasseMatiereController {

    private final ClasseMatiereService classeMatiereService;

    @GetMapping
    public ResponseEntity<List<ClasseMatiereDTO>> getAllClassesMatieres() {
        return ResponseEntity.ok(classeMatiereService.getAllClassesMatieres());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClasseMatiereDTO> getClasseMatiereById(@PathVariable Long id) {
        return ResponseEntity.ok(classeMatiereService.getClasseMatiereById(id));
    }

    @GetMapping("/classe/{classeId}")
    public ResponseEntity<List<ClasseMatiereDTO>> getClasseMatieresByClasse(@PathVariable Long classeId) {
        return ResponseEntity.ok(classeMatiereService.getClasseMatieresByClasse(classeId));
    }

    @GetMapping("/matiere-niveau/{matiereNiveauId}")
    public ResponseEntity<List<ClasseMatiereDTO>> getClasseMatieresByMatiereNiveau(@PathVariable Long matiereNiveauId) {
        return ResponseEntity.ok(classeMatiereService.getClasseMatieresByMatiereNiveau(matiereNiveauId));
    }

    @PostMapping
    public ResponseEntity<ClasseMatiereDTO> createClasseMatiere(
            @RequestParam Long classeId,
            @RequestParam Long matiereNiveauId,
            @RequestParam Integer coefficient) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(classeMatiereService.createClasseMatiere(classeId, matiereNiveauId, coefficient));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClasseMatiereDTO> updateClasseMatiere(
            @PathVariable Long id,
            @RequestParam Integer coefficient) {
        return ResponseEntity.ok(classeMatiereService.updateClasseMatiere(id, coefficient));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClasseMatiere(@PathVariable Long id) {
        classeMatiereService.deleteClasseMatiere(id);
        return ResponseEntity.noContent().build();
    }
}
