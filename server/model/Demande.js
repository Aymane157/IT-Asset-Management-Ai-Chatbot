import materielSchema from "./Materiel.js"; 
import mongoose from "mongoose";
const demandeSchema = new mongoose.Schema({
  typeStock: String,
  description: String,
  designation: String,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  commentaire: {type:String,
    required: true,},
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // 🔁 Correspond au nom du modèle exporté
    required: true,
  },
  status: {
    type: String,
    enum: ['En attente', 'Acceptée', 'Refusée'],
    default: 'En attente',
  },
});

export default mongoose.model("Demande", demandeSchema);