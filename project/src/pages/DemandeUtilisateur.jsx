import React, { useState, useEffect } from 'react';
import toast from "react-hot-toast";
import axios from 'axios';

const Demande = () => {
  const [materiel, setMateriel] = useState([]);
  const [designationSelected, setDes] = useState("");
  const [typeStock, setTypeStock] = useState("Bureau");
  const [commentaire, setCommentaire] = useState("");

  useEffect(() => {
    const getMateriel = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getMateriels`, {
          withCredentials: true,
        });
        const data = response.data;
        console.log("Materiel data:", data);
        setMateriel(data);
      } catch (error) {
        console.error('Error fetching materiel:', error);
      }
    };
    getMateriel();
  }, []);

  const handleselect = (e) => {
    const selectedDescription = e.target.value;
    console.log("Selected description:", selectedDescription);
    const selectedItem = materiel.find(item => item.description === selectedDescription);
    if (selectedItem) {
      setDes(selectedItem.designation);
    } else {
      setDes("");
    }
  };

  const handleDemande = async () => {
    if (!designationSelected || !commentaire) {
      toast.error("Veuillez remplir tous les champs !");
      return;
    }

    try {
      const selectedMaterial = materiel.find((m) => m.designation === designationSelected);
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/createDemande`,
        {
          typeStock: typeStock,
          designation: designationSelected,
          description: selectedMaterial?.description || "",
          commentaire,
        },
        { withCredentials: true }
      );

      if (response.status === 201) {
        toast.success("Demande envoyée avec succès !");
        setCommentaire("");
        setDes("");
      }
    } catch (error) {
      console.error("Erreur en envoyant la demande:", error);
      toast.error("Erreur lors de l'envoi de la demande !");
    }
  };

  return (
    <div className="p-6 overflow-x-auto">
      <h2 className="text-2xl font-semibold mb-4">📩 Demandes</h2>
      <div className="max-w-md mx-auto mt-10 p-6 bg-white border border-gray-200 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Formulaire de Demande</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1">Type de stock</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={typeStock}
              onChange={(e) => setTypeStock(e.target.value)}
            >
              <option>Bureau</option>
              <option>Informatique</option>
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Description du matériel</label>
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              onChange={handleselect}
            >
              <option value="">-- Choisir une description --</option>
              {materiel.map((item, index) => (
                <option key={index} value={item.description}>
                  {item.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Désignation du matériel</label>
            <input
              type="text"
              value={designationSelected}
              readOnly
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Commentaire</label>
            <textarea
              id="Commentaire"
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Pourquoi avez-vous besoin de ce matériel ?"
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
            />
          </div>

          <button
            onClick={handleDemande}
            type="button"
            className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition cursor-pointer"
          >
            Soumettre
          </button>
        </div>
      </div>
    </div>
  );
};

export default Demande;
