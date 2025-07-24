import React, { useState, useEffect } from "react";
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import axios from "axios";
import toast from "react-hot-toast";

const HistoriqueDemande = () => {
  const [search, setSearch] = useState("");
  const [usersData, setUsersData] = useState([]);

  const filteredUsers = usersData.filter((user) =>
    user.userName?.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    fetchDemandes();
  }, []);

  const fetchDemandes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getAllDemandes`, {
        withCredentials: true,
      });
      setUsersData(response.data);
    } catch (error) {
      toast.error("Échec du chargement des demandes");
      console.error("Error fetching data:", error);
    }
  };

  // Handle status update (Acceptée or Refusée)
  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/updateDemande/${id}`, {
        status: newStatus,
      });
      toast.success(`Demande ${newStatus === "Acceptée" ? "accordée" : "refusée"} !`);
      // Remove updated demande from list
      setUsersData((prev) => prev.filter((demande) => demande._id !== id));
    } catch (error) {
      toast.error("Erreur lors de la mise à jour !");
      console.error("Update error:", error);
    }
  };

  return (
    <div className="bg-white p-8 rounded-md w-full">
      <h2 className="text-2xl font-semibold mb-4 flex gap-2">
        <MdOutlineMarkEmailUnread className="my-1" /> Liste Demandes
      </h2>

      {/* Search bar */}
      <div className="flex items-center justify-between pb-6">
        <div className="flex bg-gray-50 items-center p-2 rounded-md shadow-sm border border-gray-200 w-full max-w-md">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 
              1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            className="bg-gray-50 outline-none ml-2 w-full"
            type="text"
            placeholder="Rechercher par nom"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                {[
                  "Nom",
                  "Type de Stock",
                  "Désignation",
                  "Description",
                  "Public",
                  "Disponible",
                  "Commentaire",
                  "Actions",
                ].map((heading, idx) => (
                  <th
                    key={idx}
                    className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-5 py-5 border-b border-gray-200 bg-white text-sm text-center"
                  >
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {user.userName}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {user.typeStock}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {user.designation}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {user.description}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.public === "Oui"
                            ? "bg-green-200 text-green-800"
                            : "bg-red-200 text-red-800"
                        }`}
                      >
                        {user.public}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.Disponible === "Oui"
                            ? "bg-blue-200 text-blue-800"
                            : "bg-gray-200 text-gray-800"
                        }`}
                      >
                        {user.Disponible}
                      </span>
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm">
                      {user.commentaire}
                    </td>
                    <td className="px-5 py-4 border-b border-gray-200 bg-white text-sm flex gap-2">
                      <button
                        onClick={() => handleStatusUpdate(user._id, "Acceptée")}
                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs cursor-pointer"
                      >
                        Accorder
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(user._id, "Refusée")}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs cursor-pointer"
                      >
                        Refuser
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HistoriqueDemande;
