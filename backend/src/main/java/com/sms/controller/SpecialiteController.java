package com.sms.controller;

import com.sms.dto.SpecialiteDTO;
import com.sms.service.StructureService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/specialites")
@RequiredArgsConstructor
public class SpecialiteController {

    private final StructureService structureService;

    @GetMapping
    public ResponseEntity<List<SpecialiteDTO>> getAllSpecialites(
            @RequestParam(required = false) Long cycleId) {
        return ResponseEntity.ok(structureService.getAllSpecialites(cycleId));
    }
}
