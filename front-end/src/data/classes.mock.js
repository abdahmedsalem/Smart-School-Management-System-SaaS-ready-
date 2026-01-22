// Mock data - Classes et Structure scolaire

// Cycles scolaires
export const cyclesMock = [
  { id: 1, nom: 'Fondamental', ordre: 1 },
  { id: 2, nom: 'Collège', ordre: 2 },
  { id: 3, nom: 'Lycée', ordre: 3 },
]

// Niveaux par cycle
export const niveauxMock = [
  // Fondamental
  { id: 1, nom: '1ère année', cycleId: 1, ordre: 1 },
  { id: 2, nom: '2ème année', cycleId: 1, ordre: 2 },
  { id: 3, nom: '3ème année', cycleId: 1, ordre: 3 },
  { id: 4, nom: '4ème année', cycleId: 1, ordre: 4 },
  { id: 5, nom: '5ème année', cycleId: 1, ordre: 5 },
  { id: 6, nom: '6ème année', cycleId: 1, ordre: 6 },
  // Collège
  { id: 7, nom: '1ère année', cycleId: 2, ordre: 1 },
  { id: 8, nom: '2ème année', cycleId: 2, ordre: 2 },
  { id: 9, nom: '3ème année', cycleId: 2, ordre: 3 },
  { id: 10, nom: '4ème année', cycleId: 2, ordre: 4 },
  // Lycée
  { id: 11, nom: '1ère année', cycleId: 3, ordre: 1 },
  { id: 12, nom: '2ème année', cycleId: 3, ordre: 2 },
  { id: 13, nom: '3ème année (Bac)', cycleId: 3, ordre: 3 },
]

// Spécialités (uniquement pour le Lycée)
export const specialitesMock = [
  { id: 1, code: 'C', nom: 'C (Scientifique)', cycleId: 3 },
  { id: 2, code: 'D', nom: 'D (Sciences Naturelles)', cycleId: 3 },
  { id: 3, code: 'A', nom: 'A (Littéraire)', cycleId: 3 },
  { id: 4, code: 'O', nom: 'O (Originelle)', cycleId: 3 },
]

// Matières par cycle et spécialité
export const matieresByCycleMock = {
  Fondamental: ['Arabe', 'Français', 'Mathématiques', 'Sciences', 'Éducation islamique', 'Éducation civique', 'Sport'],
  Collège: ['Arabe', 'Français', 'Anglais', 'Mathématiques', 'Sciences Physiques', 'Sciences Naturelles', 'Histoire-Géographie', 'Éducation islamique', 'Sport', 'Informatique'],
  Lycée: {
    'C (Scientifique)': ['Mathématiques', 'Physique-Chimie', 'Sciences Naturelles', 'Français', 'Arabe', 'Anglais', 'Philosophie', 'Sport'],
    'D (Sciences Naturelles)': ['Sciences Naturelles', 'Mathématiques', 'Physique-Chimie', 'Français', 'Arabe', 'Anglais', 'Philosophie', 'Sport'],
    'A (Littéraire)': ['Français', 'Arabe', 'Anglais', 'Philosophie', 'Histoire-Géographie', 'Mathématiques', 'Sport'],
    'O (Originelle)': ['Arabe', 'Éducation islamique', 'Fiqh', 'Français', 'Anglais', 'Mathématiques', 'Philosophie', 'Sport'],
  },
}

// Professeurs disponibles
export const professeursMock = [
  { id: 1, nom: 'M. Ahmed Ould Mohamed' },
  { id: 2, nom: 'Mme Fatima Mint Sidi' },
  { id: 3, nom: 'M. Sidi Ould Ahmed' },
  { id: 4, nom: 'M. Mohamed Ould Cheikh' },
  { id: 5, nom: 'Mme Aissata Mint Mohamed' },
  { id: 6, nom: 'M. Oumar Ould Abdallah' },
  { id: 7, nom: 'M. Ibrahim Ould Moussa' },
  { id: 8, nom: 'M. Yacoub Ould Salem' },
  { id: 9, nom: 'Mme Mariem Mint Ely' },
  { id: 10, nom: 'Mme Salma Mint Cheikh' },
  { id: 11, nom: 'M. Brahim Ould Ahmed' },
  { id: 12, nom: 'Mme Khadija Mint Oumar' },
]

// Classes
export const classesMock = [
  { id: 1, nom: '4eme as', cycleId: 2, cycle: 'Collège', niveauId: 10, niveau: '4ème année', specialiteId: null, specialite: null, capacite: 35, effectif: 32, salle: 'Salle 101', statut: 'Active', anneeScolaire: '2024-2025' },
  { id: 2, nom: '6eme af', cycleId: 1, cycle: 'Fondamental', niveauId: 6, niveau: '6ème année', specialiteId: null, specialite: null, capacite: 40, effectif: 30, salle: 'Salle 001', statut: 'Active', anneeScolaire: '2024-2025' },
  { id: 3, nom: 'Terminale C', cycleId: 3, cycle: 'Lycée', niveauId: 13, niveau: '3ème année (Bac)', specialiteId: 1, specialite: 'C (Scientifique)', capacite: 30, effectif: 33, salle: 'Salle 203', statut: 'Active', anneeScolaire: '2024-2025' },
]

// Salles
export const sallesMock = [
  { id: 1, nom: 'Salle 001', capacite: 40, type: 'Cours', equipements: 'Tableau', disponible: true },
  { id: 2, nom: 'Salle 002', capacite: 40, type: 'Cours', equipements: 'Tableau', disponible: true },
  { id: 3, nom: 'Salle 101', capacite: 35, type: 'Cours', equipements: 'Tableau, Projecteur', disponible: true },
  { id: 4, nom: 'Salle 102', capacite: 35, type: 'Cours', equipements: 'Tableau', disponible: true },
  { id: 5, nom: 'Salle 103', capacite: 35, type: 'Cours', equipements: 'Tableau, Projecteur', disponible: true },
  { id: 6, nom: 'Salle 104', capacite: 35, type: 'Cours', equipements: 'Tableau', disponible: true },
  { id: 7, nom: 'Salle 105', capacite: 35, type: 'Cours', equipements: 'Tableau', disponible: true },
  { id: 8, nom: 'Salle 201', capacite: 30, type: 'Cours', equipements: 'Tableau, Projecteur', disponible: true },
  { id: 9, nom: 'Salle 202', capacite: 30, type: 'Cours', equipements: 'Tableau, Projecteur', disponible: true },
  { id: 10, nom: 'Salle 203', capacite: 30, type: 'Cours', equipements: 'Tableau, Projecteur', disponible: true },
  { id: 11, nom: 'Salle 204', capacite: 30, type: 'Cours', equipements: 'Tableau', disponible: true },
  { id: 12, nom: 'Salle 205', capacite: 30, type: 'Cours', equipements: 'Tableau', disponible: true },
  { id: 13, nom: 'Labo Physique', capacite: 25, type: 'Laboratoire', equipements: 'Équipement scientifique', disponible: true },
  { id: 14, nom: 'Labo Info', capacite: 20, type: 'Informatique', equipements: '20 PC, Projecteur', disponible: true },
  { id: 15, nom: 'Salle Sport', capacite: 50, type: 'Sport', equipements: 'Équipement sportif', disponible: true },
]

// Statistiques de la structure
export const structureStatsMock = {
  totalClasses: 3,
  totalEleves: 95,
  totalCapacite: 105,
  tauxRemplissage: 90,
}
