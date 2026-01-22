package com.sms.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoteBulkCreateDTO {
    private List<NoteCreateDTO> notes;
    private boolean upsert; // true = mise à jour si existe, false = création uniquement
}
