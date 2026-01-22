package com.sms.service;

import com.sms.dto.BulletinDTO;
import com.sms.dto.NoteCreateDTO;
import com.sms.dto.NoteDTO;
import com.sms.dto.NoteMatiereDTO;
import com.sms.entity.*;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final EleveRepository eleveRepository;
    private final MatiereRepository matiereRepository;
    private final ExamenRepository examenRepository;
    private final PeriodeRepository periodeRepository;
    private final BulletinRepository bulletinRepository;
    private final ClasseRepository classeRepository;
    private final ClasseMatiereRepository classeMatiereRepository;

    public List<NoteDTO> getAllNotes() {
        return noteRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public NoteDTO getNoteById(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note non trouvée avec l'id: " + id));
        return toDTO(note);
    }

    public List<NoteDTO> getNotesByEleve(Long eleveId) {
        return noteRepository.findByEleveId(eleveId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NoteDTO> getNotesByEleveAndPeriode(Long eleveId, Long periodeId) {
        return noteRepository.findByEleveIdAndPeriodeId(eleveId, periodeId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<NoteDTO> getNotesByMatiere(Long matiereId) {
        return noteRepository.findByMatiereId(matiereId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoteDTO createNote(NoteCreateDTO dto) {
        validateNote(dto);
        Note note = new Note();
        mapDtoToEntity(dto, note);
        return toDTO(noteRepository.save(note));
    }

    @Transactional
    public NoteDTO updateNote(Long id, NoteCreateDTO dto) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note non trouvée avec l'id: " + id));
        mapDtoToEntity(dto, note);
        return toDTO(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long id) {
        if (!noteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Note non trouvée avec l'id: " + id);
        }
        noteRepository.deleteById(id);
    }

    // Bulletins
    public BulletinDTO getBulletinEleve(Long eleveId, Long periodeId) {
        Eleve eleve = eleveRepository.findById(eleveId)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé"));
        Periode periode = periodeRepository.findById(periodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Période non trouvée"));

        Optional<Bulletin> bulletinOpt = bulletinRepository.findByEleveIdAndPeriodeId(eleveId, periodeId);

        BulletinDTO dto = new BulletinDTO();
        dto.setEleveId(eleveId);
        dto.setEleveNom(eleve.getNom());
        dto.setElevePrenom(eleve.getPrenom());
        dto.setEleveMatricule(eleve.getMatricule());
        if (eleve.getClasse() != null) {
            dto.setEleveClasse(eleve.getClasse().getNom());
        }
        dto.setPeriodeId(periodeId);
        dto.setPeriode(periode.getNom());

        // Calculer les notes par matière
        List<Note> notes = noteRepository.findByEleveIdAndPeriodeId(eleveId, periodeId);

        // Grouper par matière (utiliser ClasseMatiere en priorité)
        Map<Long, List<Note>> notesByMatiere = notes.stream()
                .filter(n -> n.getClasseMatiere() != null) // Ignorer les notes sans ClasseMatiere
                .collect(Collectors.groupingBy(n -> n.getClasseMatiere().getMatiereNiveau().getMatiere().getId()));

        List<NoteMatiereDTO> notesMatieres = new ArrayList<>();
        BigDecimal sommeNotesPonderees = BigDecimal.ZERO;
        int sommeCoefficients = 0;

        for (Map.Entry<Long, List<Note>> entry : notesByMatiere.entrySet()) {
            Note firstNote = entry.getValue().get(0);
            ClasseMatiere cm = firstNote.getClasseMatiere();
            Matiere matiere = cm.getMatiereNiveau().getMatiere();

            // RÉCUPÉRER LE VRAI COEFFICIENT
            int coefficient = cm.getCoefficient();

            // Calculer la moyenne en excluant les absents
            List<Note> notesPresents = entry.getValue().stream()
                    .filter(n -> !Boolean.TRUE.equals(n.getAbsent()))
                    .collect(Collectors.toList());

            BigDecimal moyenne = BigDecimal.ZERO;
            if (!notesPresents.isEmpty()) {
                BigDecimal somme = notesPresents.stream()
                        .map(Note::getValeur)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
                moyenne = somme.divide(BigDecimal.valueOf(notesPresents.size()), 2, RoundingMode.HALF_UP);
            }

            BigDecimal moyenneClasse = noteRepository.getMoyenneClasseByPeriode(
                    eleve.getClasse() != null ? eleve.getClasse().getId() : 0L, periodeId);

            NoteMatiereDTO noteMatiere = NoteMatiereDTO.builder()
                    .matiereId(matiere.getId())
                    .matiere(matiere.getNom())
                    .coefficient(coefficient) // Vrai coefficient
                    .moyenne(moyenne)
                    .moyenneClasse(moyenneClasse)
                    .build();
            notesMatieres.add(noteMatiere);

            // Calcul pondéré
            sommeNotesPonderees = sommeNotesPonderees.add(moyenne.multiply(BigDecimal.valueOf(coefficient)));
            sommeCoefficients += coefficient;
        }

        dto.setNotesMatieres(notesMatieres);

        // Moyenne générale pondérée
        BigDecimal moyenneGenerale = BigDecimal.ZERO;
        if (sommeCoefficients > 0) {
            moyenneGenerale = sommeNotesPonderees.divide(
                    BigDecimal.valueOf(sommeCoefficients), 2, RoundingMode.HALF_UP);
        }
        dto.setMoyenneGenerale(moyenneGenerale);

        // Remplir depuis le bulletin existant si disponible
        if (bulletinOpt.isPresent()) {
            Bulletin bulletin = bulletinOpt.get();
            dto.setId(bulletin.getId());
            dto.setRang(bulletin.getRang());
            dto.setTotalEleves(bulletin.getTotalEleves());
            dto.setAppreciation(bulletin.getAppreciation());
            dto.setDateGeneration(bulletin.getDateGeneration());
            dto.setDecision(bulletin.getDecision());
            dto.setAnneeScolaire(bulletin.getAnneeScolaire());
        }

        return dto;
    }

    @Transactional
    public BulletinDTO genererBulletin(Long eleveId, Long periodeId, String appreciation, String decision) {
        Eleve eleve = eleveRepository.findById(eleveId)
                .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé"));
        Periode periode = periodeRepository.findById(periodeId)
                .orElseThrow(() -> new ResourceNotFoundException("Période non trouvée"));

        BulletinDTO calculated = getBulletinEleve(eleveId, periodeId);

        Bulletin bulletin = bulletinRepository.findByEleveIdAndPeriodeId(eleveId, periodeId)
                .orElse(new Bulletin());

        bulletin.setEleve(eleve);
        bulletin.setPeriode(periode);
        bulletin.setMoyenneGenerale(calculated.getMoyenneGenerale());
        bulletin.setAppreciation(appreciation);
        bulletin.setDecision(decision);
        bulletin.setDateGeneration(LocalDate.now());
        bulletin.setAnneeScolaire(periode.getAnneeScolaire());

        // Calculer le rang dans la classe
        if (eleve.getClasse() != null) {
            List<Bulletin> bulletinsClasse = bulletinRepository.findByClasseAndPeriode(
                    eleve.getClasse().getId(), periodeId);
            bulletin.setTotalEleves(bulletinsClasse.size() + 1);
        }

        bulletinRepository.save(bulletin);
        return getBulletinEleve(eleveId, periodeId);
    }

    public List<BulletinDTO> getBulletinsClasse(Long classeId, Long periodeId) {
        return bulletinRepository.findByClasseAndPeriode(classeId, periodeId).stream()
                .map(b -> getBulletinEleve(b.getEleve().getId(), periodeId))
                .collect(Collectors.toList());
    }

    public Map<String, Object> getStatsAcademiques(String anneeScolaire) {
        Map<String, Object> stats = new HashMap<>();
        // Ces stats peuvent être calculées selon les besoins
        stats.put("moyenneGenerale", BigDecimal.valueOf(13.2));
        stats.put("tauxReussite", 78);
        return stats;
    }

    @Transactional
    public List<NoteDTO> createNotesBulk(List<NoteCreateDTO> dtos, boolean upsert) {
        List<NoteDTO> result = new ArrayList<>();

        for (NoteCreateDTO dto : dtos) {
            validateNote(dto);

            Note note;
            if (upsert && dto.getClasseMatiereId() != null) {
                // Chercher si la note existe déjà
                note = noteRepository.findByEleveIdAndClasseMatiereIdAndPeriodeIdAndType(
                    dto.getEleveId(),
                    dto.getClasseMatiereId(),
                    dto.getPeriodeId(),
                    dto.getType()
                ).orElse(new Note());
            } else {
                note = new Note();
            }

            mapDtoToEntity(dto, note);
            result.add(toDTO(noteRepository.save(note)));
        }

        return result;
    }

    private void validateNote(NoteCreateDTO dto) {
        if (dto.getValeur() == null) {
            throw new IllegalArgumentException("La valeur de la note est obligatoire");
        }
        if (dto.getValeur().compareTo(BigDecimal.ZERO) < 0 ||
            dto.getValeur().compareTo(BigDecimal.valueOf(20)) > 0) {
            throw new IllegalArgumentException("La note doit être entre 0 et 20");
        }
        if (dto.getEleveId() == null) {
            throw new IllegalArgumentException("L'ID de l'élève est obligatoire");
        }
        if (dto.getClasseMatiereId() == null && dto.getMatiereId() == null) {
            throw new IllegalArgumentException("ClasseMatiereId ou MatiereId est obligatoire");
        }
        if (dto.getPeriodeId() == null) {
            throw new IllegalArgumentException("La période est obligatoire");
        }
    }

    private void mapDtoToEntity(NoteCreateDTO dto, Note note) {
        // Eleve
        if (dto.getEleveId() != null) {
            note.setEleve(eleveRepository.findById(dto.getEleveId())
                    .orElseThrow(() -> new ResourceNotFoundException("Élève non trouvé")));
        }

        // ClasseMatiere (PRIORITAIRE)
        if (dto.getClasseMatiereId() != null) {
            ClasseMatiere cm = classeMatiereRepository.findById(dto.getClasseMatiereId())
                    .orElseThrow(() -> new ResourceNotFoundException("ClasseMatiere non trouvée"));
            note.setClasseMatiere(cm);
            // Mettre à jour matiere pour compatibilité
            note.setMatiere(cm.getMatiereNiveau().getMatiere());
        }
        // Fallback pour compatibilité ascendante (si matiereId fourni sans classeMatiereId)
        else if (dto.getMatiereId() != null) {
            Matiere matiere = matiereRepository.findById(dto.getMatiereId())
                    .orElseThrow(() -> new ResourceNotFoundException("Matière non trouvée"));
            note.setMatiere(matiere);

            // Essayer de trouver le ClasseMatiere correspondant
            Eleve eleve = note.getEleve();
            if (eleve != null && eleve.getClasse() != null) {
                List<ClasseMatiere> cms = classeMatiereRepository.findByClasseId(eleve.getClasse().getId());
                for (ClasseMatiere cm : cms) {
                    if (cm.getMatiereNiveau().getMatiere().getId().equals(matiere.getId())) {
                        note.setClasseMatiere(cm);
                        break;
                    }
                }
            }
        }

        // Examen
        if (dto.getExamenId() != null) {
            note.setExamen(examenRepository.findById(dto.getExamenId()).orElse(null));
        }

        // Periode
        if (dto.getPeriodeId() != null) {
            note.setPeriode(periodeRepository.findById(dto.getPeriodeId()).orElse(null));
        }

        // Valeurs
        note.setValeur(dto.getValeur());
        note.setType(dto.getType() != null ? dto.getType() : "Devoir");
        note.setDateNote(dto.getDateNote() != null ? dto.getDateNote() : LocalDate.now());
        note.setCommentaire(dto.getCommentaire());
        note.setAnneeScolaire(dto.getAnneeScolaire() != null ? dto.getAnneeScolaire() : "2024-2025");
        note.setAbsent(dto.getAbsent() != null ? dto.getAbsent() : false);
    }

    private NoteDTO toDTO(Note note) {
        NoteDTO dto = NoteDTO.builder()
                .id(note.getId())
                .valeur(note.getValeur())
                .type(note.getType())
                .dateNote(note.getDateNote())
                .commentaire(note.getCommentaire())
                .anneeScolaire(note.getAnneeScolaire())
                .build();

        if (note.getEleve() != null) {
            dto.setEleveId(note.getEleve().getId());
            dto.setEleveNom(note.getEleve().getNom());
            dto.setElevePrenom(note.getEleve().getPrenom());
            dto.setEleveMatricule(note.getEleve().getMatricule());
        }
        if (note.getMatiere() != null) {
            dto.setMatiereId(note.getMatiere().getId());
            dto.setMatiere(note.getMatiere().getNom());
        }
        if (note.getExamen() != null) {
            dto.setExamenId(note.getExamen().getId());
            dto.setExamenNom(note.getExamen().getNom());
        }
        if (note.getPeriode() != null) {
            dto.setPeriodeId(note.getPeriode().getId());
            dto.setPeriode(note.getPeriode().getNom());
        }

        return dto;
    }
}
