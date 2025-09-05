import React, { useState, useEffect } from 'react';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  MessageSquare, 
  Settings,
  Users,
  Clock,
  Shield
} from 'lucide-react';

interface VideoConsultationProps {
  onEndCall?: () => void;
}

export const VideoConsultation: React.FC<VideoConsultationProps> = ({ onEndCall }) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [consultationTime, setConsultationTime] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'Dr. Leblanc',
      message: 'Bonjour, comment vous sentez-vous aujourd\'hui ?',
      time: '14:30'
    },
    {
      id: '2',
      sender: 'Vous',
      message: 'Bonjour docteur, j\'ai encore des douleurs au dos.',
      time: '14:31'
    }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setConsultationTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'Vous',
        message: chatMessage.trim(),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      setChatMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // En production, ici on contrôlerait la caméra
    console.log('Vidéo:', !isVideoOn ? 'activée' : 'désactivée');
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    // En production, ici on contrôlerait le microphone
    console.log('Audio:', !isAudioOn ? 'activé' : 'désactivé');
  };

  const toggleChat = () => {
    setShowChat(!showChat);
    console.log('Chat:', !showChat ? 'ouvert' : 'fermé');
  };

  const openSettings = () => {
    // Ouvrir les paramètres de la consultation
    alert('Paramètres de consultation\n\n• Qualité vidéo: HD\n• Microphone: Activé\n• Caméra: Activée\n• Connexion: Stable');
  };
  const handleEndCall = () => {
    const confirmEnd = window.confirm('Êtes-vous sûr de vouloir terminer la consultation ?');
    if (!confirmEnd) return;
    
    console.log('Consultation terminée');
    if (onEndCall) {
      onEndCall();
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 px-4 sm:px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2 sm:space-x-4 flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base truncate">Consultation avec Dr. Marie Leblanc</span>
          </div>
          <div className="hidden sm:flex items-center space-x-2 text-gray-300">
            <Clock className="h-4 w-4" />
            <span className="text-sm">{formatTime(consultationTime)}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 flex-shrink-0">
          <span className="bg-green-500 text-green-50 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium">
            En cours
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Doctor Video */}
          <div className="h-full bg-gray-800 flex items-center justify-center relative">
            <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-sky-500 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="w-32 h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 mx-auto">
                  <span className="text-4xl font-bold">ML</span>
                </div>
                <h3 className="text-xl font-semibold">Dr. Marie Leblanc</h3>
                <p className="text-emerald-100">Médecine générale</p>
              </div>
            </div>

            {/* Patient Video (Picture-in-Picture) */}
            <div className="absolute bottom-4 right-4 w-32 h-24 sm:w-48 sm:h-36 bg-gray-700 rounded-lg overflow-hidden border-2 border-white shadow-lg">
              <div className="w-full h-full bg-gradient-to-br from-sky-400 to-emerald-400 flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-8 h-8 sm:w-16 sm:h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-1 sm:mb-2 mx-auto">
                    <span className="text-sm sm:text-lg font-bold">JD</span>
                  </div>
                  <p className="text-xs sm:text-sm">Vous</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 sm:space-x-4 bg-gray-800 bg-opacity-90 backdrop-blur-sm rounded-full px-4 sm:px-6 py-3">
              <button
                onClick={toggleVideo}
                className={`p-2 sm:p-3 rounded-full transition-colors ${
                  isVideoOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                }`}
                title={isVideoOn ? 'Désactiver la caméra' : 'Activer la caméra'}
              >
                {isVideoOn ? <Video className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : <VideoOff className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
              </button>

              <button
                onClick={toggleAudio}
                className={`p-2 sm:p-3 rounded-full transition-colors ${
                  isAudioOn ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'
                }`}
                title={isAudioOn ? 'Couper le microphone' : 'Activer le microphone'}
              >
                {isAudioOn ? <Mic className="h-4 w-4 sm:h-5 sm:w-5 text-white" /> : <MicOff className="h-4 w-4 sm:h-5 sm:w-5 text-white" />}
              </button>

              <button
                onClick={toggleChat}
                className="p-2 sm:p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors relative"
                title="Ouvrir/Fermer le chat"
              >
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  2
                </span>
              </button>

              <button 
                onClick={openSettings}
                className="hidden sm:block p-2 sm:p-3 rounded-full bg-gray-600 hover:bg-gray-500 transition-colors"
                title="Paramètres de consultation"
              >
                <Settings className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>

              <button 
                onClick={handleEndCall}
                className="p-2 sm:p-3 rounded-full bg-red-600 hover:bg-red-700 transition-colors"
                title="Terminer la consultation"
              >
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute right-0 top-0 bottom-0 w-full sm:w-80 bg-white border-l border-gray-200 flex flex-col z-20 sm:relative">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Chat de consultation
                </h3>
                <button 
                  onClick={() => setShowChat(false)}
                  className="sm:hidden p-1 text-gray-500 hover:text-gray-700"
                  title="Fermer le chat"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[85%] ${
                    msg.sender === 'Vous'
                      ? 'bg-sky-500 text-white ml-auto'
                      : 'bg-gray-100 text-gray-900 mr-auto'
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender === 'Vous' ? 'text-sky-100' : 'text-gray-500'
                  }`}>
                    {msg.time}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Tapez votre message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim()}
                  className="bg-sky-500 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  title="Envoyer le message"
                >
                  Envoyer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RGPD Notice */}
      <div className="absolute top-16 sm:top-4 left-2 sm:left-4 bg-yellow-100 border border-yellow-300 rounded-lg p-2 sm:p-3 max-w-xs sm:max-w-sm">
        <div className="flex items-start space-x-2">
          <Shield className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-yellow-800">
            Cette consultation est enregistrée uniquement si vous avez donné votre consentement. 
            Toutes les données sont chiffrées et conformes RGPD.
          </p>
        </div>
      </div>
    </div>
  );
};