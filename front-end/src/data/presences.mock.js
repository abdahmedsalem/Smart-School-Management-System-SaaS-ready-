// Mock data - Présences
export const presencesMock = [
  { id: 1, eleveId: 1, date: '2025-01-06', statut: 'present', heureArrivee: '08:00', seanceId: 1 },
  { id: 2, eleveId: 1, date: '2025-01-07', statut: 'present', heureArrivee: '08:00', seanceId: 1 },
  { id: 3, eleveId: 1, date: '2025-01-08', statut: 'retard', heureArrivee: '08:25', minutesRetard: 25, seanceId: 1 },
  { id: 4, eleveId: 2, date: '2025-01-06', statut: 'present', heureArrivee: '07:55', seanceId: 1 },
  { id: 5, eleveId: 2, date: '2025-01-07', statut: 'absent', justifie: false, motif: null, seanceId: 1 },
  { id: 6, eleveId: 2, date: '2025-01-08', statut: 'absent', justifie: true, motif: 'Maladie', seanceId: 1 },
  { id: 7, eleveId: 3, date: '2025-01-06', statut: 'present', heureArrivee: '08:00', seanceId: 2 },
  { id: 8, eleveId: 3, date: '2025-01-07', statut: 'present', heureArrivee: '08:00', seanceId: 2 },
  { id: 9, eleveId: 3, date: '2025-01-08', statut: 'present', heureArrivee: '08:00', seanceId: 2 },
]

export const alertesAbsenceMock = [
  {
    id: 1,
    eleveId: 2,
    eleveNom: 'Oumar Ba',
    classe: '6eme af',
    type: 'absences_repetees',
    message: '3 absences non justifiées ce mois',
    dateCreation: '2025-01-08',
    traite: false,
  },
]

export const presenceStatsMock = {
  tauxPresence: 92.5,
  totalAbsences: 45,
  absencesJustifiees: 28,
  absencesNonJustifiees: 17,
  totalRetards: 23,
}
