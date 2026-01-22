package com.sms.controller;

import com.sms.dto.StructureStatsDTO;
import com.sms.service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/structure")
@RequiredArgsConstructor
public class StructureStatsController {

    private final StructureService structureService;

    @GetMapping("/stats")
    public ResponseEntity<StructureStatsDTO> getStats() {
        return ResponseEntity.ok(structureService.getStats());
    }
}
