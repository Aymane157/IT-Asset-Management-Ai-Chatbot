import React, { useState, useEffect } from "react";
import axios from "axios";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import toast from "react-hot-toast";

const Utilisateurs = () => {
  const [search, setSearch] = useState("");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [newUser, setNewUser] = useState({
    name: "",
    role: "Utilisateur",
    departement: "",
    password: "",
    fonction: "",
    email:"",
  });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getAllUsers`, {
          withCredentials: true,
        });
        if (response.status === 200) {
          setUsersData(response.data);
        }
      } catch (error) {
        console.error("Error fetching users:", error.response ? error.response.data : error.message);
      }
    };
    fetchUsers();
  }, []);

  const formatLocalDate = (isoDate) => {
    return new Date(isoDate).toLocaleString("fr-MA", {
      timeZone: "Africa/Casablanca",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const handledeluser = async (id) => {
    confirmAlert({
      title: "Confirmation",
      message: "Supprimer cet utilisateur ?",
      buttons: [
        {
          label: "Oui",
          onClick: () => delUser(id),
        },
        {
          label: "Non",
        },
      ],
    });
  };

  const delUser = async (id) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/deleteUser/${id}`, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUsersData(usersData.filter((user) => user._id !== id));
      }
    } catch (error) {
      console.error("Error deleting user:", error.response ? error.response.data : error.message);
    }
  };

  const addUser = async () => {
    try {
      console.log("Adding user:", newUser);
      const response = await axios.post(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/register`, newUser, {
        withCredentials: true,
      });
      console.log("Response from adding user:", response.status);
      
     toast.success("Utilisateur ajouté avec succès");
      if (response.status === 201 || response.status === 200) {
        setUsersData((prev) => [...prev, newUser]);
        setIsModalVisible(false);
        setNewUser({
          name: "",
          role: "Utilisateur",
          departement: "",
          password: "",
          fonction: "",
          email:"",
        });
      }
    } catch (error) {
      if(error.response && error.response.status === 400) {
        toast.error("Erreur: " + error.response.data.message);}
      console.error("Error adding user:", error.response ? error.response.data : error.message);
    }
  };

  const filteredUsers = usersData.filter(
    (user) =>
      user.name?.toLowerCase().includes(search.toLowerCase()) ||
      user.role?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white p-8 rounded-md w-full relative">
      <div className="flex items-center justify-between pb-6">
        <h2 className="text-xl font-semibold mb-4 flex gap-2">👤 <span>Utilisateurs</span></h2>
        <div className="flex bg-gray-50 items-center p-2 rounded-md">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
          </svg>
          <input
            className="bg-gray-50 outline-none ml-1 block"
            type="text"
            placeholder="Search by name or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="lg:ml-40 ml-10 space-x-8">
          <button
            className="bg-indigo-600 px-4 py-2 rounded-md text-white font-semibold tracking-wide cursor-pointer"
            onClick={() => setIsModalVisible(true)}
          >
            Create A New User
          </button>
        </div>
      </div>

      <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
        <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date Création</th>
                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Fonction</th>
                <th className="px-5 py-3 border-b-2 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-5 py-5 border-b bg-white text-sm text-center">Aucun utilisateur trouvé.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-5 py-5 border-b bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{user.name}</p>
                    </td>
                    <td className="px-5 py-5 border-b bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{user.role}</p>
                    </td>
                    <td className="px-5 py-5 border-b bg-white text-sm">
                      <p className="text-gray-900 whitespace-no-wrap">{formatLocalDate(user.createdAt)}</p>
                    </td>
                    <td className="px-5 py-5 border-b bg-white text-sm">
                      <span className="inline-block px-3 py-1 rounded-full font-semibold text-xs bg-blue-200 text-blue-900">{user.fonction}</span>
                    </td>
                    <td className="px-5 py-5 border-b bg-white text-sm">
                      <span className="inline-block px-3 py-1 rounded-full font-semibold text-xs bg-red-200 text-red-900">
                        <button className="shadow-sm hover:scale-105 transition-transform cursor-pointer" onClick={() => handledeluser(user._id)}>Supprimer</button>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-30">
          <div className="bg-white rounded-md p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Créer un utilisateur</h3>
            <form className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Entrer le nom"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="Gestionnaire">Gestionnaire</option>
                  <option value="Admin">Admin</option>
                  <option value="Utilisateur">Utilisateur</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Département</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Entrer le département"
                  value={newUser.departement}
                  onChange={(e) => setNewUser({ ...newUser, departement: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Entrer l'email'"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input
                  type="password"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Entrer le mot de passe"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fonction</label>
                <input
                  type="text"
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                  placeholder="Entrer la fonction"
                  value={newUser.fonction}
                  onChange={(e) => setNewUser({ ...newUser, fonction: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md"
                  onClick={() => setIsModalVisible(false)}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                  onClick={addUser}
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Utilisateurs;
