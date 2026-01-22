package com.sms.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/maintenance")
@RequiredArgsConstructor
@Slf4j
public class MaintenanceController {

    private final JdbcTemplate jdbcTemplate;

    @PostMapping("/fix-matieres-table")
    public ResponseEntity<Map<String, Object>> fixMatieresTable() {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Starting matieres table fix...");

            // Désactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // Supprimer toutes les contraintes FK possibles
            String[] fkConstraints = {
                "FKlk3w8tgqt7tvgwgsy470bldiw",
                "FKhcfp6q238q1bknvrtr34f6c1u",
                "matieres_ibfk_1",
                "matieres_ibfk_2"
            };

            for (String fkName : fkConstraints) {
                try {
                    jdbcTemplate.execute("ALTER TABLE matieres DROP FOREIGN KEY " + fkName);
                    log.info("Dropped FK: " + fkName);
                    response.put("fk_" + fkName, "DROPPED");
                } catch (Exception e) {
                    log.warn("Could not drop FK " + fkName + ": " + e.getMessage());
                    response.put("fk_" + fkName, "SKIPPED");
                }
            }

            // Supprimer les colonnes niveau_id, cycle_id, coefficient
            try {
                jdbcTemplate.execute("ALTER TABLE matieres DROP COLUMN niveau_id");
                log.info("Dropped column: niveau_id");
                response.put("niveau_id", "DROPPED");
            } catch (Exception e) {
                log.warn("Could not drop niveau_id: " + e.getMessage());
                response.put("niveau_id", "SKIPPED: " + e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE matieres DROP COLUMN cycle_id");
                log.info("Dropped column: cycle_id");
                response.put("cycle_id", "DROPPED");
            } catch (Exception e) {
                log.warn("Could not drop cycle_id: " + e.getMessage());
                response.put("cycle_id", "SKIPPED: " + e.getMessage());
            }

            try {
                jdbcTemplate.execute("ALTER TABLE matieres DROP COLUMN coefficient");
                log.info("Dropped column: coefficient");
                response.put("coefficient", "DROPPED");
            } catch (Exception e) {
                log.warn("Could not drop coefficient: " + e.getMessage());
                response.put("coefficient", "SKIPPED: " + e.getMessage());
            }

            // Réactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            // Vérifier la structure finale
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'matieres' " +
                "ORDER BY ORDINAL_POSITION"
            );

            response.put("status", "SUCCESS");
            response.put("final_structure", columns);
            response.put("message", "Table matieres has been fixed");

            log.info("Matieres table fix completed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fixing matieres table", e);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/check-matieres-structure")
    public ResponseEntity<Map<String, Object>> checkMatieresStructure() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY " +
                "FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'matieres' " +
                "ORDER BY ORDINAL_POSITION"
            );

