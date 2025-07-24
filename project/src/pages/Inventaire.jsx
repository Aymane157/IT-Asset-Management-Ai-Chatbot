import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import toast from "react-hot-toast";
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

const InventoryTable = () => {
  const [data, setData] = useState([]);
  const [editRow, setEditRow] = useState(null);
  const [editedRow, setEditedRow] = useState({});

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getMateriels`, {
        withCredentials: true,
      });
      setData(response.data);
    } catch (error) {
      toast.error("Échec du chargement des données");
      console.error("Erreur:", error);
    }
  };

  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "inventory.xlsx");
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const binaryStr = event.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        let jsonData = XLSX.utils.sheet_to_json(worksheet);

        jsonData = jsonData.map((item) => {
          delete item._id;
          delete item.__v;
          delete item.createdAt;
          delete item.updatedAt;
          delete item.addedBy;
          delete item.user;
          delete item.owner;

          const parsedDate = new Date(item.dateMiseEnService);
          item.dateMiseEnService = !isNaN(parsedDate) ? parsedDate.toISOString() : null;

          const boolFields = ["operationnel", "enReparation", "reforme", "Public", "disponibilite"];
          for (let field of boolFields) {
            if (item[field] !== undefined) {
              item[field] =
                item[field] === true ||
                item[field]?.toString().toLowerCase() === "vrai" ||
                item[field]?.toString().toLowerCase() === "true";
            }
          }

          item.prixHT = item.prixHT || null;
          item.facture = item.facture || "-";
          item.personneAffectation = item.personneAffectation || null;
          item.observations = item.observations || "";

          return item;
        });

        await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/importMateriels`,
          { materiels: jsonData },
          { withCredentials: true }
        );
        toast.success("Importation réussie ✅");
        fetchInventoryData();
      } catch (err) {
        toast.error("❌ Erreur lors de l'import");
        console.error("Erreur import:", err);
      }
    };

    reader.readAsBinaryString(file);
  };
  
  const handleDelete = async (sn) => {
    confirmAlert({
      title: 'Confirmation',
      message: 'Supprimer ce matériel ?',
      buttons: [
        {
          label: 'Oui',
          onClick: () => confirmeddelete(sn)
        },
        {
          label: 'Non',
          onClick: () => {}
        }
      ]
    });
   }
  const confirmeddelete = async (sn) => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/deleteMateriel/${sn}`,
      { withCredentials: true }
    );

    if (response.status === 200) {
      toast.success("🗑️ Matériel supprimé");
      fetchInventoryData();
    }
  } catch (error) {
    toast.error("❌ Erreur lors de la suppression");
    console.error("Delete error:", error);
  }
};

  const handleSave = async (sn) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/updateMateriel/${sn}`,
        editedRow,
        { withCredentials: true }
      );
      toast.success("✅ Modifications enregistrées");
      setEditRow(null);
      setEditedRow({});
      fetchInventoryData();
    } catch (err) {
      toast.error("❌ Erreur de mise à jour");
      console.error("Update Error:", err);
    }
  };

  return (
    <div className="p-4 overflow-x-auto">
      <h2 className="text-xl font-semibold mb-4">📋 Inventaire Informatique</h2>

      <div className="flex gap-4 mb-4">
        <button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Exporter Excel
        </button>

        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          Importer Excel
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      <table className="min-w-full border text-sm text-left text-gray-600">
        <thead className="bg-gray-200 text-gray-700 uppercase">
          <tr>
            <th className="px-3 py-2 border">SN</th>
            <th className="px-3 py-2 border">N° Inventaire</th>
            <th className="px-3 py-2 border">Date Mise en Service</th>
            <th className="px-3 py-2 border">Désignation</th>
            <th className="px-3 py-2 border">Description</th>
            <th className="px-3 py-2 border">Prix HT</th>
            <th className="px-3 py-2 border">Fournisseur</th>
            <th className="px-3 py-2 border">Facture</th>
            <th className="px-3 py-2 border">Opérationnel</th>
            <th className="px-3 py-2 border">Réparation</th>
            <th className="px-3 py-2 border">Réforme</th>
            <th className="px-3 py-2 border">Affecté à</th>
            <th className="px-3 py-2 border">Observations</th>
            <th className="px-3 py-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.sn} className="hover:bg-gray-50">
              <td className="px-3 py-2 border">{item.sn}</td>

              {[
                "code",
                "dateMiseEnService",
                "designation",
                "description",
                "prixHT",
                "fournisseur",
                "facture",
                "operationnel",
                "enReparation",
                "reforme",
                "personneAffectation",
                "observations",
              ].map((field) => (
                <td key={field} className="px-3 py-2 border text-center">
                  {editRow === item.sn ? (
                    field === "operationnel" ||
                    field === "enReparation" ||
                    field === "reforme" ? (
                      <input
                        type="checkbox"
                        checked={editedRow[field] ?? item[field]}
                        onChange={(e) =>
                          setEditedRow({ ...editedRow, [field]: e.target.checked })
                        }
                      />
                    ) : field === "dateMiseEnService" ? (
                      <input
                        type="date"
                        value={
                          editedRow.dateMiseEnService?.substring(0, 10) ||
                          item.dateMiseEnService?.substring(0, 10)
                        }
                        onChange={(e) =>
                          setEditedRow({
                            ...editedRow,
                            dateMiseEnService: e.target.value,
                          })
                        }
                        className="border px-1"
                      />
                    ) : (
                      <input
                        value={editedRow[field] ?? item[field] ?? ""}
                        onChange={(e) =>
                          setEditedRow({ ...editedRow, [field]: e.target.value })
                        }
                        className="border px-1"
                      />
                    )
                  ) : field === "operationnel" ? (
                    item[field] ? "✅" : "❌"
                  ) : field === "enReparation" ? (
                    item[field] ? "🔧" : "-"
                  ) : field === "reforme" ? (
                    item[field] ? "♻️" : "-"
                  ) : field === "dateMiseEnService" ? (
                    item[field]
                      ? new Date(item[field]).toLocaleDateString("fr-FR")
                      : "N/A"
                  ) : (
                    item[field] || "-"
                  )}
                </td>
              ))}

            <td className="px-3 py-2 border text-center">
  {editRow === item.sn ? (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => handleSave(item.sn)}
        className="bg-green-500 text-white px-2 py-1 rounded"
      >
        💾
      </button>
      <button
        onClick={() => {
          setEditRow(null);
          setEditedRow({});
        }}
        className="bg-gray-500 text-white px-2 py-1 rounded"
      >
        ❌
      </button>
    </div>
  ) : (
    <div className="flex gap-2 justify-center">
      <button
        onClick={() => {
          setEditRow(item.sn);
          setEditedRow(item);
        }}
        className="bg-yellow-500 text-white px-2 py-1 rounded"
      >
        ✏️
      </button>
      <button
        onClick={() => handleDelete(item.sn)}
        className="bg-red-600 text-white px-2 py-1 rounded"
      >
        🗑️
      </button>
    </div>
  )}
</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable;
