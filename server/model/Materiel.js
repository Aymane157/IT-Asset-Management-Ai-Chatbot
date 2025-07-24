import mongoose from 'mongoose';

const materielSchema = new mongoose.Schema({
  sn: { type: String, required: true }, // Serial Number
  code: { type: String, required: true },
  dateMiseEnService: { type: Date, required: true },
  designation: { type: String, required: true },
  description: { type: String },
  prixHT: { type: Number },
  fournisseur: { type: String },
  facture: { type: String,default:"-" }, // file name or link if stored
  operationnel: { type: Boolean, default: true },
  enReparation: { type: String, default: "" },
  reforme: { type: String, default: "" },
  personneAffectation: { type: String, default: null },
  observations: { type: String },
  Public: { type: Boolean, default: true },
  disponibilite: { type: Boolean, default: true }, // true if not affected
}, {
  timestamps: true
});

export default mongoose.model('Materiel', materielSchema);