            response.put("status", "SUCCESS");
            response.put("columns", columns);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/check-classes-structure")
    public ResponseEntity<Map<String, Object>> checkClassesStructure() {
        Map<String, Object> response = new HashMap<>();

        try {
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY, COLUMN_DEFAULT " +
                "FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'classes' " +
                "ORDER BY ORDINAL_POSITION"
            );

            response.put("status", "SUCCESS");
            response.put("columns", columns);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/fix-classes-table")
    public ResponseEntity<Map<String, Object>> fixClassesTable() {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Starting classes table fix...");

            // Désactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // Vérifier les FK sur cycle_id
            List<Map<String, Object>> fks = jdbcTemplate.queryForList(
                "SELECT CONSTRAINT_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'classes' " +
                "AND COLUMN_NAME = 'cycle_id' AND REFERENCED_TABLE_NAME IS NOT NULL"
            );

            for (Map<String, Object> fk : fks) {
                String fkName = (String) fk.get("CONSTRAINT_NAME");
                try {
                    jdbcTemplate.execute("ALTER TABLE classes DROP FOREIGN KEY " + fkName);
                    log.info("Dropped FK: " + fkName);
                    response.put("fk_" + fkName, "DROPPED");
                } catch (Exception e) {
                    log.warn("Could not drop FK " + fkName + ": " + e.getMessage());
                    response.put("fk_" + fkName, "SKIPPED");
                }
            }

            // Supprimer la colonne cycle_id
            try {
                jdbcTemplate.execute("ALTER TABLE classes DROP COLUMN cycle_id");
                log.info("Dropped column: cycle_id");
                response.put("cycle_id", "DROPPED");
            } catch (Exception e) {
                log.warn("Could not drop cycle_id: " + e.getMessage());
                response.put("cycle_id", "SKIPPED: " + e.getMessage());
            }

            // Réactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            // Vérifier la structure finale
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'classes' " +
                "ORDER BY ORDINAL_POSITION"
            );

            response.put("status", "SUCCESS");
            response.put("final_structure", columns);
            response.put("message", "Table classes has been fixed");

            log.info("Classes table fix completed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fixing classes table", e);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/fix-classe-matieres-table")
    public ResponseEntity<Map<String, Object>> fixClasseMatieresTable() {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Starting classe_matieres table fix...");

            // Vérifier si la colonne id existe déjà
            List<Map<String, Object>> columns = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'classe_matieres' " +
                "AND COLUMN_NAME = 'id'"
            );

            if (columns.isEmpty()) {
                // Supprimer l'ancienne clé primaire composite si elle existe
                try {
                    jdbcTemplate.execute("ALTER TABLE classe_matieres DROP PRIMARY KEY");
                    log.info("Dropped old composite primary key");
                    response.put("old_pk", "DROPPED");
                } catch (Exception e) {
                    log.warn("No primary key to drop or error: " + e.getMessage());
                    response.put("old_pk", "SKIPPED");
                }

                // Ajouter la colonne id avec auto_increment
                jdbcTemplate.execute(
                    "ALTER TABLE classe_matieres ADD COLUMN id BIGINT NOT NULL AUTO_INCREMENT FIRST"
                );
                log.info("Added id column to classe_matieres");

                // Ajouter la nouvelle clé primaire
                jdbcTemplate.execute("ALTER TABLE classe_matieres ADD PRIMARY KEY (id)");
                log.info("Added primary key on id");

                response.put("id_column", "ADDED");
                response.put("new_pk", "ADDED");
            } else {
                response.put("id_column", "ALREADY_EXISTS");
            }

            // Vérifier la structure finale
            List<Map<String, Object>> finalStructure = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'classe_matieres' " +
                "ORDER BY ORDINAL_POSITION"
            );

            response.put("status", "SUCCESS");
            response.put("final_structure", finalStructure);
            response.put("message", "Table classe_matieres has been fixed");

            log.info("classe_matieres table fix completed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fixing classe_matieres table", e);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @DeleteMapping("/clear-seances")
    public ResponseEntity<Map<String, Object>> clearSeancesTable() {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Starting seances table cleanup...");

            // Compter le nombre d'enregistrements avant suppression
            Integer countBefore = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM seances", Integer.class
            );
            response.put("count_before", countBefore);

            // Désactiver les contraintes FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // Supprimer les présences liées aux séances
            jdbcTemplate.execute("DELETE FROM presences WHERE seance_id IS NOT NULL");
            log.info("Deleted related presences records");

            // Supprimer tous les enregistrements des séances
            jdbcTemplate.execute("DELETE FROM seances");
            log.info("Deleted all records from seances table");

            // Réinitialiser l'auto_increment
            jdbcTemplate.execute("ALTER TABLE seances AUTO_INCREMENT = 1");
            log.info("Reset auto_increment for seances table");

            // Réactiver les contraintes FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            response.put("status", "SUCCESS");
            response.put("message", "Tous les emplois du temps ont été supprimés définitivement");
            response.put("deleted_count", countBefore);

