package com.sms.service;

import com.sms.entity.TypeExamen;
import com.sms.repository.TypeExamenRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TypeExamenService {

    private final TypeExamenRepository typeExamenRepository;

    @PostConstruct
    @Transactional
    public void initTypeExamens() {
        // Initialiser les types d'examens si la table est vide
        if (typeExamenRepository.count() == 0) {
            TypeExamen devoir = new TypeExamen();
            devoir.setNom("Devoir");
            devoir.setDescription("Devoir surveillé ou contrôle continu");
            typeExamenRepository.save(devoir);

            TypeExamen examen = new TypeExamen();
            examen.setNom("Examen");
            examen.setDescription("Examen de fin de trimestre");
            typeExamenRepository.save(examen);
        }
    }

    public List<TypeExamen> getAllTypeExamens() {
        return typeExamenRepository.findAll();
    }

    public TypeExamen getTypeExamenById(Long id) {
        return typeExamenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Type examen non trouvé"));
    }

    public TypeExamen getTypeExamenByNom(String nom) {
        return typeExamenRepository.findByNom(nom)
                .orElseThrow(() -> new RuntimeException("Type examen non trouvé: " + nom));
    }
}
