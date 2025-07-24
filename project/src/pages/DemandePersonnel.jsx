import React, { useState, useEffect } from 'react';
import { BiArchive } from "react-icons/bi";
import MyApp from '../components/DownloadPDF';
import axios from 'axios';

const DemandePersonnel = () => {
  const [demandes, setDemandes] = useState([]);
  const [materiels, setMateriels] = useState([]);
  const [search, setSearch] = useState("");

const formatLocalDate = (isoDate) => {
  return new Date(isoDate).toLocaleString("fr-MA", {
    timeZone: "Africa/Casablanca",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [demandesRes, materielsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getDemandes`, {
            withCredentials: true,
          }),
          axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getMateriels`),
        ]);

        setDemandes(demandesRes.data);
        setMateriels(materielsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);
   
  const filteredDemande = demandes.filter((demande) =>
    demande.description?.toLowerCase().includes(search.toLowerCase()) ||
    demande.designation?.toLowerCase().includes(search.toLowerCase()) ||
    demande.status?.toLowerCase().includes(search.toLowerCase())
  );

  const findMaterielInfo = (designation, description) => {
    return materiels.find(
      (mat) => mat.designation === designation && mat.description === description
    );
  };

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4 flex gap-2">
        <BiArchive className="my-1.5" /> Mes Demandes
      </h2>

      {/* Search Bar */}
      <div className="flex bg-gray-50 items-center p-2 rounded-md shadow-sm border border-gray-200 w-full max-w-md">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path
            fillRule="evenodd"
            d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
            clipRule="evenodd"
          />
        </svg>
        <input
          className="bg-gray-50 outline-none ml-2 w-full"
          type="text"
          placeholder="Rechercher par statut, désignation ou description"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-[repeat(auto-fit,_minmax(300px,_1fr))] gap-5 my-5">
        {filteredDemande.map((item, index) => {
          const matchedMateriel = findMaterielInfo(item.designation, item.description);

          return (
            <div
              key={index}
              className="relative flex w-96 flex-col rounded-xl bg-white bg-clip-border text-gray-700 shadow-md mb-6"
            >
              <div className="p-6">
                <h5 className="mb-2 text-xl font-semibold text-blue-gray-900">
                  {item.designation}
                </h5>
                <p className="text-base font-light leading-relaxed">
                  {item.description}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                  <span className="font-semibold">Type de Stock:</span> {item.typeStock}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  <span className="font-semibold">Statut:</span>{" "}
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.status === "Acceptée"
                        ? "bg-green-100 text-green-700"
                        : item.status === "Refusée"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </p>
              </div>

              <div className="p-6 pt-0">
               {item.status === "Acceptée" ? (
  <MyApp
    name={item.user?.name || "Utilisateur"}
    items={[
      {
        label: item.description,
        sn: matchedMateriel?.sn || "N/A",
        inventory: matchedMateriel?.code || "N/A",
      },
    ]}
    date={formatLocalDate(item.createdAt)}
  />
) : item.status === "Refusée" ? (
  <span className="text-red-600 text-sm font-medium">❌ Refusée</span>
) : (
  <span className="text-yellow-600 text-sm font-medium">⏳ En attente de validation</span>
)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DemandePersonnel;
