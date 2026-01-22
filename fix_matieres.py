#!/usr/bin/env python3
"""
Script pour supprimer définitivement les colonnes niveau_id et cycle_id de la table matieres
"""

import mysql.connector
from mysql.connector import Error

def fix_matieres_table():
    try:
        # Connexion à la base de données
        # IMPORTANT: Vérifiez les credentials dans application.yml
        connection = mysql.connector.connect(
            host='localhost',
            database='sms',
            user='root',
            password=''  # Mot de passe vide selon application.yml
        )

        if connection.is_connected():
            cursor = connection.cursor()
            print("✓ Connecté à la base de données MySQL")

            # Désactiver les vérifications de clés étrangères
            cursor.execute("SET FOREIGN_KEY_CHECKS = 0;")
            print("✓ Vérifications FK désactivées")

            # Étape 1: Trouver et supprimer les contraintes FK
            print("\n--- Recherche des contraintes FK sur matieres ---")
            cursor.execute("""
                SELECT CONSTRAINT_NAME
                FROM information_schema.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = 'sms'
                  AND TABLE_NAME = 'matieres'
                  AND REFERENCED_TABLE_NAME IS NOT NULL
            """)

            fk_constraints = cursor.fetchall()
            for (constraint_name,) in fk_constraints:
                try:
                    sql = f"ALTER TABLE matieres DROP FOREIGN KEY {constraint_name};"
                    cursor.execute(sql)
                    print(f"✓ Supprimé FK: {constraint_name}")
                except Error as e:
                    print(f"⚠ Erreur lors de la suppression de {constraint_name}: {e}")

            # Étape 2: Trouver et supprimer les index liés
            print("\n--- Recherche des index sur matieres ---")
            cursor.execute("SHOW INDEX FROM matieres;")
            indexes = cursor.fetchall()

            index_names = set()
            for index_row in indexes:
                index_name = index_row[2]  # Key_name column
                column_name = index_row[4]  # Column_name column
                if column_name in ['niveau_id', 'cycle_id'] and index_name != 'PRIMARY':
                    index_names.add(index_name)

            for index_name in index_names:
                try:
                    sql = f"ALTER TABLE matieres DROP INDEX {index_name};"
                    cursor.execute(sql)
                    print(f"✓ Supprimé INDEX: {index_name}")
                except Error as e:
                    print(f"⚠ Erreur lors de la suppression de l'index {index_name}: {e}")

            # Étape 3: Supprimer les colonnes niveau_id, cycle_id, coefficient
            print("\n--- Suppression des colonnes ---")
            columns_to_drop = ['niveau_id', 'cycle_id', 'coefficient']

            for column in columns_to_drop:
                try:
                    sql = f"ALTER TABLE matieres DROP COLUMN IF EXISTS {column};"
                    cursor.execute(sql)
                    print(f"✓ Supprimé colonne: {column}")
                except Error as e:
                    print(f"⚠ Erreur lors de la suppression de {column}: {e}")

            # Réactiver les vérifications de clés étrangères
            cursor.execute("SET FOREIGN_KEY_CHECKS = 1;")
            print("\n✓ Vérifications FK réactivées")

            # Vérification finale
            print("\n--- Structure finale de la table matieres ---")
            cursor.execute("DESCRIBE matieres;")
            columns = cursor.fetchall()

            for column in columns:
                print(f"  - {column[0]} ({column[1]})")

            # Valider les changements
            connection.commit()
            print("\n✅ Modifications validées avec succès!")

            # Afficher les données
            print("\n--- Données de la table matieres ---")
            cursor.execute("SELECT id, nom, code FROM matieres LIMIT 5;")
            rows = cursor.fetchall()
            for row in rows:
                print(f"  {row[0]}: {row[1]} ({row[2]})")

    except Error as e:
        print(f"❌ Erreur MySQL: {e}")
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()
            print("\n✓ Connexion fermée")

if __name__ == "__main__":
    print("=== Script de correction de la table matieres ===\n")
    fix_matieres_table()
