import React, { useEffect, useState } from "react";
import { MdLaptopChromebook } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
export default function EditableDesignationTable() {
  const [data, setData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [newItem, setNewItem] = useState({
    sn: "",
    code: "",
    designation: "",
    description: "",
    Public: false,
    prixHT: "",
    fournisseur: "",
    facture: "",
    dateMiseEnService: "",
    operationnel: false,
    enReparation: false,
    reforme: false,
    observations: ""
  });

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getMatNoAffectation`,
          { withCredentials: true }
        );
        setData(response.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    getData();
  }, []);

  const handleTogglePublic = async (sn) => {
  try {
    const item = data.find((mat) => mat.sn === sn);
    const updatedPublic = !item.Public;

    const response = await axios.put(
      `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/updateMateriel/${sn}`,
      { Public: updatedPublic },
      { withCredentials: true }
    );

    if (response.status === 200) {
      setData((prevData) =>
        prevData.map((mat) =>
          mat.sn === sn ? { ...mat, Public: updatedPublic } : mat
        )
      );
    } else {
      console.error("Failed to update public status");
    }
  } catch (error) {
    console.error("Error toggling public status:", error);
    toast.error("Échec de la mise à jour du champ Public");
  }
};


 const handleDeleteMaterial = async (sn) => {
  confirmAlert({
    title: 'Confirmation',
    message: 'Supprimer ce matériel ?',
    buttons: [
      {
        label: 'Oui',
        onClick: () => handleDeleteConfirmed(sn)
      },
      {
        label: 'Non',
        onClick: () => {}
      }
    ]
  });
 }
 const handleDeleteConfirmed = async (sn) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/deleteMateriel/${sn}`,
      { withCredentials: true }
    );

    if (response.status === 200) {
      
      setData((prevData) => prevData.filter((mat) => mat.sn !== sn));
      toast.success("Matériel supprimé avec succès");
    } else {
      console.error("Failed to delete matériel");
    }
  } catch (error) {
    console.error("Error deleting matériel:", error);
    alert("Échec de la suppression");
  }
};


  const handleAddNewMaterial = async () => {
    const {
      sn, code, dateMiseEnService, designation, description
    } = newItem;

    if (!sn || !code || !dateMiseEnService || !designation || !description) {
      toast.error("Veuillez remplir les champs obligatoires : SN, Code, Date de mise en service, Désignation, Description.");
      return;
    }

    const optimisticMaterial = {
      ...newItem,
      personneAffectation: null,
      disponibilite: true,
    };

    // Optimistic update
    setData((prev) => [...prev, optimisticMaterial]);

    // Clear form immediately
    setNewItem({
      sn: "",
      code: "",
      designation: "",
      description: "",
      Public: false,
      prixHT: "",
      fournisseur: "",
      facture: "",
      dateMiseEnService: "",
      operationnel: false,
      enReparation: false,
      reforme: false,
      observations: ""
    });

    try {
      const resp = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/createMateriel`,
        optimisticMaterial,
        { withCredentials: true }
      );

      if (resp.status === 201) {
        const saved = resp.data.materiel;

       
        setData((prev) => [...prev.slice(0, -1), saved]);
         toast.success("Matériel ajouté avec succès");
      } else {
        throw new Error("Unexpected response from server");
      }
    } catch (error) {
      alert("Erreur lors de l'ajout : " + (error.response?.data?.error || error.message));
      // Rollback
      setData((prev) => prev.slice(0, -1));
    }
  };

  const filteredData = data.filter(
    (item) =>
      item.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
        <MdLaptopChromebook /> Stock Matériel Non Affecte
      </h2>

      <input
        type="text"
        placeholder="🔍 Rechercher par désignation ou description..."
        className="w-full max-w-lg border border-gray-300 rounded px-3 py-2 shadow-sm focus:outline-none"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="overflow-x-auto border rounded-lg shadow">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 border">Désignation</th>
              <th className="px-4 py-3 border">Public</th>
              <th className="px-4 py-3 border">Description</th>
              <th className="px-4 py-3 border text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 border font-medium">{item.designation}</td>
                <td className="px-4 py-3 border">
                  <button
                    className={`px-3 py-1 rounded text-white text-xs ${
                      item.Public ? "bg-green-600" : "bg-red-500"
                    }`}
                    onClick={() => handleTogglePublic(item.sn)}
                  >
                    {item.Public ? "Oui" : "Non"}
                  </button>
                </td>
                <td className="px-4 py-2 border">
                  <input
                    type="text"
                    className="w-full p-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                    value={item.description}
                    readOnly
                  />
                </td>
                <td className="px-4 py-2 border text-center">
                  <button
                    onClick={() => handleDeleteMaterial(item.sn)}
                    className="text-red-600 hover:underline text-sm"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add New Matériel Form */}
      <div className="bg-white border p-4 rounded-lg shadow max-w-4xl">
        <h3 className="text-xl font-semibold mb-4">Ajouter un nouveau matériel</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-4">
          {[
            { label: "Numéro de Série (SN)", key: "sn" ,placeholder: "Ex: SN12345"},
            { label: "Code", key: "code",placeholder: "Ex: ADD/INFO/00017" },
            { label: "Désignation", key: "designation",placeholder: "Ex: Ordinateur Portable" },
            { label: "Description", key: "description" ,placeholder: "Ex: Dell XPS 13" },
            { label: "Fournisseur", key: "fournisseur",placeholder: "Ex: Dell" },
            { label: "Facture", key: "facture" ,placeholder: "Ex: FACT12345" },
            { label: "Prix HT (MAD)", key: "prixHT", type: "number",placeholder: "Ex: 10000" },
            { label: "Date de mise en service", key: "dateMiseEnService", type: "date" },
            { label: "Observations", key: "observations" },
          ].map(({ label, key, type = "text",placeholder }) => (
            <div key={key}>
              <label className="block mb-1 font-medium">{label}</label>
              <input 
              placeholder={placeholder}
                type={type}
                className="w-full border px-2 py-1 rounded"
                value={newItem[key] || ""}
                onChange={(e) => setNewItem({ ...newItem, [key]: e.target.value })}
              />
            </div>
          ))}

          <div>
            <label className="block mb-1 font-medium">Est Public</label>
            <select
              className="w-full border px-2 py-1 rounded"
              value={newItem.Public}
              onChange={(e) =>
                setNewItem({ ...newItem, Public: e.target.value === "true" })
              }
            >
              <option value="false">Non</option>
              <option value="true">Oui</option>
            </select>
          </div>

          <div className="md:col-span-3 flex items-center gap-6 mt-4">
            {[
              { label: "Opérationnel", key: "operationnel" },
              { label: "Réparation", key: "enReparation" },
              { label: "Réforme", key: "reforme" },
            ].map(({ label, key }) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newItem[key] || false}
                  onChange={(e) =>
                    setNewItem({ ...newItem, [key]: e.target.checked })
                  }
                />
                {label}
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleAddNewMaterial}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Ajouter
        </button>
      </div>
    </div>
  );
}
