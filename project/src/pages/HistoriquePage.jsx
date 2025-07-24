import React, { useState, useEffect } from "react";
import MyApp from "../components/DownloadPDF.jsx";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import toast from "react-hot-toast";

const HistoriquePage = () => {
  const [search, setSearch] = useState("");
  const [demandes, setDemandes] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getAffect`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setDemandes(response.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const formatDate = (date) =>
    new Date(date).toLocaleString("fr-MA", {
      timeZone: "Africa/Casablanca",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

  const filteredDemandes = demandes.filter((demande) => {
    const userName = demande.user?.name?.toLowerCase() || "";
    const typeStock = demande.typeStock?.toLowerCase() || "";
    return (
      userName.includes(search.toLowerCase()) ||
      typeStock.includes(search.toLowerCase())
    );
  });

  const handledeluser = async (id) => {
      confirmAlert({
        title: "Confirmation",
        message: "Supprimer cet utilisateur ?",
        buttons: [
          {
            label: "Oui",
            onClick: () => handleDelete(id),
          },
          {
            label: "Non",
          },
        ],
      });
    };
  const handleDelete = async (id) => {
    

    try {
      const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/delAffect/${id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        // Remove deleted item from state
        setDemandes((prev) => prev.filter((demande) => demande._id !== id));
        toast.success("Affectation supprimée et matériel rendu disponible.");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression:", error.response?.data || error.message);
      alert("Erreur lors de la suppression. Veuillez réessayer.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-md w-full">
      <h2 className="text-2xl font-semibold mb-4">📚 Liste Affectations</h2>

      <div className="flex bg-gray-50 items-center p-2 rounded-md shadow-sm border border-gray-200 w-full max-w-md mb-6">
        <svg
          className="h-5 w-5 text-gray-400"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <input
          type="text"
          placeholder="Rechercher par nom utilisateur ou type matériel"
          className="bg-gray-50 outline-none ml-2 w-full"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 bg-gray-100 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Utilisateur
              </th>
              <th className="px-5 py-3 bg-gray-100 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Rôle
              </th>
              <th className="px-5 py-3 bg-gray-100 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                PDF
              </th>
              <th className="px-5 py-3 bg-gray-100 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type Matériel
              </th>
              <th className="px-5 py-3 bg-gray-100 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Désignation
              </th>
              <th className="px-5 py-3 bg-gray-100 border-b-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Description
              </th>
              <th className="px-5 py-3 bg-gray-100 border-b-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredDemandes.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center p-4">
                  Aucun résultat trouvé.
                </td>
              </tr>
            ) : (
              filteredDemandes.map((demande) => (
                <tr key={demande._id}>
                  <td className="px-5 py-3">{demande.user?.name || "N/A"}</td>
                  <td className="px-5 py-3">{demande.user?.role || "N/A"}</td>
                  <td className="px-5 py-3">
                    <MyApp
                      name={demande.user?.name || "N/A"}
                      date={formatDate(demande.createdAt)}
                      items={[
                        {
                          label: demande.description,
                          sn: demande.sn || "N/A",
                          inventory: demande.code || "N/A",
                        },
                      ]}
                    />
                  </td>
                  <td className="px-5 py-3">{demande.typeStock}</td>
                  <td className="px-5 py-3">{demande.designation}</td>
                  <td className="px-5 py-3">{demande.description}</td>
                  <td className="px-5 py-3 text-center">
                    <button
                      onClick={() => handledeluser(demande._id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoriquePage;
