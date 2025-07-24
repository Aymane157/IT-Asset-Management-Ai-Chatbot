import React, { useState, useRef, useEffect } from 'react';
import { FaRobot } from "react-icons/fa";

const Chatbot = () => {
  const [messages, setMessages] = useState([
    { from: 'bot', text: "Bonjour ! Comment puis-je vous aider avec la gestion du parc informatique ?" }
  ]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!input.trim()) return;

    // Add user's message
    const userMessage = { from: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { from: 'bot', text: "bah oui" }
      ]);
    }, 500);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="p-4 overflow-x min-h-screen bg-gray-100">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-blue-600">
        <FaRobot className='text-blue-600' />
        Assistant AI
      </h2>
      <p className="text-gray-700 mb-6">
        Votre assistant intelligent pour la gestion du parc informatique
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {/* AI Section (Chat Display) */}
        <div className="flex-1 bg-white shadow-lg rounded-lg p-4 h-[500px] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div key={idx} className={`mb-3 ${msg.from === 'user' ? 'text-right' : 'text-left'}`}>
              <span
                className={`inline-block px-4 py-2 rounded-lg text-sm ${
                  msg.from === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {msg.text}
              </span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        {/* Question Input Section */}
        <div className="w-full md:w-1/3 bg-white shadow-lg rounded-lg p-4 flex flex-col justify-between">
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Posez votre question :
            </label>
            <input
              id="message"
              type="text"
              placeholder="Écrivez ici..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyUp={handleKeyPress}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <div className=''>
              <h1 className='text-xl font-semibold mb-4'>Questions Suggerees</h1>
              <ul>
                <li>
                  Quels sont les équipements affectés à [Nom d’utilisateur / Service] ?</li><li>
Quel est l’état d’un équipement (PC, imprimante, écran, etc.) ?</li><li>
Quelle est la liste des équipements disponibles en stock ? </li>

              </ul>
            </div>
          </div>
          <button
            onClick={handleSend}
            className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
