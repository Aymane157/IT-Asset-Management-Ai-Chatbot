// controllers/materielController.js

import Materiel from "../model/Materiel.js";

export const createMateriel = async (req, res) => {
  try {
    const {
      sn, code, dateMiseEnService, designation, description,
      prixHT, fournisseur, facture, operationnel,
      enReparation, reforme, personneAffectation,
      observations, Public
    } = req.body;

    const disponibilite = !personneAffectation; // true if not affected
    if (!sn || !code || !dateMiseEnService || !designation) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const existingMateriel = await Materiel.findOne({ sn });
    if (existingMateriel) {
      return res.status(400).json({ error: "Materiel with this SN already exists" });
    }
    const existingCode = await Materiel.findOne({ code });
    if (existingCode) { 
      return res.status(400).json({ error: "Materiel with this code already exists" });
    }
    const materiel = new Materiel({
      sn,
      code,
      dateMiseEnService: new Date(dateMiseEnService),
      designation,
      description,
      prixHT,
      fournisseur,
      facture,
      operationnel,
      enReparation,
      reforme,
      personneAffectation,
      observations,
      Public,
      disponibilite
    });

    await materiel.save();

    res.status(201).json({ message: "Materiel created successfully", materiel });
  } catch (error) {
    console.error("Error creating materiel:", error);
    res.status(500).json({ error: "Failed to create materiel" });
  }
};

export const getMateriels = async (req, res) => {
  try {
    const materiels = await Materiel.find();
    res.status(200).json(materiels);
  } catch (error) {
    console.error("Error fetching materiels:", error);
    res.status(500).json({ error: "Failed to fetch materiels" });
  }
} 
export const getMatNoAffectation = async (req, res) => {
  try {
    const materiels = await Materiel.find({ personneAffectation: null });
    res.status(200).json(materiels);
  } catch (error) {
    console.error("Error fetching non-affected materiels:", error);
    res.status(500).json({ error: "Failed to fetch non-affected materiels" });
  }
}

export const updateMateriel = async (req, res) => {
  const {sn}=req.params;
  console.log(sn);
  if (!sn) {
    return res.status(400).json({ error: "SN is required" });
  }
  const {
     code, dateMiseEnService, designation, description,
    prixHT, fournisseur, facture, operationnel,
    enReparation, reforme, personneAffectation,
    observations, Public
  } = req.body;

  try {
    const materiel = await Materiel.findOne({ sn });
    if (!materiel) {
      return res.status(404).json({ error: "Materiel not found" });
    }

    materiel.sn = sn || materiel.sn;
    materiel.code = code || materiel.code;
    materiel.dateMiseEnService = dateMiseEnService ? new Date(dateMiseEnService) : materiel.dateMiseEnService;
    materiel.designation = designation || materiel.designation;
    materiel.description = description || materiel.description;
    materiel.prixHT = prixHT || materiel.prixHT;
    materiel.fournisseur = fournisseur || materiel.fournisseur;
    materiel.facture = facture || materiel.facture;
    materiel.operationnel = operationnel !== undefined ? operationnel : materiel.operationnel;
    materiel.enReparation = enReparation || materiel.enReparation;
    materiel.reforme = reforme || materiel.reforme;
    materiel.personneAffectation = personneAffectation || materiel.personneAffectation;
    materiel.observations = observations || materiel.observations;
    materiel.Public = Public !== undefined ? Public : materiel.Public;

    await materiel.save();

    res.status(200).json({ message: "Materiel updated successfully", materiel });
  } catch (error) {
    console.error("Error updating materiel:", error);
    res.status(500).json({ error: "Failed to update materiel" });
  }
}
export const deleteMateriel = async (req, res) => {
  const { sn } = req.params;
  try{
   const materiel=await Materiel.findOneAndDelete({ sn });
    if (!materiel) {
      return res.status(404).json({ error: "Materiel not found" });
    }
    res.status(200).json({ message: "Materiel deleted successfully" });
    


  }catch(err){
    console.error("Error deleting materiel:", err);
    res.status(500).json({ error: "Failed to delete materiel" });
  }
}
export const importMateriels = async (req, res) => {
  try {
    const { materiels } = req.body;

    for (let mat of materiels) {
      await Materiel.updateOne(
        { sn: mat.sn }, // Use SN to check if already exists
        { $set: mat }, // Update with new data
        { upsert: true } // Insert if not found
      );
    }

    res.status(200).json({ message: "Importation terminée avec succès" });
  } catch (err) {
    console.error("Erreur d'importation:", err);
    res.status(500).json({ message: "Erreur serveur lors de l'importation" });
  }
};
