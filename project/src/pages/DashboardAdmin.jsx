import React, { useState } from 'react';
import { FaSheetPlastic } from "react-icons/fa6";
import { IoIosLogOut } from "react-icons/io";
import InventoryTable from "./Inventaire.jsx"
import EditableDesignationTable from './StockInformatique.jsx';
import { MdLaptopChromebook } from "react-icons/md";
import { FaRobot } from "react-icons/fa";
import Chatbot from "./Chatbot.jsx"
import DemandesPage from "./DemandeUtilisateur.jsx"
import HistoriquePage from "./HistoriquePage.jsx"
import Utilisateurs from "./Utilisateurs.jsx"
import HistoriqueDemande from './HistoriqueDemande.jsx';
import { MdOutlineMarkEmailUnread } from "react-icons/md";
import DemandePersonnel from "./DemandePersonnel.jsx"
import { BiArchive } from "react-icons/bi";
import axios from 'axios';
import {useNavigate} from 'react-router-dom';
import { useEffect } from 'react';
import toast from "react-hot-toast";
const DashboardAdmin = () => {
  const [activePage, setActivePage] = useState("equipements");
  const [role, setRole] = useState("Utilisateur");
  const nav = useNavigate();
  const handleLogout = async() => {
    try {
     const response= await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/logout`,{ withCredentials: true });
      if (response.status === 200) {
        toast.success("Logging Out..");
        localStorage.removeItem('user');
        setTimeout(() => {
        nav('/');},1000);
      }
      console.log("Logout ", response.data);

    } catch (error) {
      console.error("Logout failed:", error.response ? error.response.data : error.message);
      alert("Logout failed. Please try again.");
    }
  };
  useEffect(() => {
    const fetchRole = async () => 
    {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_URL}/Asset/getRole`,{ withCredentials: true });
        if (response.status === 200) {
          const rolefind = response.data.role;
          setRole(rolefind);
        }
      } catch (error) {
        console.log(error.message)
        console.error("Failed to fetch role:", error.response ? error.response.data : error.message);
        alert("Failed to fetch role. Please try again.");
      }
    };
    fetchRole();
  }, []);




  const renderPage = () => {
    switch (activePage) {
      
      case "equipements":
        return <InventoryTable />;
      case "utilisateurs":
        return <Utilisateurs />;
      case "demandes":
        return <DemandesPage />;
      case "historique":
        return <HistoriquePage />;
      case "stock":
        return <EditableDesignationTable />;
      case "chatbot":
        return <Chatbot />;
      case "historiquedemande":
        return <HistoriqueDemande />;
      case "personnel":
        return <DemandePersonnel />;  
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="font-sans antialiased">
     
      <nav className="bg-white border-b border-gray-200 fixed z-30 w-full">
        <div className="px-3 py-3 lg:px-5 lg:pl-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button className="lg:hidden mr-2 text-gray-600 hover:text-gray-900 p-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button><div>
              <span className="text-xl font-bold flex items-center gap-2">
                <FaSheetPlastic />
                IT Asset Manager
                
              </span>
              <h2 className='mx-7 font-stronger'>{role}</h2>
              </div>
                          </div>
                          <div className='text-xl font-bold flex items-center gap-2'>Park IT</div>
            <button
            onClick={handleLogout}
              
              className="ml-5 text-white bg-blue-600 hover:bg-cyan-700 font-medium rounded-lg text-sm px-5 py-2.5 flex items-center gap-1"
            >
              
              <IoIosLogOut className='mx-2' size={20} /> Logout
            </button>
          </div>
        </div>
       
      </nav>

      {/* Layout */}
      <div className="flex overflow-hidden bg-white pt-16">
        {/* Sidebar */}
        <aside className="fixed z-20 h-full top-0 left-0 pt-16 lg:flex w-64 hidden flex-col border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="px-3 space-y-1">
              <ul className="space-y-2 pb-2 ">
                 {(role==="Admin" || role==="Gestionnaire")&& (  
                <li>
                  <button
                    onClick={() => setActivePage("equipements")}
                    className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'equipements' ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    📋 <span className="ml-3">Inventaire</span>
                  </button>
                </li>)}
                {role === "Admin" && (
  <li>
    <button
      onClick={() => setActivePage("utilisateurs")}
      className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'utilisateurs' ? 'bg-gray-100 font-semibold' : ''}`}
    >
      👤 <span className="ml-3">Utilisateurs</span>
    </button>
  </li>
)}
               
                 <li>
                  <button
                    onClick={() => setActivePage("personnel")}
                    className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'personnel' ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <BiArchive className='mx-1'/><span className="ml-3">Personnel</span>
                  </button>
                </li>
                 
                <li>
                  <button
                    onClick={() => setActivePage("demandes")}
                    className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'demandes' ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    📩 <span className="ml-3">Demandes</span>
                  </button>
                </li>
                 {(role==="Admin" || role==="Gestionnaire")&& (  
                 <li>
                  <button
                    onClick={() => setActivePage("historiquedemande")}
                    className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'historiquedemande' ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <MdOutlineMarkEmailUnread className='mx-1'/><span className="ml-3">Liste Demandes</span>
                  </button>
                </li>)}
                 {(role==="Admin" || role==="Gestionnaire")&& (  
                <li>
                  <button
                    onClick={() => setActivePage("historique")}
                    className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'historique' ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    📚 <span className="ml-3">Liste Affectations</span>
                  </button>
                </li>)}
                 {(role==="Admin" || role==="Gestionnaire")&& (  
                 <li>
                  <button
                    onClick={() => setActivePage("stock")}
                    className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'stock' ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <MdLaptopChromebook className='mx-1'/><span className="ml-3">Stock Informatique</span>
                  </button>
                </li>)}
                <li>
                  <button
                    onClick={() => setActivePage("chatbot")}
                    className={`w-full cursor-pointer text-left text-base font-normal rounded-lg flex items-center p-2 hover:bg-gray-100 ${activePage === 'chatbot' ? 'bg-gray-100 font-semibold' : ''}`}
                  >
                    <FaRobot className='mx-1'/><span className="ml-3">Assistant Ai</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>
           <footer className="mr-2 my-10 lg:block">
  <p className="text-center text-gray-600 text-sm font-semibold tracking-wide">
    Made by <span className="text-blue-600 hover:underline">Aymane Eddamane</span>
  </p>
</footer>
        </aside>

        {/* Main Content */}
        <div id="main-content" className="h-full w-full bg-gray-50 overflow-y-auto lg:ml-64">
          <main>
            {renderPage()}
          </main>

          {/* Footer */}
          <footer className="bg-white shadow rounded-lg p-4 md:p-6 xl:p-8 m-4">
            <ul className="flex flex-wrap mb-4">
              <li>
                <p className="text-sm text-gray-500 cursor-pointer mr-4">
                  Ask eddamaneaymane@gmail.com for any technical issues
                </p>
              </li>
            </ul>
            <div className="text-sm text-gray-400">© 2025 IT Asset Manager</div>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
