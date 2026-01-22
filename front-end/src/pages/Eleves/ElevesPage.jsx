// Page Élèves - Exemple de page refactorisée avec architecture propre
import { useState, useMemo } from 'react'
import { eleveService } from '../../services'
import { useApi, useMutation } from '../../hooks/useApi'
import { Button, Card, Table, Modal, Badge, StatusBadge, Input, Select } from '../../components/ui'
import { StatsGrid, FilterBar } from '../../components/shared'

export default function ElevesPage() {
  // États locaux
  const [search, setSearch] = useState('')
  const [filterClasse, setFilterClasse] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedEleve, setSelectedEleve] = useState(null)

  // Appels API via hooks
  const { data: eleves, loading, error, execute: reloadEleves } = useApi(
    () => eleveService.getAll({ search, classeId: filterClasse, statut: filterStatut }),
    [search, filterClasse, filterStatut]
  )

  const { data: stats } = useApi(() => eleveService.getStats(), [])

  const { mutate: createEleve, loading: creating } = useMutation(eleveService.create)
  const { mutate: updateEleve, loading: updating } = useMutation(eleveService.update)
  const { mutate: deleteEleve } = useMutation(eleveService.delete)

  // Configuration des statistiques
  const statsConfig = useMemo(() => [
    { label: 'Total élèves', value: stats?.total || 0, icon: 'bi-people-fill', color: '#2D3E6f' },
    { label: 'Actifs', value: stats?.actifs || 0, icon: 'bi-check-circle-fill', color: '#10b981' },
    { label: 'Garçons', value: stats?.garcons || 0, icon: 'bi-gender-male', color: '#3b82f6' },
    { label: 'Filles', value: stats?.filles || 0, icon: 'bi-gender-female', color: '#ec4899' },
  ], [stats])

  // Configuration des colonnes du tableau
  const columns = [
    { header: 'Matricule', accessor: 'matricule' },
    {
      header: 'Nom complet',
      render: (row) => `${row.prenom} ${row.nom}`
    },
    { header: 'Classe', accessor: 'classe' },
    {
      header: 'Sexe',
      render: (row) => (
        <Badge variant={row.sexe === 'M' ? 'info' : 'primary'}>
          {row.sexe === 'M' ? 'Garçon' : 'Fille'}
        </Badge>
      )
    },
    {
      header: 'Statut',
      render: (row) => <StatusBadge status={row.statut} />
    },
    {
      header: 'Actions',
      render: (row) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button size="sm" variant="ghost" icon="bi-eye" onClick={() => handleView(row)} />
          <Button size="sm" variant="ghost" icon="bi-pencil" onClick={() => handleEdit(row)} />
          <Button size="sm" variant="ghost" icon="bi-trash" onClick={() => handleDelete(row)} />
        </div>
      )
    }
  ]

  // Handlers
  const handleView = (eleve) => {
    // Navigation vers détail élève
    console.log('Voir élève:', eleve.id)
  }

  const handleEdit = (eleve) => {
    setSelectedEleve(eleve)
    setShowModal(true)
  }

  const handleDelete = async (eleve) => {
    if (confirm(`Supprimer ${eleve.prenom} ${eleve.nom} ?`)) {
      await deleteEleve(eleve.id)
      reloadEleves()
    }
  }

  const handleSubmit = async (formData) => {
    if (selectedEleve) {
      await updateEleve(selectedEleve.id, formData)
    } else {
      await createEleve(formData)
    }
    setShowModal(false)
    setSelectedEleve(null)
    reloadEleves()
  }

  // Options de filtres
  const filterOptions = [
    {
      value: filterClasse,
      onChange: setFilterClasse,
      placeholder: 'Toutes les classes',
      options: [
        { value: '1', label: '3ème Collège A' },
        { value: '2', label: '3ème Collège B' },
        { value: '3', label: '4ème Collège A' },
      ]
    },
    {
      value: filterStatut,
      onChange: setFilterStatut,
      placeholder: 'Tous les statuts',
      options: [
        { value: 'actif', label: 'Actif' },
        { value: 'inactif', label: 'Inactif' },
      ]
    }
  ]

  // Rendu
  if (loading && !eleves) {
    return <div className="loading">Chargement...</div>
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Gestion des Élèves</h1>
      </div>

      <StatsGrid stats={statsConfig} />

      <Card>
        <FilterBar
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Rechercher un élève..."
          filters={filterOptions}
          actions={[
            {
              label: 'Nouvel élève',
              icon: 'bi-plus-lg',
              onClick: () => {
                setSelectedEleve(null)
                setShowModal(true)
              }
            }
          ]}
        />

        <Table
          columns={columns}
          data={eleves || []}
          emptyMessage="Aucun élève trouvé"
          onRowClick={handleView}
        />
      </Card>

      {/* Modal Élève */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          setSelectedEleve(null)
        }}
        title={selectedEleve ? 'Modifier élève' : 'Nouvel élève'}
        size="lg"
      >
        <EleveForm
          eleve={selectedEleve}
          onSubmit={handleSubmit}
          loading={creating || updating}
        />
      </Modal>

      <style>{`
        .page-container {
          padding: 24px;
        }

        .page-header {
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .loading, .error {
          padding: 40px;
          text-align: center;
          color: #6b7280;
        }

        .error {
          color: #ef4444;
        }
      `}</style>
    </div>
  )
}

// Sous-composant formulaire élève
function EleveForm({ eleve, onSubmit, loading }) {
  const [formData, setFormData] = useState({
    nom: eleve?.nom || '',
    prenom: eleve?.prenom || '',
    dateNaissance: eleve?.dateNaissance || '',
    sexe: eleve?.sexe || '',
    classeId: eleve?.classeId || '',
    telephone: eleve?.telephone || '',
    adresse: eleve?.adresse || '',
    parentNom: eleve?.parentNom || '',
    parentTelephone: eleve?.parentTelephone || '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <Input
          label="Nom"
          name="nom"
          value={formData.nom}
          onChange={handleChange}
          required
        />
        <Input
          label="Prénom"
          name="prenom"
          value={formData.prenom}
          onChange={handleChange}
          required
        />
        <Input
          label="Date de naissance"
          name="dateNaissance"
          type="date"
          value={formData.dateNaissance}
          onChange={handleChange}
          required
        />
        <Select
          label="Sexe"
          name="sexe"
          value={formData.sexe}
          onChange={handleChange}
          required
          options={[
            { value: 'M', label: 'Masculin' },
            { value: 'F', label: 'Féminin' },
          ]}
        />
        <Select
          label="Classe"
          name="classeId"
          value={formData.classeId}
          onChange={handleChange}
          required
          options={[
            { value: '1', label: '3ème Collège A' },
            { value: '2', label: '3ème Collège B' },
            { value: '3', label: '4ème Collège A' },
          ]}
        />
        <Input
          label="Téléphone"
          name="telephone"
          value={formData.telephone}
          onChange={handleChange}
        />
        <div style={{ gridColumn: '1 / -1' }}>
          <Input
            label="Adresse"
            name="adresse"
            value={formData.adresse}
            onChange={handleChange}
          />
        </div>
        <Input
          label="Nom du parent"
          name="parentNom"
          value={formData.parentNom}
          onChange={handleChange}
        />
        <Input
          label="Téléphone parent"
          name="parentTelephone"
          value={formData.parentTelephone}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <Button type="submit" loading={loading}>
          {eleve ? 'Modifier' : 'Créer'}
        </Button>
      </div>

      <style>{`
        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 16px;
          border-top: 1px solid #e5e7eb;
        }
      `}</style>
    </form>
  )
}
