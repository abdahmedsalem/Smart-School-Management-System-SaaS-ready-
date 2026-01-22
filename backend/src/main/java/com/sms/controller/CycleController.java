package com.sms.controller;

import com.sms.dto.CycleDTO;
import com.sms.service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cycles")
@RequiredArgsConstructor
public class CycleController {

    private final StructureService structureService;

    @GetMapping
    public ResponseEntity<List<CycleDTO>> getAllCycles() {
        return ResponseEntity.ok(structureService.getAllCycles());
    }
}
