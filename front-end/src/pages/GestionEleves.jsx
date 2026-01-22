import React, { useState, useMemo, useEffect } from "react"
import { useFilterStore } from "../stores/useFilterStore"
import FilterDrawer from "../components/FilterDrawer"
import DataTable from "../components/DataTable"
import EleveDetail from "./EleveDetail"
import { eleveService } from "../services/eleveService"
import { classeService } from "../services/classeService"
import { paiementService } from "../services/paiementService"
import { useToast } from "../components/Toast"
import jsPDF from "jspdf"
import * as XLSX from "xlsx"

// Formulaire d'inscription complet
function InscriptionModal({ onClose, onSuccess, toast }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [formData, setFormData] = useState({
    // Étape 1: Informations personnelles
    nom: '',
    prenom: '',
    dateNaissance: '',
    lieuNaissance: '',
    sexe: '',
    nationalite: 'Mauritanienne',
    adresse: '',
    wilaya: '',
    moughataa: '',
    // Étape 2: Parents/Tuteurs
    nomPere: '',
    professionPere: '',
    telPere: '',
    emailPere: '',
    nomMere: '',
    professionMere: '',
    telMere: '',
    tuteurNom: '',
    tuteurTel: '',
    tuteurRelation: '',
    // Étape 3: Scolarité
    classeId: '',
    ancienEtablissement: '',
    // Étape 4: Documents
    documents: {
      certificatNaissance: false,
      photoIdentite: false,
      certificatScolarite: false,
      bulletinAncien: false,
      copieCINParent: false,
    },
    // Étape 5: Paiement
    paiement: {
      fraisInscription: true,
      fraisMoisEnCours: true,
      montantPaye: 0,
      modePaiement: 'especes',
      referencePaiement: '',
      datePaiement: new Date().toISOString().split('T')[0],
    }
  })

  // Charger les classes disponibles
  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await classeService.getAllClasses()
        console.log('Classes chargées:', data)
        // Filtrer les classes actives, ou toutes si aucune n'est active
        const activeClasses = data.filter(c => c.statut === 'Active' || c.statut === 'ACTIVE' || c.statut === 'active')
        setClasses(activeClasses.length > 0 ? activeClasses : data)
      } catch (error) {
        console.error('Erreur chargement classes:', error)
        toast?.error('Erreur lors du chargement des classes')
      }
    }
    loadClasses()
  }, [])

  const steps = [
    { id: 1, title: 'Informations personnelles', icon: 'bi-person-fill' },
    { id: 2, title: 'Parents / Tuteurs', icon: 'bi-people-fill' },
    { id: 3, title: 'Scolarité', icon: 'bi-mortarboard-fill' },
    { id: 4, title: 'Documents', icon: 'bi-folder-fill' },
    { id: 5, title: 'Paiement', icon: 'bi-credit-card-fill' },
  ]

  const wilayas = ["Nouakchott-Nord", "Nouakchott-Ouest", "Nouakchott-Sud", "Nouadhibou", "Atar", "Kaédi", "Rosso", "Zouérate", "Kiffa", "Néma", "Aioun", "Tidjikja", "Sélibaby"]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleDocChange = (doc, checked) => {
    setFormData(prev => ({
      ...prev,
      documents: { ...prev.documents, [doc]: checked }
    }))
  }

  const nextStep = () => {
    if (step < 5) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  // Vérifier si les champs obligatoires sont remplis
  const validateForm = () => {
    const errors = []
    if (!formData.nom) errors.push('Nom')
    if (!formData.prenom) errors.push('Prénom')
    if (!formData.dateNaissance) errors.push('Date de naissance')
    if (!formData.sexe) errors.push('Sexe')
    if (!formData.wilaya) errors.push('Wilaya')
    if (!formData.telPere && !formData.telMere) errors.push('Téléphone parent')
    if (!formData.classeId) errors.push('Classe')
    return errors
  }

  const handleSubmit = async () => {
    const errors = validateForm()
    if (errors.length > 0) {
      toast.warning(`Champs obligatoires manquants: ${errors.join(', ')}`)
      return
    }

    setLoading(true)
    try {
      // Préparer les données pour l'API
      const eleveData = {
        nom: formData.nom,
        prenom: formData.prenom,
        dateNaissance: formData.dateNaissance,
        lieuNaissance: formData.lieuNaissance,
        sexe: formData.sexe,
        nationalite: formData.nationalite,
        adresse: formData.adresse,
        wilaya: formData.wilaya,
        moughataa: formData.moughataa,
        nomPere: formData.nomPere,
        professionPere: formData.professionPere,
        telPere: formData.telPere,
        emailPere: formData.emailPere,
        nomMere: formData.nomMere,
        professionMere: formData.professionMere,
        telMere: formData.telMere,
        tuteurNom: formData.tuteurNom,
        tuteurTel: formData.tuteurTel,
        tuteurRelation: formData.tuteurRelation,
        classeId: parseInt(formData.classeId),
        ancienEtablissement: formData.ancienEtablissement,
      }

      const newEleve = await eleveService.create(eleveData)

      // Créer les paiements sélectionnés
      const paiementsToCreate = []
      const currentDate = new Date().toISOString().split('T')[0]
      const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })

      // Frais d'inscription (typeFraisId: 1)
      if (formData.paiement.fraisInscription) {
        paiementsToCreate.push({
          eleveId: newEleve.id,
          typeFraisId: 1, // INSCRIPTION
          montant: 15000,
          montantPaye: formData.paiement.montantPaye > 0 ? Math.min(formData.paiement.montantPaye, 15000) : 0,
          modePaiement: formData.paiement.modePaiement,
          referencePaiement: formData.paiement.referencePaiement,
          datePaiement: formData.paiement.montantPaye > 0 ? currentDate : null,
          anneeScolaire: '2024-2025',
          commentaire: 'Paiement à l\'inscription'
        })
      }

      // Scolarité mois en cours (typeFraisId: 2)
      if (formData.paiement.fraisMoisEnCours) {
        const montantRestant = formData.paiement.montantPaye > 15000 ? formData.paiement.montantPaye - 15000 : 0
        paiementsToCreate.push({
          eleveId: newEleve.id,
          typeFraisId: 2, // SCOLARITE
          montant: 25000,
          montantPaye: formData.paiement.fraisInscription ? montantRestant : Math.min(formData.paiement.montantPaye, 25000),
          modePaiement: formData.paiement.modePaiement,
          referencePaiement: formData.paiement.referencePaiement,
          datePaiement: montantRestant > 0 || (!formData.paiement.fraisInscription && formData.paiement.montantPaye > 0) ? currentDate : null,
          moisConcerne: currentMonth,
          anneeScolaire: '2024-2025',
          commentaire: 'Scolarité - inscription'
        })
      }

      // Créer tous les paiements
      if (paiementsToCreate.length > 0) {
        console.log('Paiements à créer:', paiementsToCreate)
        for (const paiementData of paiementsToCreate) {
          try {
            const result = await paiementService.create(paiementData)
            console.log('Paiement créé:', result)
          } catch (err) {
            console.error('Erreur création paiement:', err)
            toast.warning('Élève inscrit mais erreur lors de l\'enregistrement du paiement')
          }
        }
      }

      // Trouver la classe sélectionnée pour l'affichage
      const selectedClasse = classes.find(c => c.id === parseInt(formData.classeId))

      toast.success(`Inscription réussie! ${newEleve.prenom} ${newEleve.nom} - Matricule: ${newEleve.matricule}`)

      if (onSuccess) onSuccess(newEleve)
      onClose()
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error)
      toast.error('Erreur lors de l\'inscription. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-inscription" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5><i className="bi bi-person-plus-fill me-2"></i>Nouvelle Inscription</h5>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        {/* Stepper */}
        <div className="stepper">
          {steps.map((s, index) => (
            <div key={s.id} className={`step ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
              <div className="step-indicator">
                {step > s.id ? <i className="bi bi-check-lg"></i> : <i className={`bi ${s.icon}`}></i>}
              </div>
              <span className="step-title">{s.title}</span>
              {index < steps.length - 1 && <div className="step-line"></div>}
            </div>
          ))}
        </div>

        <div className="modal-body">
          {/* Étape 1: Informations personnelles */}
          {step === 1 && (
            <div className="step-content">
              <h6 className="section-title"><i className="bi bi-person-vcard"></i> Informations de l'élève</h6>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Nom</label>
                  <input type="text" className="form-control" placeholder="Ould Mohamed" value={formData.nom} onChange={(e) => handleChange('nom', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Prénom</label>
                  <input type="text" className="form-control" placeholder="Ahmed" value={formData.prenom} onChange={(e) => handleChange('prenom', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Date de naissance</label>
                  <input type="date" className="form-control" value={formData.dateNaissance} onChange={(e) => handleChange('dateNaissance', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Lieu de naissance</label>
                  <input type="text" className="form-control" placeholder="Nouakchott" value={formData.lieuNaissance} onChange={(e) => handleChange('lieuNaissance', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Sexe</label>
                  <select className="form-select" value={formData.sexe} onChange={(e) => handleChange('sexe', e.target.value)}>
                    <option value="">Sélectionner...</option>
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Nationalité</label>
                  <input type="text" className="form-control" value={formData.nationalite} onChange={(e) => handleChange('nationalite', e.target.value)} />
                </div>
              </div>
              <h6 className="section-title mt-3"><i className="bi bi-geo-alt"></i> Adresse</h6>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Adresse complète</label>
                  <input type="text" className="form-control" placeholder="Rue, Quartier..." value={formData.adresse} onChange={(e) => handleChange('adresse', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Wilaya</label>
                  <select className="form-select" value={formData.wilaya} onChange={(e) => handleChange('wilaya', e.target.value)}>
                    <option value="">Sélectionner...</option>
                    {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Moughataa</label>
                  <input type="text" className="form-control" placeholder="Moughataa" value={formData.moughataa} onChange={(e) => handleChange('moughataa', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Étape 2: Parents/Tuteurs */}
          {step === 2 && (
            <div className="step-content">
              <h6 className="section-title"><i className="bi bi-person"></i> Père</h6>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label required">Nom complet</label>
                  <input type="text" className="form-control" placeholder="Mohamed Ould Ahmed" value={formData.nomPere} onChange={(e) => handleChange('nomPere', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Profession</label>
                  <input type="text" className="form-control" placeholder="Fonctionnaire" value={formData.professionPere} onChange={(e) => handleChange('professionPere', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label required">Téléphone</label>
                  <input type="tel" className="form-control" placeholder="+222 XX XXX XXX" value={formData.telPere} onChange={(e) => handleChange('telPere', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="email@example.com" value={formData.emailPere} onChange={(e) => handleChange('emailPere', e.target.value)} />
                </div>
              </div>
              <h6 className="section-title mt-3"><i className="bi bi-person"></i> Mère</h6>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nom complet</label>
                  <input type="text" className="form-control" placeholder="Fatima Mint Sidi" value={formData.nomMere} onChange={(e) => handleChange('nomMere', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Profession</label>
                  <input type="text" className="form-control" placeholder="Enseignante" value={formData.professionMere} onChange={(e) => handleChange('professionMere', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input type="tel" className="form-control" placeholder="+222 XX XXX XXX" value={formData.telMere} onChange={(e) => handleChange('telMere', e.target.value)} />
                </div>
              </div>
              <h6 className="section-title mt-3"><i className="bi bi-person-badge"></i> Tuteur (si différent des parents)</h6>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Nom du tuteur</label>
                  <input type="text" className="form-control" placeholder="Nom complet" value={formData.tuteurNom} onChange={(e) => handleChange('tuteurNom', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Téléphone</label>
                  <input type="tel" className="form-control" placeholder="+222 XX XXX XXX" value={formData.tuteurTel} onChange={(e) => handleChange('tuteurTel', e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Relation avec l'élève</label>
                  <select className="form-select" value={formData.tuteurRelation} onChange={(e) => handleChange('tuteurRelation', e.target.value)}>
                    <option value="">Sélectionner...</option>
                    <option value="Oncle">Oncle</option>
                    <option value="Tante">Tante</option>
                    <option value="Grand-parent">Grand-parent</option>
                    <option value="Frère/Sœur">Frère/Sœur</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Étape 3: Scolarité */}
          {step === 3 && (
            <div className="step-content">
              <h6 className="section-title"><i className="bi bi-mortarboard"></i> Inscription</h6>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label required">Classe</label>
                  <select className="form-select" value={formData.classeId} onChange={(e) => handleChange('classeId', e.target.value)}>
                    <option value="">Sélectionner la classe...</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.nom} {c.niveau ? `(${c.niveau})` : ''} {c.cycle ? `- ${c.cycle}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <h6 className="section-title mt-3"><i className="bi bi-clock-history"></i> Historique scolaire</h6>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label className="form-label">Ancien établissement</label>
                  <input type="text" className="form-control" placeholder="Nom de l'école précédente" value={formData.ancienEtablissement} onChange={(e) => handleChange('ancienEtablissement', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Étape 4: Documents */}
          {step === 4 && (
            <div className="step-content">
              <h6 className="section-title"><i className="bi bi-folder-check"></i> Documents requis</h6>
              <p className="text-muted mb-3">Cochez les documents fournis par le parent. Les documents marqués d'un * sont obligatoires.</p>
              <div className="documents-checklist">
                <label className="doc-check">
                  <input type="checkbox" checked={formData.documents.certificatNaissance} onChange={(e) => handleDocChange('certificatNaissance', e.target.checked)} />
                  <span className="doc-check-box"><i className="bi bi-check"></i></span>
                  <span className="doc-check-label">Certificat de naissance <span className="required">*</span></span>
                </label>
                <label className="doc-check">
                  <input type="checkbox" checked={formData.documents.photoIdentite} onChange={(e) => handleDocChange('photoIdentite', e.target.checked)} />
                  <span className="doc-check-box"><i className="bi bi-check"></i></span>
                  <span className="doc-check-label">Photo d'identité (4x4) <span className="required">*</span></span>
                </label>
                <label className="doc-check">
                  <input type="checkbox" checked={formData.documents.certificatScolarite} onChange={(e) => handleDocChange('certificatScolarite', e.target.checked)} />
                  <span className="doc-check-box"><i className="bi bi-check"></i></span>
                  <span className="doc-check-label">Certificat de scolarité (ancien établissement) <span className="required">*</span></span>
                </label>
                <label className="doc-check">
                  <input type="checkbox" checked={formData.documents.bulletinAncien} onChange={(e) => handleDocChange('bulletinAncien', e.target.checked)} />
                  <span className="doc-check-box"><i className="bi bi-check"></i></span>
                  <span className="doc-check-label">Dernier bulletin scolaire</span>
                </label>
                <label className="doc-check">
                  <input type="checkbox" checked={formData.documents.carnetVaccination} onChange={(e) => handleDocChange('carnetVaccination', e.target.checked)} />
                  <span className="doc-check-box"><i className="bi bi-check"></i></span>
                  <span className="doc-check-label">Carnet de vaccination <span className="required">*</span></span>
                </label>
                <label className="doc-check">
                  <input type="checkbox" checked={formData.documents.certificatMedical} onChange={(e) => handleDocChange('certificatMedical', e.target.checked)} />
                  <span className="doc-check-box"><i className="bi bi-check"></i></span>
                  <span className="doc-check-label">Certificat médical d'aptitude <span className="required">*</span></span>
                </label>
                <label className="doc-check">
                  <input type="checkbox" checked={formData.documents.copieCINParent} onChange={(e) => handleDocChange('copieCINParent', e.target.checked)} />
                  <span className="doc-check-box"><i className="bi bi-check"></i></span>
                  <span className="doc-check-label">Copie CIN du parent/tuteur <span className="required">*</span></span>
                </label>
              </div>
            </div>
          )}

          {/* Étape 5: Paiement */}
          {step === 5 && (
            <div className="step-content">
              <h6 className="section-title"><i className="bi bi-credit-card"></i> Paiement à l'inscription</h6>

              {/* Récapitulatif */}
              <div className="paiement-recap">
                <div className="recap-header">
                  <i className="bi bi-clipboard-check"></i>
                  <span>Résumé de l'inscription</span>
                </div>
                <div className="recap-details">
                  <div className="recap-line">
                    <span>Élève</span>
                    <span>{formData.prenom} {formData.nom || '—'}</span>
                  </div>
                  <div className="recap-line">
                    <span>Classe</span>
                    <span>{classes.find(c => c.id === parseInt(formData.classeId))?.nom || '—'}</span>
                  </div>
                  <div className="recap-line">
                    <span>Wilaya</span>
                    <span>{formData.wilaya || '—'}</span>
                  </div>
                  <div className="recap-line">
                    <span>Contact parent</span>
                    <span>{formData.telPere || formData.telMere || '—'}</span>
                  </div>
                </div>
              </div>

              {/* Frais à payer */}
              <h6 className="section-title mt-3"><i className="bi bi-cash-stack"></i> Frais à payer</h6>
              <div className="frais-list">
                <label className="frais-item">
                  <input
                    type="checkbox"
                    checked={formData.paiement.fraisInscription}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, fraisInscription: e.target.checked }
                    }))}
                  />
                  <span className="frais-check-box"><i className="bi bi-check"></i></span>
                  <span className="frais-label">Frais d'inscription</span>
                  <span className="frais-montant">15 000 MRU</span>
                </label>
                <label className="frais-item">
                  <input
                    type="checkbox"
                    checked={formData.paiement.fraisMoisEnCours}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, fraisMoisEnCours: e.target.checked }
                    }))}
                  />
                  <span className="frais-check-box"><i className="bi bi-check"></i></span>
                  <span className="frais-label">Scolarité mois en cours</span>
                  <span className="frais-montant">25 000 MRU</span>
                </label>
                <div className="frais-total">
                  <span>Total à payer</span>
                  <span className="total-montant">
                    {((formData.paiement.fraisInscription ? 15000 : 0) + (formData.paiement.fraisMoisEnCours ? 25000 : 0)).toLocaleString()} MRU
                  </span>
                </div>
              </div>

              {/* Mode de paiement */}
              <h6 className="section-title mt-3"><i className="bi bi-wallet2"></i> Mode de paiement</h6>
              <div className="paiement-modes">
                <label className={`mode-option ${formData.paiement.modePaiement === 'especes' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="modePaiement"
                    value="especes"
                    checked={formData.paiement.modePaiement === 'especes'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, modePaiement: e.target.value }
                    }))}
                  />
                  <i className="bi bi-cash-coin"></i>
                  <span>Espèces</span>
                </label>
                <label className={`mode-option ${formData.paiement.modePaiement === 'virement' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="modePaiement"
                    value="virement"
                    checked={formData.paiement.modePaiement === 'virement'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, modePaiement: e.target.value }
                    }))}
                  />
                  <i className="bi bi-bank"></i>
                  <span>Virement</span>
                </label>
                <label className={`mode-option ${formData.paiement.modePaiement === 'cheque' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="modePaiement"
                    value="cheque"
                    checked={formData.paiement.modePaiement === 'cheque'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, modePaiement: e.target.value }
                    }))}
                  />
                  <i className="bi bi-credit-card-2-back"></i>
                  <span>Chèque</span>
                </label>
                <label className={`mode-option ${formData.paiement.modePaiement === 'mobile' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="modePaiement"
                    value="mobile"
                    checked={formData.paiement.modePaiement === 'mobile'}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, modePaiement: e.target.value }
                    }))}
                  />
                  <i className="bi bi-phone"></i>
                  <span>Mobile Money</span>
                </label>
              </div>

              {/* Montant payé */}
              <div className="form-grid mt-3">
                <div className="form-group">
                  <label className="form-label">Montant payé (MRU)</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="0"
                    value={formData.paiement.montantPaye}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, montantPaye: parseInt(e.target.value) || 0 }
                    }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Référence paiement</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="N° reçu, référence..."
                    value={formData.paiement.referencePaiement}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      paiement: { ...prev.paiement, referencePaiement: e.target.value }
                    }))}
                  />
                </div>
              </div>

              {/* Reste à payer */}
              {(() => {
                const total = (formData.paiement.fraisInscription ? 15000 : 0) + (formData.paiement.fraisMoisEnCours ? 25000 : 0)
                const reste = total - formData.paiement.montantPaye
                return reste > 0 ? (
                  <div className="reste-payer-box mt-3">
                    <i className="bi bi-exclamation-triangle"></i>
                    <span>Reste à payer: <strong>{reste.toLocaleString()} MRU</strong></span>
                  </div>
                ) : formData.paiement.montantPaye > 0 ? (
                  <div className="paiement-complet-box mt-3">
                    <i className="bi bi-check-circle"></i>
                    <span>Paiement complet</span>
                  </div>
                ) : null
              })()}

            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            <span className="step-counter">Étape {step} sur {steps.length}</span>
          </div>
          <div className="footer-right">
            {step > 1 && (
              <button type="button" className="btn-secondary" onClick={prevStep}>
                <i className="bi bi-arrow-left"></i> Précédent
              </button>
            )}
            {step < 5 ? (
              <button type="button" className="btn-primary" onClick={nextStep}>
                Suivant <i className="bi bi-arrow-right"></i>
              </button>
            ) : (
              <button type="button" className="btn-success" onClick={handleSubmit} disabled={loading}>
                {loading ? <><i className="bi bi-hourglass-split"></i> En cours...</> : <><i className="bi bi-check-lg"></i> Valider l'inscription</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Modal de modification d'élève
function EditEleveModal({ eleve, onClose, onSuccess, toast }) {
  const [loading, setLoading] = useState(false)
  const [classes, setClasses] = useState([])
  const [formData, setFormData] = useState({
    nom: eleve.nom || '',
    prenom: eleve.prenom || '',
    dateNaissance: eleve.dateNaissance || '',
    lieuNaissance: eleve.lieuNaissance || '',
    sexe: eleve.sexe || '',
    nationalite: eleve.nationalite || 'Mauritanienne',
    adresse: eleve.adresse || '',
    wilaya: eleve.wilaya || '',
    moughataa: eleve.moughataa || '',
    nomPere: eleve.nomPere || '',
    professionPere: eleve.professionPere || '',
    telPere: eleve.telPere || '',
    emailPere: eleve.emailPere || '',
    nomMere: eleve.nomMere || '',
    professionMere: eleve.professionMere || '',
    telMere: eleve.telMere || '',
    tuteurNom: eleve.tuteurNom || '',
    tuteurTel: eleve.tuteurTel || '',
    tuteurRelation: eleve.tuteurRelation || '',
    classeId: eleve.classeId || '',
    ancienEtablissement: eleve.ancienEtablissement || '',
    statut: eleve.statut || 'Actif',
  })

  const wilayas = ["Nouakchott-Nord", "Nouakchott-Ouest", "Nouakchott-Sud", "Nouadhibou", "Atar", "Kaédi", "Rosso", "Zouérate", "Kiffa", "Néma", "Aioun", "Tidjikja", "Sélibaby"]

  useEffect(() => {
    const loadClasses = async () => {
      try {
        const data = await classeService.getAllClasses()
        setClasses(data.filter(c => c.statut === 'Active'))
      } catch (error) {
        console.error('Erreur chargement classes:', error)
      }
    }
    loadClasses()
  }, [])

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.nom || !formData.prenom) {
      toast.warning('Veuillez remplir les champs obligatoires (Nom et Prénom)')
      return
    }

    setLoading(true)
    try {
      const updateData = {
        ...formData,
        classeId: formData.classeId ? parseInt(formData.classeId) : null,
      }
      const updatedEleve = await eleveService.update(eleve.id, updateData)
      toast.success(`Élève ${updatedEleve.prenom} ${updatedEleve.nom} modifié avec succès`)
      onSuccess(updatedEleve)
    } catch (error) {
      console.error('Erreur modification:', error)
      toast.error('Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-inscription" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h5><i className="bi bi-pencil-square me-2"></i>Modifier l'élève: {eleve.prenom} {eleve.nom}</h5>
          <button className="btn-close-modal" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>

        <div className="modal-body">
          {/* Informations personnelles */}
          <h6 className="section-title"><i className="bi bi-person-vcard"></i> Informations personnelles</h6>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label required">Nom</label>
              <input type="text" className="form-control" value={formData.nom} onChange={(e) => handleChange('nom', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label required">Prénom</label>
              <input type="text" className="form-control" value={formData.prenom} onChange={(e) => handleChange('prenom', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Date de naissance</label>
              <input type="text" className="form-control" placeholder="JJ/MM/AAAA" value={formData.dateNaissance} onChange={(e) => handleChange('dateNaissance', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Lieu de naissance</label>
              <input type="text" className="form-control" value={formData.lieuNaissance} onChange={(e) => handleChange('lieuNaissance', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Sexe</label>
              <select className="form-select" value={formData.sexe} onChange={(e) => handleChange('sexe', e.target.value)}>
                <option value="">Sélectionner...</option>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Wilaya</label>
              <select className="form-select" value={formData.wilaya} onChange={(e) => handleChange('wilaya', e.target.value)}>
                <option value="">Sélectionner...</option>
                {wilayas.map(w => <option key={w} value={w}>{w}</option>)}
              </select>
            </div>
            <div className="form-group full-width">
              <label className="form-label">Adresse</label>
              <input type="text" className="form-control" value={formData.adresse} onChange={(e) => handleChange('adresse', e.target.value)} />
            </div>
          </div>

          {/* Parents */}
          <h6 className="section-title mt-3"><i className="bi bi-people"></i> Parents / Tuteurs</h6>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Nom du père</label>
              <input type="text" className="form-control" value={formData.nomPere} onChange={(e) => handleChange('nomPere', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tél. père</label>
              <input type="text" className="form-control" value={formData.telPere} onChange={(e) => handleChange('telPere', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Nom de la mère</label>
              <input type="text" className="form-control" value={formData.nomMere} onChange={(e) => handleChange('nomMere', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Tél. mère</label>
              <input type="text" className="form-control" value={formData.telMere} onChange={(e) => handleChange('telMere', e.target.value)} />
            </div>
          </div>

          {/* Scolarité */}
          <h6 className="section-title mt-3"><i className="bi bi-mortarboard"></i> Scolarité</h6>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Classe</label>
              <select className="form-select" value={formData.classeId} onChange={(e) => handleChange('classeId', e.target.value)}>
                <option value="">Sélectionner...</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.nom} {c.niveau ? `(${c.niveau})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Statut</label>
              <select className="form-select" value={formData.statut} onChange={(e) => handleChange('statut', e.target.value)}>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
              </select>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <div className="footer-left">
            <span className="text-muted">Matricule: {eleve.matricule}</span>
          </div>
          <div className="footer-right">
            <button type="button" className="btn-secondary" onClick={onClose}>
              <i className="bi bi-x"></i> Annuler
            </button>
            <button type="button" className="btn-success" onClick={handleSubmit} disabled={loading}>
              {loading ? <><i className="bi bi-hourglass-split"></i> En cours...</> : <><i className="bi bi-check-lg"></i> Enregistrer</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Filter options
const filterOptions = {
  classes: ["6ème", "5ème", "4ème", "3ème", "2nde", "1ère", "Terminale"],
  wilayas: ["Nouakchott-Nord", "Nouakchott-Ouest", "Nouakchott-Sud", "Nouadhibou", "Atar", "Kaédi", "Rosso", "Zouérate", "Kiffa", "Néma", "Aioun", "Tidjikja", "Sélibaby"],
  statuts: ["Actif", "Inactif"],
}

// Skeleton Loading Component for DataTable
function TableSkeleton({ rows = 8, columns = 6 }) {
  return (
    <div className="table-skeleton">
      {/* Header skeleton */}
      <div className="skeleton-header">
        {Array.from({ length: columns }).map((_, i) => (
          <div key={i} className="skeleton-header-cell">
            <div className="skeleton-box skeleton-header-text"></div>
          </div>
        ))}
      </div>

      {/* Rows skeleton */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-row">
          {/* Avatar + Name cell */}
          <div className="skeleton-cell skeleton-cell-avatar">
            <div className="skeleton-avatar"></div>
            <div className="skeleton-name-group">
              <div className="skeleton-box skeleton-name"></div>
              <div className="skeleton-box skeleton-subtext"></div>
            </div>
          </div>

          {/* Regular cells */}
          {Array.from({ length: columns - 2 }).map((_, cellIndex) => (
            <div key={cellIndex} className="skeleton-cell">
              <div className={`skeleton-box skeleton-text ${cellIndex === columns - 3 ? 'skeleton-badge' : ''}`}></div>
            </div>
          ))}

          {/* Actions cell */}
          <div className="skeleton-cell skeleton-cell-actions">
            <div className="skeleton-box skeleton-action"></div>
          </div>
        </div>
      ))}

      {/* Pagination skeleton */}
      <div className="skeleton-pagination">
        <div className="skeleton-box skeleton-page-info"></div>
        <div className="skeleton-page-buttons">
          <div className="skeleton-box skeleton-page-btn"></div>
          <div className="skeleton-box skeleton-page-btn"></div>
          <div className="skeleton-box skeleton-page-btn"></div>
        </div>
      </div>

      <style>{`
        .table-skeleton {
          background: white;
          border-radius: 12px;
          overflow: hidden;
        }

        .skeleton-box {
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          border-radius: 4px;
        }

        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-header {
          display: flex;
          padding: 16px 20px;
          background: #f8f9fa;
          border-bottom: 1px solid #e9ecef;
          gap: 16px;
        }

        .skeleton-header-cell {
          flex: 1;
        }

        .skeleton-header-cell:first-child {
          flex: 2;
        }

        .skeleton-header-cell:last-child {
          flex: 0.5;
        }

        .skeleton-header-text {
          height: 14px;
          width: 70%;
        }

        .skeleton-row {
          display: flex;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f0f0;
          gap: 16px;
          align-items: center;
        }

        .skeleton-row:last-child {
          border-bottom: none;
        }

        .skeleton-row:nth-child(even) {
          background: #fafbfc;
        }

        .skeleton-cell {
          flex: 1;
        }

        .skeleton-cell-avatar {
          flex: 2;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .skeleton-cell-actions {
          flex: 0.5;
          display: flex;
          justify-content: center;
        }

        .skeleton-avatar {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: skeleton-shimmer 1.5s infinite;
          flex-shrink: 0;
        }

        .skeleton-name-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }

        .skeleton-name {
          height: 14px;
          width: 75%;
        }

        .skeleton-subtext {
          height: 10px;
          width: 50%;
        }

        .skeleton-text {
          height: 14px;
          width: 60%;
        }

        .skeleton-badge {
          width: 60px;
          height: 24px;
          border-radius: 12px;
        }

        .skeleton-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
        }

        .skeleton-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-top: 1px solid #e9ecef;
          background: #f8f9fa;
        }

        .skeleton-page-info {
          height: 14px;
          width: 150px;
        }

        .skeleton-page-buttons {
          display: flex;
          gap: 8px;
        }

        .skeleton-page-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
        }
      `}</style>
    </div>
  )
}

// Export Dropdown Component
function ExportDropdown({ data, toast }) {
  const [isOpen, setIsOpen] = useState(false)
  const [exporting, setExporting] = useState(false)
  const dropdownRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  // Export PDF
  const handleExportPDF = () => {
    setExporting(true)
    try {
      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      // Titre
      doc.setFontSize(18)
      doc.setTextColor(45, 62, 111)
      doc.text("Liste des Élèves", pageWidth / 2, 20, { align: "center" })

      // Date
      doc.setFontSize(10)
      doc.setTextColor(100)
      doc.text(`Exporté le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 28, { align: "center" })

      // En-têtes de tableau
      const headers = ["Matricule", "Nom", "Prénom", "Classe", "Statut"]
      const colWidths = [35, 40, 40, 40, 30]
      let startX = 15
      let y = 40

      // Header row
      doc.setFillColor(45, 62, 111)
      doc.rect(startX, y - 6, colWidths.reduce((a, b) => a + b, 0), 10, 'F')
      doc.setFontSize(10)
      doc.setTextColor(255)
      let x = startX
      headers.forEach((header, i) => {
        doc.text(header, x + 2, y)
        x += colWidths[i]
      })

      // Données
      doc.setTextColor(0)
      y += 10

      data.forEach((eleve, index) => {
        if (y > 270) {
          doc.addPage()
          y = 20
          // Répéter les en-têtes sur la nouvelle page
          doc.setFillColor(45, 62, 111)
          doc.rect(startX, y - 6, colWidths.reduce((a, b) => a + b, 0), 10, 'F')
          doc.setTextColor(255)
          x = startX
          headers.forEach((header, i) => {
            doc.text(header, x + 2, y)
            x += colWidths[i]
          })
          doc.setTextColor(0)
          y += 10
        }

        // Alternance de couleur
        if (index % 2 === 0) {
          doc.setFillColor(248, 249, 250)
          doc.rect(startX, y - 5, colWidths.reduce((a, b) => a + b, 0), 8, 'F')
        }

        x = startX
        const rowData = [
          eleve.matricule || '-',
          eleve.nom || '-',
          eleve.prenom || '-',
          eleve.classe || '-',
          eleve.statut || '-'
        ]

        doc.setFontSize(9)
        rowData.forEach((cell, i) => {
          const text = String(cell).substring(0, 20)
          doc.text(text, x + 2, y)
          x += colWidths[i]
        })
        y += 8
      })

      // Pied de page
      const pageCount = doc.internal.getNumberOfPages()
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i)
        doc.setFontSize(8)
        doc.setTextColor(150)
        doc.text(`Page ${i} / ${pageCount}`, pageWidth / 2, 290, { align: "center" })
        doc.text(`Total: ${data.length} élèves`, pageWidth - 15, 290, { align: "right" })
      }

      doc.save(`eleves_${new Date().toISOString().split('T')[0]}.pdf`)
      toast?.success(`Export PDF réussi - ${data.length} élèves exportés`)
    } catch (error) {
      console.error('Erreur export PDF:', error)
      toast?.error('Erreur lors de l\'export PDF')
    } finally {
      setExporting(false)
      setIsOpen(false)
    }
  }

  // Export Excel
  const handleExportExcel = () => {
    setExporting(true)
    try {
      // Préparer les données
      const excelData = data.map(eleve => ({
        'Matricule': eleve.matricule || '',
        'Nom': eleve.nom || '',
        'Prénom': eleve.prenom || '',
        'Date de naissance': eleve.dateNaissance || '',
        'Lieu de naissance': eleve.lieuNaissance || '',
        'Sexe': eleve.sexe || '',
        'Classe': eleve.classe || '',
        'Wilaya': eleve.wilaya || '',
        'Adresse': eleve.adresse || '',
        'Nom du père': eleve.nomPere || '',
        'Tél. père': eleve.telPere || '',
        'Nom de la mère': eleve.nomMere || '',
        'Tél. mère': eleve.telMere || '',
        'Statut': eleve.statut || ''
      }))

      // Créer le workbook
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, "Élèves")

      // Ajuster la largeur des colonnes
      const colWidths = [
        { wch: 12 }, // Matricule
        { wch: 20 }, // Nom
        { wch: 20 }, // Prénom
        { wch: 15 }, // Date naissance
        { wch: 15 }, // Lieu naissance
        { wch: 10 }, // Sexe
        { wch: 15 }, // Classe
        { wch: 18 }, // Wilaya
        { wch: 25 }, // Adresse
        { wch: 20 }, // Nom père
        { wch: 15 }, // Tél père
        { wch: 20 }, // Nom mère
        { wch: 15 }, // Tél mère
        { wch: 10 }, // Statut
      ]
      ws['!cols'] = colWidths

      // Télécharger le fichier
      XLSX.writeFile(wb, `eleves_${new Date().toISOString().split('T')[0]}.xlsx`)
      toast?.success(`Export Excel réussi - ${data.length} élèves exportés`)
    } catch (error) {
      console.error('Erreur export Excel:', error)
      toast?.error('Erreur lors de l\'export Excel')
    } finally {
      setExporting(false)
      setIsOpen(false)
    }
  }

  return (
    <div className="export-dropdown" ref={dropdownRef}>
      <button className="btn-export-trigger" onClick={() => setIsOpen(!isOpen)} disabled={exporting}>
        {exporting ? (
          <i className="bi bi-hourglass-split"></i>
        ) : (
          <i className="bi bi-download"></i>
        )}
        <span>{exporting ? 'Export...' : 'Export'}</span>
        <i className={`bi bi-chevron-down export-chevron ${isOpen ? 'open' : ''}`}></i>
      </button>
      {isOpen && (
        <div className="export-dropdown-menu">
          <button className="export-dropdown-item" onClick={handleExportPDF} disabled={exporting || data.length === 0}>
            <i className="bi bi-file-earmark-pdf text-danger"></i>
            <span>Export PDF</span>
          </button>
          <button className="export-dropdown-item" onClick={handleExportExcel} disabled={exporting || data.length === 0}>
            <i className="bi bi-file-earmark-excel text-success"></i>
            <span>Export Excel</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Action Dropdown Component
function ActionDropdown({ row, onViewDetail, onEdit, onDelete }) {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 })
  const buttonRef = React.useRef(null)
  const menuRef = React.useRef(null)

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target) &&
          menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  const handleToggle = (e) => {
    e.stopPropagation()
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const menuHeight = 180 // hauteur estimée du menu
      const menuWidth = 200

      // Calculer la position optimale
      let top = rect.bottom + 4
      let left = rect.right - menuWidth

      // Si le menu dépasse en bas, l'afficher au-dessus
      if (top + menuHeight > window.innerHeight) {
        top = rect.top - menuHeight - 4
      }

      // Si le menu dépasse à gauche, ajuster
      if (left < 10) {
        left = 10
      }

      setMenuPosition({ top, left })
    }
    setIsOpen(!isOpen)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    if (confirm(`Êtes-vous sûr de vouloir supprimer ${row.original.prenom} ${row.original.nom} ?`)) {
      await onDelete(row.original.id)
    }
    setIsOpen(false)
  }

  return (
    <div className="action-dropdown">
      <button ref={buttonRef} className="btn-action-menu" onClick={handleToggle}>
        <i className="bi bi-three-dots-vertical"></i>
      </button>
      {isOpen && (
        <div
          ref={menuRef}
          className="action-dropdown-menu"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          <button className="action-dropdown-item" onClick={(e) => { e.stopPropagation(); onViewDetail(row.original); setIsOpen(false) }}>
            <i className="bi bi-eye text-primary"></i>
            <span>Voir détails</span>
          </button>
          <button className="action-dropdown-item" onClick={(e) => { e.stopPropagation(); onEdit(row.original); setIsOpen(false) }}>
            <i className="bi bi-pencil text-warning"></i>
            <span>Modifier</span>
          </button>
          <div className="action-dropdown-divider"></div>
          <button className="action-dropdown-item text-danger" onClick={handleDelete}>
            <i className="bi bi-trash"></i>
            <span>Supprimer</span>
          </button>
        </div>
      )}
    </div>
  )
}

// Badge Filter Active Component
function BadgeFilterActive({ item, onRemove }) {
  return (
    <span className="active-filter-badge">
      <span className="badge-text">
        <span className="active-filter-text">{item.title}</span>:
        <span className="active-filter-value">{item.display}</span>
      </span>
      <button type="button" onClick={() => onRemove(item.name)} className="close">
        <span>&times;</span>
      </button>
    </span>
  )
}

// Table columns function - takes handlers as parameters
const getTableColumns = (onViewDetail, onEdit, onDelete) => [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "matricule", header: "Matricule" },
  { accessorKey: "nom", header: "Nom" },
  { accessorKey: "prenom", header: "Prénom" },
  { accessorKey: "classe", header: "Classe" },
  { accessorKey: "wilaya", header: "Wilaya" },
  {
    accessorKey: "statut",
    header: "Statut",
    cell: ({ getValue }) => {
      const value = getValue()
      return (
        <span className={`badge ${value === "Actif" ? "bg-success" : "bg-secondary"}`}>
          {value}
        </span>
      )
    }
  },
  { accessorKey: "dateNaissance", header: "Date naissance" },
  {
    accessorKey: "actions",
    header: "Actions",
    cell: ({ row }) => <ActionDropdown row={row} onViewDetail={onViewDetail} onEdit={onEdit} onDelete={onDelete} />,
  },
]

export default function GestionEleves() {
  const GROUP_ID = "eleves"
  const store = useFilterStore(GROUP_ID)
  const { filters, active, update, remove, clear } = store()
  const toast = useToast()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingEleve, setEditingEleve] = useState(null)
  const [selectedEleve, setSelectedEleve] = useState(null)
  const [eleves, setEleves] = useState([])
  const [loading, setLoading] = useState(true)

  // Load eleves from API
  useEffect(() => {
    loadEleves()
  }, [])

  const loadEleves = async () => {
    setLoading(true)
    try {
      const data = await eleveService.getAll()
      setEleves(data)
    } catch (error) {
      console.error('Erreur chargement élèves:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle view detail
  const handleViewDetail = (eleve) => {
    setSelectedEleve(eleve)
  }

  // Handle edit
  const handleEdit = (eleve) => {
    setEditingEleve(eleve)
    setShowEditModal(true)
  }

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await eleveService.delete(id)
      setEleves(prev => prev.filter(e => e.id !== id))
      toast.success('Élève supprimé avec succès')
    } catch (error) {
      console.error('Erreur suppression élève:', error)
      toast.error('Erreur lors de la suppression')
    }
  }

  // Handle update success
  const handleUpdateSuccess = (updatedEleve) => {
    setEleves(prev => prev.map(e => e.id === updatedEleve.id ? updatedEleve : e))
    setShowEditModal(false)
    setEditingEleve(null)
  }

  // Handle inscription success
  const handleInscriptionSuccess = (newEleve) => {
    setEleves(prev => [...prev, newEleve])
  }

  // Get columns with handlers
  const tableColumns = useMemo(() => getTableColumns(handleViewDetail, handleEdit, handleDelete), [])

  const filteredData = useMemo(() => {
    let result = [...eleves]
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(item =>
        item.nom.toLowerCase().includes(searchLower) ||
        item.prenom.toLowerCase().includes(searchLower) ||
        (item.matricule && item.matricule.toLowerCase().includes(searchLower))
      )
    }
    if (filters.classe) result = result.filter(item => item.classe === filters.classe)
    if (filters.wilaya) result = result.filter(item => item.wilaya === filters.wilaya)
    if (filters.statut) result = result.filter(item => item.statut === filters.statut)
    return result
  }, [filters, eleves])

  // If an eleve is selected, show detail page
  if (selectedEleve) {
    return <EleveDetail eleve={selectedEleve} onBack={() => setSelectedEleve(null)} />
  }

  return (
    <div className="gestion-eleves">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <div>
            <h1 className="page-title">
              <i className="bi bi-people me-2 text-primary"></i>
              Gestion des Élèves
            </h1>
            <p className="text-muted">Gérez tous les élèves du système</p>
          </div>
          <div className="header-actions">
            <FilterDrawer
              group_id={GROUP_ID}
              title="Filtres Élèves"
              subtitle="Affiner votre recherche d'élèves"
              width="420px"
            >
              <div className="filter-group">
                <label className="form-label">Recherche</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Rechercher par nom..."
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("search", val, { title: "Recherche", display: val })
                    else remove("search")
                  }}
                />
              </div>
              <div className="filter-group">
                <label className="form-label">Classe</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("classe", val, { title: "Classe", display: val })
                    else remove("classe")
                  }}
                >
                  <option value="">Toutes les classes</option>
                  {filterOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="form-label">Wilaya</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("wilaya", val, { title: "Wilaya", display: val })
                    else remove("wilaya")
                  }}
                >
                  <option value="">Toutes les wilayas</option>
                  {filterOptions.wilayas.map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label className="form-label">Statut</label>
                <select
                  className="form-select"
                  onChange={(e) => {
                    const val = e.target.value
                    if (val) update("statut", val, { title: "Statut", display: val })
                    else remove("statut")
                  }}
                >
                  <option value="">Tous les statuts</option>
                  {filterOptions.statuts.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </FilterDrawer>
            <button className="btn-add" onClick={() => setShowAddModal(true)}>
              <i className="bi bi-plus-lg"></i>
              <span>Ajouter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Active Filters */}
      {active.length > 0 && (
        <div className="active-filters-bar">
          <span className="filters-label">Filtres actifs :</span>
          {active.map((item, index) => (
            <BadgeFilterActive key={item.name || index} item={item} onRemove={remove} />
          ))}
          <button className="btn-clear-all" onClick={clear}>Tout effacer</button>
        </div>
      )}

      {/* Toolbar */}
      <div className="table-toolbar">
        <div className="toolbar-left">
          <i className="bi bi-eye text-muted"></i>
          <span className="text-muted">{filteredData.length}</span>
        </div>
        <div className="toolbar-right">
          <ExportDropdown data={filteredData} toast={toast} />
          <div className="search-box">
            <i className="bi bi-search"></i>
            <input
              type="text"
              placeholder="Rechercher..."
              onChange={(e) => {
                const val = e.target.value
                if (val) update("search", val, { title: "Recherche", display: val })
                else remove("search")
              }}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <TableSkeleton rows={10} columns={6} />
          ) : (
            <DataTable
              data={filteredData}
              columns={tableColumns}
              pageSize={10}
              onRowClick={(row) => handleViewDetail(row)}
            />
          )}
        </div>
      </div>

      {/* Modal Inscription Complète */}
      {showAddModal && (
        <InscriptionModal onClose={() => setShowAddModal(false)} onSuccess={handleInscriptionSuccess} toast={toast} />
      )}
      

      {/* Modal Modification Élève */}
      {showEditModal && editingEleve && (
        <EditEleveModal
          eleve={editingEleve}
          onClose={() => { setShowEditModal(false); setEditingEleve(null); }}
          onSuccess={handleUpdateSuccess}
          toast={toast}
        />
      )}

      <style>{`
        .gestion-eleves {
          padding: 24px;
          background: #f8f9fa;
          min-height: calc(100vh - 64px);
        }

        .page-header {
          margin-bottom: 24px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .page-title {
          font-size: 1.75rem;
          font-weight: 700;
          color: #2D3E6f;
          margin: 0;
        }

        .text-muted {
          color: #6b7280;
          margin: 0;
        }

        .text-primary {
          color: #2D3E6f !important;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-add {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          background: #2D3E6f;
          color: white;
          border: 1px solid #2D3E6f;
          border-radius: 5px;
          font-weight: 600;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .btn-add:hover {
          background: #243256;
          border-color: #243256;
        }

        .btn-add i {
          font-weight: 700;
          font-size: 16px;
        }

        .btn-add span {
          padding-inline-start: 5px;
          font-weight: 600;
        }

        /* Active Filters */
        .active-filters-bar {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 8px;
          margin-bottom: 16px;
        }

        .filters-label {
          font-size: 0.875rem;
          color: #6c757d;
          font-weight: 500;
        }

        .active-filter-badge {
          display: inline-flex;
          align-items: center;
          padding: 6px 12px;
          background: #fff;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .active-filter-text {
          font-weight: 600;
          color: #2D3E6f;
        }

        .active-filter-value {
          color: #2D3E6f;
          margin-left: 4px;
        }

        .active-filter-badge .close {
          background: none;
          border: none;
          color: #6c757d;
          margin-left: 8px;
          font-size: 1.1rem;
          cursor: pointer;
        }

        .active-filter-badge .close:hover {
          color: #dc3545;
        }

        .btn-clear-all {
          padding: 6px 14px;
          background: #fff;
          border: 1px solid #dc3545;
          border-radius: 6px;
          font-size: 0.875rem;
          color: #dc3545;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-clear-all:hover {
          background: #dc3545;
          color: #fff;
        }

        /* Toolbar */
        .table-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .toolbar-left, .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-box {
          position: relative;
        }

        .search-box i {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-box input {
          padding: 10px 12px 10px 36px;
          border: 1px solid #2D3E6f;
          border-radius: 8px;
          font-size: 0.875rem;
          width: 200px;
          background: white;
        }

        .search-box input:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        /* Export Dropdown */
        .export-dropdown {
          position: relative;
        }

        .btn-export-trigger {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 18px;
          border: 1px solid #2D3E6f;
          background: white;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          color: #2D3E6f;
          transition: all 0.2s;
        }

        .btn-export-trigger:hover {
          background: #2D3E6f;
          color: white;
        }

        .export-chevron {
          font-size: 0.75rem;
          transition: transform 0.2s;
        }

        .export-chevron.open {
          transform: rotate(180deg);
        }

        .export-dropdown-menu {
          position: absolute;
          top: calc(100% + 4px);
          right: 0;
          z-index: 1000;
          min-width: 180px;
          padding: 8px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .export-dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #2D3E6f;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .export-dropdown-item:hover {
          background: #f8f9fa;
          border-color: #2D3E6f;
        }

        .export-dropdown-item .text-danger { color: #dc3545; }
        .export-dropdown-item .text-success { color: #198754; }

        /* Action Dropdown */
        .action-dropdown {
          position: static;
        }

        .btn-action-menu {
          padding: 8px;
          background: transparent;
          border: none;
          border-radius: 50%;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action-menu:hover {
          background: #f3f4f6;
          color: #2D3E6f;
        }

        .action-dropdown-menu {
          position: fixed;
          z-index: 9999;
          min-width: 200px;
          padding: 8px 0;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          border: 1px solid #e5e7eb;
          animation: dropdownFadeIn 0.15s ease-out;
        }

        @keyframes dropdownFadeIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .action-dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 10px 16px;
          font-size: 0.875rem;
          color: #1f2937;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.15s;
        }

        .action-dropdown-item:hover {
          background: #f3f4f6;
        }

        .action-dropdown-item i {
          font-size: 1rem;
          width: 20px;
        }

        .action-dropdown-item.text-danger { color: #dc3545; }
        .action-dropdown-item.text-danger:hover { background: #fef2f2; }
        .text-primary { color: #2563eb !important; }
        .text-warning { color: #f59e0b !important; }

        .action-dropdown-divider {
          height: 1px;
          margin: 6px 0;
          background: #e5e7eb;
        }

        /* Card */
        .card {
          background: white;
          border: none;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(45, 62, 111, 0.08);
        }

        .card-body {
          padding: 24px;
        }

        /* Badge */
        .badge {
          padding: 4px 12px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .bg-success {
          background: #198754 !important;
          color: white;
        }

        .bg-secondary {
          background: #6c757d !important;
          color: white;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(45, 62, 111, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1050;
          padding: 20px;
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 25px 50px rgba(45, 62, 111, 0.35);
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          color: white;
          border-radius: 16px 16px 0 0;
        }

        .modal-header h5 {
          margin: 0;
          font-size: 1.25rem;
        }

        .modal-header .btn-close {
          filter: invert(1);
          background: transparent;
          border: none;
          font-size: 1.25rem;
          cursor: pointer;
        }

        .modal-body {
          padding: 24px;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
        }

        .form-control, .form-select {
          padding: 10px 12px;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          font-size: 0.875rem;
        }

        .form-control:focus, .form-select:focus {
          outline: none;
          border-color: #2D3E6f;
          box-shadow: 0 0 0 3px rgba(45, 62, 111, 0.1);
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
        }

        .btn-primary {
          padding: 10px 20px;
          background: #2D3E6f;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-primary:hover {
          background: #1e2a4d;
        }

        .filter-group {
          margin-bottom: 0;
        }

        /* Modal Inscription Styles */
        .modal-inscription {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px rgba(45, 62, 111, 0.35);
        }

        .modal-inscription .modal-header {
          padding: 20px 24px;
          background: linear-gradient(135deg, #2D3E6f 0%, #3d5291 100%);
          color: white;
        }

        .modal-inscription .modal-header h5 {
          margin: 0;
          font-size: 1.25rem;
          display: flex;
          align-items: center;
        }

        .btn-close-modal {
          background: transparent;
          border: none;
          color: white;
          font-size: 1.25rem;
          cursor: pointer;
          opacity: 0.8;
          padding: 0;
        }

        .btn-close-modal:hover {
          opacity: 1;
        }

        /* Stepper */
        .stepper {
          display: flex;
          justify-content: space-between;
          padding: 20px 24px;
          background: #f8f9fa;
          border-bottom: 1px solid #e5e7eb;
        }

        .step {
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          flex: 1;
        }

        .step-indicator {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 1rem;
          transition: all 0.3s;
          z-index: 1;
        }

        .step.active .step-indicator {
          background: #2D3E6f;
          color: white;
          box-shadow: 0 0 0 4px rgba(45, 62, 111, 0.2);
        }

        .step.completed .step-indicator {
          background: #10b981;
          color: white;
        }

        .step-title {
          font-size: 0.7rem;
          color: #9ca3af;
          margin-top: 8px;
          text-align: center;
          max-width: 80px;
        }

        .step.active .step-title {
          color: #2D3E6f;
          font-weight: 600;
        }

        .step.completed .step-title {
          color: #10b981;
        }

        .step-line {
          position: absolute;
          top: 20px;
          left: calc(50% + 25px);
          width: calc(100% - 50px);
          height: 2px;
          background: #e5e7eb;
        }

        .step.completed .step-line {
          background: #10b981;
        }

        .modal-inscription .modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 24px;
        }

        .step-content {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-title {
          font-size: 0.9rem;
          font-weight: 600;
          color: #2D3E6f;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .section-title i {
          font-size: 1rem;
        }

        .mt-3 {
          margin-top: 20px;
        }

        .mb-3 {
          margin-bottom: 16px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .form-grid .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label.required::after {
          content: " *";
          color: #dc2626;
        }

        textarea.form-control {
          resize: vertical;
          min-height: 60px;
        }

        .radio-group {
          display: flex;
          gap: 20px;
          padding-top: 8px;
        }

        .radio-label {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-size: 0.875rem;
          color: #374151;
        }

        .radio-label input[type="radio"] {
          width: 18px;
          height: 18px;
          accent-color: #2D3E6f;
        }

        .info-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: #dbeafe;
          border-radius: 8px;
          font-size: 0.85rem;
          color: #1e40af;
        }

        .info-box i {
          font-size: 1.1rem;
          margin-top: 2px;
        }

        /* Documents Checklist */
        .documents-checklist {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .doc-check {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .doc-check:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .doc-check input[type="checkbox"] {
          display: none;
        }

        .doc-check-box {
          width: 22px;
          height: 22px;
          border: 2px solid #d1d5db;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: all 0.2s;
        }

        .doc-check input:checked + .doc-check-box {
          background: #10b981;
          border-color: #10b981;
          color: white;
        }

        .doc-check-label {
          font-size: 0.9rem;
          color: #374151;
        }

        .doc-check-label .required {
          color: #dc2626;
          font-weight: 600;
        }

        /* Summary Box */
        .summary-box {
          padding: 16px;
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 10px;
        }

        .summary-box h6 {
          font-size: 0.9rem;
          font-weight: 600;
          color: #166534;
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .summary-item {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .summary-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
        }

        .summary-value {
          font-size: 0.9rem;
          font-weight: 500;
          color: #1f2937;
        }

        /* Modal Footer */
        .modal-inscription .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f9fafb;
        }

        .footer-left {
          display: flex;
          align-items: center;
        }

        .step-counter {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .footer-right {
          display: flex;
          gap: 12px;
        }

        .btn-secondary {
          padding: 10px 20px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-secondary:hover {
          background: #5a6268;
        }

        .btn-success {
          padding: 10px 20px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-success:hover {
          background: #059669;
        }

        @media (max-width: 768px) {
          .gestion-eleves {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .table-toolbar {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .toolbar-right {
            width: 100%;
            justify-content: space-between;
          }

          .search-box input {
            width: 100%;
          }

          /* Modal responsive */
          .modal-inscription {
            max-width: 100%;
            max-height: 100vh;
            border-radius: 0;
          }

          .stepper {
            padding: 12px;
            overflow-x: auto;
          }

          .step-title {
            display: none;
          }

          .step-indicator {
            width: 32px;
            height: 32px;
            font-size: 0.85rem;
          }

          .step-line {
            top: 16px;
            left: calc(50% + 20px);
            width: calc(100% - 40px);
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .modal-inscription .modal-footer {
            flex-direction: column;
            gap: 12px;
          }

          .footer-left, .footer-right {
            width: 100%;
          }

          .footer-right {
            justify-content: flex-end;
          }

          .paiement-modes {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Styles pour l'étape Paiement */
        .frais-selection {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .frais-check {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .frais-check:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .frais-check input[type="checkbox"] {
          display: none;
        }

        .frais-check-box {
          width: 24px;
          height: 24px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .frais-check input:checked + .frais-check-box {
          background: #2D3E6f;
          border-color: #2D3E6f;
          color: white;
        }

        .frais-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          flex: 1;
        }

        .frais-label {
          font-size: 0.95rem;
          font-weight: 500;
          color: #1f2937;
        }

        .frais-montant {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2D3E6f;
        }

        /* Récapitulatif paiement */
        .paiement-recap {
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          overflow: hidden;
          margin-bottom: 20px;
        }

        .recap-header {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 18px;
          background: #e0f2fe;
          font-weight: 600;
          color: #0369a1;
          font-size: 0.95rem;
        }

        .recap-header i {
          font-size: 1.1rem;
        }

        .recap-details {
          padding: 16px 18px;
        }

        .recap-line {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 0.9rem;
          color: #4b5563;
          border-bottom: 1px dashed #e5e7eb;
        }

        .recap-line:last-of-type {
          border-bottom: none;
        }

        .recap-total {
          display: flex;
          justify-content: space-between;
          padding-top: 12px;
          margin-top: 8px;
          border-top: 2px solid #0ea5e9;
          font-weight: 600;
          font-size: 1rem;
          color: #0369a1;
        }

        .total-amount {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0369a1;
        }

        /* Modes de paiement */
        .paiement-modes {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .mode-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          padding: 16px 12px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }

        .mode-option:hover {
          background: #f3f4f6;
          border-color: #2D3E6f;
        }

        .mode-option.selected {
          background: #eef2ff;
          border-color: #2D3E6f;
        }

        .mode-option input[type="radio"] {
          display: none;
        }

        .mode-option i {
          font-size: 1.5rem;
          color: #6b7280;
        }

        .mode-option.selected i {
          color: #2D3E6f;
        }

        .mode-option span {
          font-size: 0.8rem;
          font-weight: 500;
          color: #4b5563;
        }

        .mode-option.selected span {
          color: #2D3E6f;
          font-weight: 600;
        }

        /* Reste à payer */
        .reste-payer {
          background: #fef3c7 !important;
          color: #92400e !important;
          font-weight: 600;
        }

        .reste-payer:disabled {
          background: #fef3c7 !important;
          color: #92400e !important;
          opacity: 1;
        }

        /* Frais list styles */
        .frais-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }

        .frais-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          background: #f9fafb;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .frais-item:hover {
          background: #f3f4f6;
          border-color: #d1d5db;
        }

        .frais-item input[type="checkbox"] {
          display: none;
        }

        .frais-item .frais-check-box {
          width: 22px;
          height: 22px;
          border: 2px solid #d1d5db;
          border-radius: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: transparent;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .frais-item input:checked + .frais-check-box {
          background: #2D3E6f;
          border-color: #2D3E6f;
          color: white;
        }

        .frais-item .frais-label {
          flex: 1;
          font-size: 0.9rem;
          font-weight: 500;
          color: #374151;
        }

        .frais-item .frais-montant {
          font-size: 0.95rem;
          font-weight: 700;
          color: #2D3E6f;
        }

        .frais-total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 14px 16px;
          background: #eef2ff;
          border: 2px solid #2D3E6f;
          border-radius: 10px;
          margin-top: 6px;
        }

        .frais-total span:first-child {
          font-weight: 600;
          color: #1f2937;
        }

        .frais-total .total-montant {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2D3E6f;
        }

        /* Reste à payer box */
        .reste-payer-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          color: #92400e;
          font-size: 0.9rem;
        }

        .reste-payer-box i {
          font-size: 1.1rem;
        }

        .reste-payer-box strong {
          font-weight: 700;
        }

        /* Paiement complet box */
        .paiement-complet-box {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: #d1fae5;
          border: 1px solid #6ee7b7;
          border-radius: 8px;
          color: #065f46;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .paiement-complet-box i {
          font-size: 1.1rem;
        }

        /* ============ RESPONSIVE STYLES ============ */

        /* Tablet - 1024px and below */
        @media (max-width: 1024px) {
          .gestion-eleves {
            padding: 16px;
          }

          .header-content {
            flex-direction: column;
            align-items: flex-start;
          }

          .header-actions {
            width: 100%;
            flex-wrap: wrap;
          }

          .modal-inscription {
            width: 95%;
            max-width: 700px;
          }

          .paiement-modes {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        /* Mobile Large - 768px and below */
        @media (max-width: 768px) {
          .gestion-eleves {
            padding: 12px;
          }

          .page-title {
            font-size: 1.25rem;
          }

          .header-actions {
            gap: 8px;
          }

          .btn-add-student {
            padding: 10px 16px;
            font-size: 0.875rem;
          }

          .btn-add-student span {
            display: none;
          }

          .table-toolbar {
            flex-direction: column;
            gap: 12px;
            align-items: stretch;
          }

          .toolbar-right {
            flex-wrap: wrap;
            justify-content: space-between;
          }

          .search-box {
            flex: 1;
            min-width: 150px;
          }

          .search-box input {
            width: 100%;
          }

          /* Modal Inscription Responsive */
          .modal-overlay {
            padding: 10px;
            align-items: flex-start;
            padding-top: 20px;
          }

          .modal-inscription {
            width: 100%;
            max-width: 100%;
            max-height: calc(100vh - 40px);
            border-radius: 12px;
          }

          .modal-header {
            padding: 16px;
            border-radius: 12px 12px 0 0;
          }

          .modal-header h5 {
            font-size: 1rem;
          }

          .modal-body {
            padding: 16px;
            max-height: calc(100vh - 200px);
            overflow-y: auto;
          }

          /* Stepper Responsive */
          .stepper {
            padding: 12px 8px;
            gap: 4px;
            overflow-x: auto;
          }

          .step-item {
            min-width: 50px;
            flex: 0 0 auto;
          }

          .step-title {
            display: none;
          }

          .step-number {
            width: 32px;
            height: 32px;
            font-size: 0.8rem;
          }

          /* Form Grid Responsive */
          .form-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .form-group.full-width {
            grid-column: 1;
          }

          .form-label {
            font-size: 0.8rem;
          }

          .form-control, .form-select {
            padding: 10px 12px;
            font-size: 0.9rem;
          }

          /* Section Title */
          .section-title {
            font-size: 0.9rem;
            margin-bottom: 12px;
          }

          /* Documents Checklist */
          .documents-checklist {
            gap: 8px;
          }

          .doc-check {
            padding: 10px 12px;
          }

          .doc-check-label {
            font-size: 0.85rem;
          }

          /* Radio Group */
          .radio-group {
            flex-direction: column;
            gap: 8px;
          }

          .radio-label {
            padding: 10px 14px;
          }

          /* Recap */
          .paiement-recap {
            margin-top: 12px;
          }

          .recap-header {
            padding: 12px 14px;
            font-size: 0.85rem;
          }

          .recap-details {
            padding: 12px 14px;
          }

          .recap-line {
            font-size: 0.85rem;
            flex-wrap: wrap;
            gap: 4px;
          }

          /* Modal Footer */
          .modal-footer {
            padding: 12px 16px;
            flex-direction: column;
            gap: 10px;
          }

          .footer-left {
            width: 100%;
            text-align: center;
          }

          .footer-right {
            width: 100%;
            display: flex;
            gap: 8px;
          }

          .footer-right button {
            flex: 1;
            justify-content: center;
          }

          .step-counter {
            font-size: 0.8rem;
          }

          /* Table Responsive */
          .card-body {
            padding: 12px;
          }

          /* Active Filters */
          .active-filters-bar {
            flex-wrap: wrap;
            gap: 8px;
            padding: 10px;
          }

          .active-filter-badge {
            font-size: 0.75rem;
          }

          /* Export Dropdown */
          .btn-export-trigger span {
            display: none;
          }

          .export-dropdown-menu {
            min-width: 150px;
            right: 0;
          }

          /* Action Dropdown */
          .action-dropdown-menu {
            min-width: 160px;
            right: 0;
          }

          .action-dropdown-item {
            padding: 10px 14px;
            font-size: 14px;
            gap: 12px;
          }

          .action-dropdown-item i {
            font-size: 18px;
          }
        }

        /* Mobile Small - 480px and below */
        @media (max-width: 480px) {
          .gestion-eleves {
            padding: 8px;
          }

          .page-title {
            font-size: 1.1rem;
          }

          .page-title i {
            display: none;
          }

          .header-actions {
            flex-direction: column;
          }

          .btn-add-student {
            width: 100%;
            justify-content: center;
          }

          .btn-add-student span {
            display: inline;
          }

          .toolbar-right {
            flex-direction: column;
          }

          .search-box {
            width: 100%;
          }

          .modal-header h5 {
            font-size: 0.9rem;
          }

          .btn-close-modal {
            padding: 6px;
          }

          .btn-close-modal i {
            font-size: 1rem;
          }

          /* Stepper mini */
          .stepper {
            padding: 8px;
          }

          .step-number {
            width: 28px;
            height: 28px;
            font-size: 0.75rem;
          }

          .step-connector {
            width: 15px;
          }

          /* Form */
          .form-control, .form-select {
            padding: 8px 10px;
            font-size: 0.85rem;
          }

          .section-title {
            font-size: 0.85rem;
          }

          /* Info box */
          .info-box {
            padding: 10px 12px;
            font-size: 0.8rem;
          }

          .info-box i {
            font-size: 1rem;
          }

          /* Paiement modes - stack on mobile */
          .paiement-modes {
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }

          .mode-option {
            padding: 12px 8px;
          }

          .mode-option i {
            font-size: 1.25rem;
          }

          .mode-option span {
            font-size: 0.7rem;
          }

          /* Buttons */
          .btn-primary, .btn-secondary, .btn-success {
            padding: 10px 14px;
            font-size: 0.85rem;
          }

          /* Summary box */
          .summary-box {
            padding: 12px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
            gap: 8px;
          }

          .summary-item {
            padding: 8px 10px;
          }

          /* Badge */
          .badge {
            padding: 3px 8px;
            font-size: 0.7rem;
          }
        }

        /* Extra small screens - 360px and below */
        @media (max-width: 360px) {
          .modal-inscription {
            margin: 5px;
          }

          .stepper {
            justify-content: center;
          }

          .step-connector {
            width: 10px;
          }

          .paiement-modes {
            grid-template-columns: 1fr;
          }

          .footer-right {
            flex-direction: column;
          }

          .footer-right button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
