import Demande from "../model/Demande.js";
import Materiel from "../model/Materiel.js";

export const createDemande = async (req, res) => {
  try {
    const {
      typeStock, description,
      designation,commentaire
    } = req.body;
    const user = req.session.user; 
    console.log(user);
    if (!typeStock || !description || !designation || !user || !commentaire) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const demande = new Demande({
      typeStock,
      description,
     
      user:user.id,
      designation,
    
      commentaire
    });

    await demande.save();

    res.status(201).json({ message: "Demande created successfully", demande });
  } catch (error) {
    console.error("Error creating demande:", error);
    res.status(500).json({ error: "Failed to create demande" });
  }
}
export const getDemandes = async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: "Unauthorized: no session user found" });
  }

  const userId = req.session.user._id || req.session.user.id; // selon comment tu le stockes

  try {
    const demandes = await Demande.find({ user: userId }).populate("user");
    res.status(200).json(demandes);
  } catch (error) {
    console.error("Error fetching demandes:", error);
    res.status(500).json({ error: "Failed to fetch demandes" });
  }
};

export const getAllDemandes = async (req, res) => {
  try {
    const demandes = await Demande.find({status:"En attente"}).populate("user");

    const enhancedDemandes = await Promise.all(
      demandes.map(async (demande) => {
        const matchedMateriel = await Materiel.findOne({
          designation: demande.designation,
          description: demande.description,
        });

        return {
          ...demande.toObject(),
          userName: demande.user?.name || "Inconnu",
          public: matchedMateriel?.Public ? "Oui" : "Non",
          Disponible: matchedMateriel?.disponibilite ? "Oui" : "Non",
        };
      })
    );

    res.status(200).json(enhancedDemandes);
  } catch (error) {
    console.error("Error fetching demandes:", error);
    res.status(500).json({ error: "Failed to fetch demandes" });
  }
};
export const updateDemandeStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedDemande = await Demande.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json(updatedDemande);
  } catch (error) {
    console.error("Failed to update demande:", error);
    res.status(500).json({ error: "Update failed" });
  }
};
export const getAffect=async (req, res) => {
  try {
    const demandes = await Demande.find({ status: "Acceptée" }).populate("user");
    res.status(200).json(demandes);
  } catch (error) {
    console.error("Error fetching accepted demandes:", error);
    res.status(500).json({ error: "Failed to fetch accepted demandes" });
  }
}
export const delAffect = async (req, res) => {
  const { id } = req.params;

  try {
    const demande = await Demande.findByIdAndDelete(id);
    if (!demande) {
      return res.status(404).json({ error: "Demande not found" });
    }
    res.status(200).json({ message: "Demande deleted successfully" });
  } catch (error) {
    console.error("Error deleting demande:", error);
    res.status(500).json({ error: "Failed to delete demande" });
  }
}