            log.info("Seances table cleanup completed successfully. Deleted " + countBefore + " records.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error clearing seances table", e);
            // Réactiver les contraintes FK en cas d'erreur
            try { jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1"); } catch (Exception ignored) {}
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/cleanup-professeurs-fk")
    public ResponseEntity<Map<String, Object>> cleanupProfesseursForeignKeys() {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Starting cleanup of orphan FK to professeurs...");

            // Désactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // Chercher toutes les FK orphelines
            List<Map<String, Object>> orphanFks = jdbcTemplate.queryForList(
                "SELECT TABLE_NAME, CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS " +
                "WHERE CONSTRAINT_TYPE = 'FOREIGN KEY' AND TABLE_SCHEMA = 'sms'"
            );

            int droppedCount = 0;
            for (Map<String, Object> fk : orphanFks) {
                String tableName = (String) fk.get("TABLE_NAME");
                String constraintName = (String) fk.get("CONSTRAINT_NAME");

                // Vérifier si la FK pointe vers professeurs
                try {
                    List<Map<String, Object>> refCheck = jdbcTemplate.queryForList(
                        "SELECT REFERENCED_TABLE_NAME FROM information_schema.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = ? AND CONSTRAINT_NAME = ?",
                        tableName, constraintName
                    );

                    for (Map<String, Object> ref : refCheck) {
                        String refTable = (String) ref.get("REFERENCED_TABLE_NAME");
                        if ("professeurs".equals(refTable)) {
                            jdbcTemplate.execute("ALTER TABLE " + tableName + " DROP FOREIGN KEY " + constraintName);
                            log.info("Dropped orphan FK: " + constraintName + " from table " + tableName);
                            response.put("dropped_" + tableName + "_" + constraintName, "SUCCESS");
                            droppedCount++;
                        }
                    }
                } catch (Exception e) {
                    log.warn("Error checking/dropping FK " + constraintName + ": " + e.getMessage());
                }
            }

            // Aussi supprimer la FK spécifique mentionnée dans l'erreur
            String[] specificFks = {
                "FK5yv0jd3emi30yquhtov7cwytv",
                "FKimgx0yrfinb50a76ief7g8nf7"
            };

            String[] tables = {"seances", "classes", "examens"};

            for (String table : tables) {
                for (String fkName : specificFks) {
                    try {
                        jdbcTemplate.execute("ALTER TABLE " + table + " DROP FOREIGN KEY " + fkName);
                        log.info("Dropped specific FK: " + fkName + " from " + table);
                        response.put("dropped_" + table + "_" + fkName, "SUCCESS");
                        droppedCount++;
                    } catch (Exception e) {
                        // FK doesn't exist on this table, ignore
                    }
                }
            }

            // Réactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            response.put("status", "SUCCESS");
            response.put("total_dropped", droppedCount);
            response.put("message", "Orphan FK to professeurs cleaned up");

            log.info("Cleanup completed. Dropped " + droppedCount + " FK constraints.");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error cleaning up FK", e);
            try { jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1"); } catch (Exception ignored) {}
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @PostMapping("/recreate-classe-matieres-table")
    public ResponseEntity<Map<String, Object>> recreateClasseMatieresTable() {
        Map<String, Object> response = new HashMap<>();

        try {
            log.info("Starting classe_matieres table recreation...");

            // Désactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");

            // Supprimer la table existante
            jdbcTemplate.execute("DROP TABLE IF EXISTS classe_matieres");
            log.info("Dropped old classe_matieres table");
            response.put("old_table", "DROPPED");

            // Recréer la table avec la bonne structure
            jdbcTemplate.execute(
                "CREATE TABLE classe_matieres (" +
                "  id BIGINT NOT NULL AUTO_INCREMENT," +
                "  coefficient INT NOT NULL," +
                "  classe_id BIGINT NOT NULL," +
                "  matiere_niveau_id BIGINT NOT NULL," +
                "  PRIMARY KEY (id)," +
                "  CONSTRAINT FK_classe_matieres_classe FOREIGN KEY (classe_id) REFERENCES classes(id)," +
                "  CONSTRAINT FK_classe_matieres_matiere_niveau FOREIGN KEY (matiere_niveau_id) REFERENCES matiere_niveaux(id)" +
                ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"
            );
            log.info("Created new classe_matieres table");
            response.put("new_table", "CREATED");

            // Réactiver les vérifications FK
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");

            // Vérifier la structure finale
            List<Map<String, Object>> finalStructure = jdbcTemplate.queryForList(
                "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS " +
                "WHERE TABLE_SCHEMA = 'sms' AND TABLE_NAME = 'classe_matieres' " +
                "ORDER BY ORDINAL_POSITION"
            );

            response.put("status", "SUCCESS");
            response.put("final_structure", finalStructure);
            response.put("message", "Table classe_matieres has been recreated successfully");

            log.info("classe_matieres table recreation completed successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error recreating classe_matieres table", e);
            response.put("status", "ERROR");
            response.put("error", e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}
