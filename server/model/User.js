import mongoose from "mongoose";
import demandeSchema from "./Demande.js"; // Import the Demande schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['Admin', 'Utilisateur', 'Gestionnaire'],
    required: true,
  },
  departement: { type: String, required: true },
  fonction: { type: String, required: true },
   materiel:{type:[ {
       type: mongoose.Schema.Types.ObjectId,
       ref: "Materiel", // 🔁 Correspond au nom du modèle exporté
       required: true,
     },],
    default: [],
    },
  demandes: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Demande", // 🔁 Correspond au nom du modèle exporté
    },], // ← Embedded subdocuments
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("User", userSchema);