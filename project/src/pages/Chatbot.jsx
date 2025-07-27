import React, { useState, useRef, useEffect } from 'react';
import { FaRobot, FaSpinner, FaInfoCircle } from "react-icons/fa";
import axios from 'axios';

 const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: "Bonjour ! Je suis votre assistant pour la gestion du parc informatique. Posez-moi vos questions sur les équipements, les utilisateurs ou les demandes.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const chatEndRef = useRef(null);

  // Fallback to localhost if env variable is missing
  const API_BASE_URL =  import.meta.env.VITE_API_BASE_URL;
  
  console.log("API_BASE_URL:", API_BASE_URL);
  const suggestedQuestions = [
    "Combien d'équipements sont disponibles en stock ?",
    "Quels sont les équipements affectés à Aymane Eddamane ?",
    "Quel est l'état des équipements informatiques ?",
    "Combien de matériels sont en panne actuellement ?",
    "Quels sont les équipements obsolètes ou en fin de vie ?",
    "Peux-tu me donner un rapport sur les équipements par type ?",
    "Quand a été affecté l'écran Lenovo à l'utilisateur ?",
    "Quel est le taux d'utilisation des équipements ?",
    "Combien d'utilisateurs sont dans le système ?",
    "Quelles sont les demandes acceptées ?"
  ];

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      from: 'user',
      text: input,
      timestamp: new Date().toISOString()
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/query`, {
        question: input
      }, { timeout: 10000 });

      if (response.data && response.data.success && response.data.data) {
        const botResponse = response.data.data;

        const botMessage = {
          from: 'bot',
          text: botResponse.answer,
          timestamp: new Date().toISOString(),
          data: botResponse.details || null
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        setError("La réponse du serveur était incorrecte.");
      }
    } catch (error) {
      console.error("API Error:", error);
      setError("Erreur de connexion au serveur. Veuillez réessayer plus tard.");

      setMessages((prev) => [...prev, {
        from: 'bot',
        text: "Désolé, je n'ai pas pu traiter votre demande. Veuillez reformuler votre question ou réessayer plus tard.",
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInput(question);
    document.getElementById("chat-input")?.focus();
  };

  const renderMessageContent = (message) => {
    if (message.from === 'bot' && message.data) {
      return (
        <div className="space-y-2">
          <p>{message.text}</p>
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="font-semibold mb-2">Détails :</h4>
            {Array.isArray(message.data) && message.data.length > 0 ? (
              <ul className="space-y-1">
                {message.data.map((item, index) => (
                  <li key={index} className="border-b border-blue-100 pb-1">
                    {item && typeof item === 'object' ? (
                      Object.entries(item).map(([key, value]) => (
                        <p key={key}><span className="font-medium">{key}:</span> {String(value)}</p>
                      ))
                    ) : (
                      <p>{String(item)}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <pre>{JSON.stringify(message.data, null, 2)}</pre>
            )}
          </div>
        </div>
      );
    }
    return message.text;
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-4 overflow-x min-h-screen bg-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-3 text-blue-600">
            <FaRobot className='text-blue-600' />
            Assistant IT - Gestion d'Équipements
          </h2>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
          >
            <FaInfoCircle /> Aide
          </button>
        </div>

        {showHelp && (
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h3 className="font-semibold mb-2">Comment utiliser cet assistant :</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Posez des questions en français sur les équipements informatiques</li>
              <li>Utilisez les questions suggérées pour commencer</li>
              <li>L'assistant peut répondre sur les stocks, les affectations et l'état des équipements</li>
              <li>Exemples : "Quels écrans sont disponibles ?", "Qui a le laptop Dell XPS ?"</li>
            </ul>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded">
            <p>{error}</p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Chat Display */}
          <div className="flex-1 bg-white shadow-lg rounded-lg p-4 h-[500px] overflow-y-auto">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${msg.from === 'user'
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'}`}
                  >
                    <div className="text-sm">
                      {renderMessageContent(msg)}
                    </div>
                    <div className={`text-xs mt-1 ${msg.from === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                      {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : ""}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-800 rounded-lg p-3 rounded-bl-none max-w-[80%]">
                    <div className="flex items-center">
                      <FaSpinner className="animate-spin mr-2" />
                      <span>Recherche en cours...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </div>

          {/* Input Section */}
          <div className="w-full md:w-1/3 flex flex-col">
            <div className="bg-white shadow-lg rounded-lg p-4 flex-1 flex flex-col">
              <div className="flex-1">
                <label htmlFor="chat-input" className="block text-sm font-medium text-gray-700 mb-2">
                  Posez votre question :
                </label>
                <textarea
                  id="chat-input"
                  placeholder="Ex: Quels sont les équipements disponibles ?"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  disabled={isLoading}
                />

                <div className="mt-4">
                  <h3 className="font-semibold mb-2 flex items-center justify-between">
                    <span>Questions suggérées</span>
                    <span className="text-xs text-gray-500">{suggestedQuestions.length} suggestions</span>
                  </h3>
                  <ul className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {suggestedQuestions.map((question, index) => (
                      <li key={index}>
                        <button
                          onClick={() => handleSuggestedQuestion(question)}
                          className="text-left w-full p-2 text-sm bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                        >
                          {question}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300 disabled:bg-blue-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <FaSpinner className="animate-spin mr-2" />
                    Envoi en cours...
                  </span>
                ) : 'Envoyer'}
              </button>
            </div>

            <div className="mt-4 bg-white shadow-lg rounded-lg p-4">
              <h3 className="font-semibold mb-2">Statistiques rapides</h3>
              <button
                onClick={async () => {
                  try {
                    setIsLoading(true);
                    const response = await axios.get(`${API_BASE_URL}/api/stats`);
                    if (response.data && response.data.success && response.data.data) {
                      const stats = response.data.data;
                      setMessages(prev => [...prev, {
                        from: 'bot',
                        text: "Statistiques du parc informatique :",
                        timestamp: new Date().toISOString(),
                        data: stats
                      }]);
                    } else {
                      setError("Erreur lors de la récupération des statistiques.");
                    }
                  } catch (err) {
                    console.error("Error fetching stats:", err);
                    setError("Impossible de récupérer les statistiques.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
                className="text-sm bg-gray-100 hover:bg-gray-200 p-2 rounded w-full text-left"
              >
                Afficher les statistiques générales
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Chatbot;