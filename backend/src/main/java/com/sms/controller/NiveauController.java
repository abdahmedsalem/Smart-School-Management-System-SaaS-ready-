package com.sms.controller;

import com.sms.dto.NiveauDTO;
import com.sms.service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/niveaux")
@RequiredArgsConstructor
public class NiveauController {

    private final StructureService structureService;

    @GetMapping
    public ResponseEntity<List<NiveauDTO>> getAllNiveaux(
            @RequestParam(required = false) Long cycleId) {
        return ResponseEntity.ok(structureService.getAllNiveaux(cycleId));
    }
}
