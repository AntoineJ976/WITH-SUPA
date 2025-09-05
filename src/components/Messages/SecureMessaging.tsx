import React, { useState } from 'react';
import { Send, Shield, Paperclip, Search, MoreVertical, Camera, Image, FileText, Mic, Video, X, Upload, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const SecureMessaging: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState('1');
  const [newMessage, setNewMessage] = useState('');
  const [showConversationList, setShowConversationList] = useState(true);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [unreadCounts, setUnreadCounts] = useState<{[key: string]: number}>({
    '1': 2,
    '2': 0
  });
  
  // Messages par conversation
  const [conversationMessages, setConversationMessages] = useState({
    '1': [
      {
        id: '1',
        senderId: 'doctor',
        content: 'Bonjour Jean, comment vous sentez-vous depuis notre dernière consultation ?',
        timestamp: '2025-01-14T09:00:00Z',
        encrypted: true
      },
      {
        id: '2',
        senderId: 'patient',
        content: 'Bonjour docteur, je me sens mieux. Les douleurs ont diminué.',
        timestamp: '2025-01-14T09:15:00Z',
        encrypted: true
      },
      {
        id: '3',
        senderId: 'doctor',
        content: 'C\'est une excellente nouvelle ! Continuez le traitement comme prescrit. Votre ordonnance est maintenant disponible.',
        timestamp: '2025-01-14T10:30:00Z',
        encrypted: true
      }
    ],
    '2': [
      {
        id: '4',
        senderId: 'doctor',
        content: 'Merci pour les résultats de vos analyses. Tout semble normal.',
        timestamp: '2025-01-13T16:45:00Z',
        encrypted: true
      },
      {
        id: '5',
        senderId: 'patient',
        content: 'Parfait, merci docteur !',
        timestamp: '2025-01-13T16:50:00Z',
        encrypted: true
      }
    ]
  });

  const conversations = [
    {
      id: '1',
      participant: 'Dr. Marie Leblanc',
      specialty: 'Médecine générale',
      lastMessage: 'Votre ordonnance est maintenant disponible.',
      timestamp: '2025-01-14T10:30:00Z',
      unread: unreadCounts['1'] || 0,
      encrypted: true
    },
    {
      id: '2',
      participant: 'Dr. Pierre Martin',
      specialty: 'Cardiologie',
      lastMessage: 'Merci pour les résultats de vos analyses.',
      timestamp: '2025-01-13T16:45:00Z',
      unread: unreadCounts['2'] || 0,
      encrypted: true
    }
  ];

  // Messages de la conversation sélectionnée
  const messages = conversationMessages[selectedConversation] || [];
  
  // Conversation sélectionnée
  const currentConversation = conversations.find(c => c.id === selectedConversation);

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    setShowConversationList(false); // Hide conversation list on mobile after selection
    
    // Marquer les messages comme lus et mettre à jour le compteur global
    const previousUnread = unreadCounts[conversationId] || 0;
    setUnreadCounts(prev => ({
      ...prev,
      [conversationId]: 0
    }));
    
    // Mettre à jour le compteur global dans le localStorage
    if (previousUnread > 0) {
      const currentTotal = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);
      const newTotal = Math.max(0, currentTotal - previousUnread);
      localStorage.setItem('unreadMessagesCount', newTotal.toString());
      
      // Déclencher un événement pour notifier les autres composants
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Envoyer le message texte s'il y en a un
      if (newMessage.trim()) {
        const textMessage = {
          id: Date.now().toString(),
          senderId: 'patient',
          content: newMessage.trim(),
          timestamp: new Date().toISOString(),
          encrypted: true
        };
        
        setConversationMessages(prev => ({
          ...prev,
          [selectedConversation]: [
            ...(prev[selectedConversation] || []),
            textMessage
          ]
        }));
      }
      
      // Envoyer les fichiers joints
      attachedFiles.forEach((file, index) => {
        const fileMessage = {
          id: (Date.now() + index).toString(),
          senderId: 'patient',
          content: `📎 ${file.name}`,
          timestamp: new Date().toISOString(),
          encrypted: true,
          attachment: file
        };
        
        setConversationMessages(prev => ({
          ...prev,
          [selectedConversation]: [
            ...(prev[selectedConversation] || []),
            fileMessage
          ]
        }));
      });
      
      // Réinitialiser
      setNewMessage('');
      setAttachedFiles([]);
      setShowAttachmentMenu(false);
    }
  };

  const handleFileSelection = (type: string) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    
    switch (type) {
      case 'photo':
        input.accept = 'image/*';
        break;
      case 'document':
        input.accept = '.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx';
        break;
      case 'audio':
        input.accept = 'audio/*';
        break;
      case 'video':
        input.accept = 'video/*';
        break;
      default:
        input.accept = '*/*';
    }
    
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      processSelectedFiles(files);
    };
    
    input.click();
    setShowAttachmentMenu(false);
  };

  const processSelectedFiles = (files: File[]) => {
    const validFiles: any[] = [];
    
    files.forEach((file) => {
      // Validation de la taille selon le type
      const maxSizes = {
        video: 50 * 1024 * 1024, // 50MB pour les vidéos
        audio: 20 * 1024 * 1024, // 20MB pour l'audio
        document: 25 * 1024 * 1024, // 25MB pour les documents
        default: 10 * 1024 * 1024 // 10MB par défaut
      };
      
      const fileType = file.type.split('/')[0];
      const maxSize = maxSizes[fileType as keyof typeof maxSizes] || maxSizes.default;
      
      if (file.size > maxSize) {
        alert(`Le fichier "${file.name}" est trop volumineux. Taille maximum : ${Math.round(maxSize / (1024 * 1024))}MB.`);
        return;
      }
      
      // Créer l'objet fichier avec preview
      const fileObj = {
        id: Date.now().toString() + Math.random(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        file: file,
        preview: null // Pas de preview d'images
      };
      
      validFiles.push(fileObj);
      
      // Simuler l'upload avec progress
      simulateUpload(fileObj.id);
    });
    
    setAttachedFiles(prev => [...prev, ...validFiles]);
  };

  const simulateUpload = (fileId: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      } else {
        setUploadProgress(prev => ({ ...prev, [fileId]: Math.round(progress) }));
      }
    }, 200);
  };

  const removeAttachedFile = (fileId: string) => {
    setAttachedFiles(prev => {
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
    
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('video/')) return <Video className="h-4 w-4" />;
    if (fileType.startsWith('audio/')) return <Mic className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const attachmentMenuItems = [
    {
      id: 'photo',
      label: 'Galerie photo',
      icon: Image,
      color: 'bg-green-500',
      description: 'Choisir une image'
    },
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      color: 'bg-orange-500',
      description: 'PDF, Word, Excel...'
    },
    {
      id: 'audio',
      label: 'Audio',
      icon: Mic,
      color: 'bg-red-500',
      description: 'Fichier audio'
    },
    {
      id: 'video',
      label: 'Vidéo',
      icon: Video,
      color: 'bg-purple-500',
      description: 'Fichier vidéo'
    }
  ];

  const oldHandleFileAttachment = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        senderId: 'patient',
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        encrypted: true
      };
      
      setConversationMessages(prev => ({
        ...prev,
        [selectedConversation]: [
          ...(prev[selectedConversation] || []),
          message
        ]
      }));
      setNewMessage('');
    }
  };

  const handleFileAttachment = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.multiple = false;
    
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Vérifier la taille du fichier (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          alert('Le fichier est trop volumineux. Taille maximum : 5MB.');
          return;
        }
        
        // Vérifier le type de fichier
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
          alert('Type de fichier non supporté. Formats acceptés : PDF, Word, texte.');
          return;
        }
        
        // Créer un message avec le fichier
        const fileMessage = {
          id: Date.now().toString(),
          senderId: 'patient',
          content: `📎 Fichier joint: ${file.name}`,
          timestamp: new Date().toISOString(),
          encrypted: true,
          attachment: {
            name: file.name,
            size: file.size,
            type: file.type,
            url: URL.createObjectURL(file) // En production, uploader vers Firebase Storage
          }
        };
        
        setConversationMessages(prev => ({
          ...prev,
          [selectedConversation]: [
            ...(prev[selectedConversation] || []),
            fileMessage
          ]
        }));
        
        // Notification de succès
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg z-50 transition-all';
        notification.textContent = `✅ Fichier "${file.name}" joint avec succès`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 3000);
      }
    };
    
    input.click();
  };

  return (
    <div className="h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex relative overflow-hidden">
      {/* Conversations List */}
      <div className={`${showConversationList ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-gray-200 flex-col absolute md:relative z-10 bg-white h-full`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
              <button 
                onClick={() => setShowConversationList(false)}
                className="md:hidden p-1 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Chiffré</span>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une conversation..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => handleConversationSelect(conversation.id)}
              className={`w-full p-4 text-left border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                selectedConversation === conversation.id ? 'bg-sky-50 border-sky-200' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {conversation.participant.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{conversation.participant}</h3>
                    <p className="text-xs text-gray-500">{conversation.specialty}</p>
                  </div>
                </div>
                {conversation.unread > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {conversation.unread}
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">
                  {format(new Date(conversation.timestamp), 'dd/MM à HH:mm', { locale: fr })}
                </span>
                {conversation.encrypted && (
                  <Shield className="h-3 w-3 text-green-500" />
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Message Area */}
      <div className={`${showConversationList ? 'hidden' : 'flex'} md:flex flex-1 flex-col`}>
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <button 
                onClick={() => setShowConversationList(true)}
                className="md:hidden p-2 text-gray-500 hover:text-gray-700 flex-shrink-0"
              >
                ←
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-sky-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">
                  {currentConversation?.participant.split(' ').map(n => n[0]).join('') || 'ML'}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900">{currentConversation?.participant || 'Dr. Marie Leblanc'}</h3>
                <p className="text-sm text-gray-600 truncate">En ligne • {currentConversation?.specialty || 'Médecine générale'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                <Shield className="h-3 w-3 text-green-600" />
                <span className="text-xs text-green-700 font-medium hidden sm:inline">Chiffré E2E</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === 'patient' ? 'justify-end' : 'justify-start'} px-2 sm:px-0`}
            >
              <div
                className={`max-w-[85%] sm:max-w-xs lg:max-w-md xl:max-w-lg px-3 sm:px-4 py-2 rounded-lg ${
                  message.senderId === 'patient'
                    ? 'bg-sky-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="text-sm">
                  {(message as any).attachment ? (
                    <div className="space-y-2">
                      <p>{message.content}</p>
                      <div className="flex items-center space-x-2 p-2 bg-white bg-opacity-20 rounded border">
                        <Paperclip className="h-3 w-3" />
                        <span className="text-xs truncate">{(message as any).attachment.name}</span>
                        <button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = (message as any).attachment.url;
                            link.download = (message as any).attachment.name;
                            link.click();
                          }}
                          className="text-xs underline hover:no-underline"
                        >
                          Télécharger
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className={`text-xs ${
                      message.senderId === 'patient' ? 'text-sky-100' : 'text-gray-500'
                    }`}
                  >
                    {format(new Date(message.timestamp), 'HH:mm', { locale: fr })}
                  </span>
                  {message.encrypted && (
                    <Shield className="h-3 w-3 text-green-400" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          {/* File Attachments Preview */}
          {attachedFiles.length > 0 && (
            <div className="mb-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Fichiers joints ({attachedFiles.length})
                </span>
                <button
                  onClick={() => {
                    attachedFiles.forEach(file => {
                      if (file.url) URL.revokeObjectURL(file.url);
                      if (file.preview) URL.revokeObjectURL(file.preview);
                    });
                    setAttachedFiles([]);
                  }}
                  className="text-xs text-red-600 hover:text-red-700"
                >
                  Tout supprimer
                </button>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                {attachedFiles.map((file) => (
                  <div key={file.id} className="relative group">
                    <div className="border border-gray-200 rounded-lg p-2 bg-gray-50 hover:bg-gray-100 transition-colors">
                      {/* File Preview */}
                      <div className="flex items-center space-x-2 mb-1">
                        {file.preview ? (
                          <img 
                            src={file.preview} 
                            alt={file.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                            {getFileIcon(file.type)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                        </div>
                      </div>
                      
                      {/* Upload Progress */}
                      {uploadProgress[file.id] !== undefined && (
                        <div className="mb-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Upload...</span>
                            <span className="text-gray-600">{uploadProgress[file.id]}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div 
                              className="bg-sky-500 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[file.id]}%` }}
                            />
                          </div>
                        </div>
                      )}
                      
                      {/* Remove Button */}
                      <button
                        onClick={() => removeAttachedFile(file.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex items-end space-x-3">
            {/* Attachment Button */}
            <div className="relative">
              <button 
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
                className={`p-2 rounded-lg transition-all ${
                  showAttachmentMenu || attachedFiles.length > 0
                    ? 'text-sky-500 bg-sky-50' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                }`}
                title="Joindre un fichier"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              
              {/* Attachment Menu */}
              {showAttachmentMenu && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-64 z-50">
                  <div className="grid grid-cols-1 gap-1">
                    {attachmentMenuItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleFileSelection(item.id)}
                          className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left w-full"
                        >
                          <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{item.label}</p>
                            <p className="text-xs text-gray-500">{item.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Close Menu Button */}
                  <div className="border-t border-gray-100 mt-2 pt-2">
                    <button
                      onClick={() => setShowAttachmentMenu(false)}
                      className="w-full p-2 text-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Tapez votre message sécurisé..."
                rows={1}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none text-sm sm:text-base"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <p className="text-xs text-gray-500 mt-1 flex items-center hidden sm:flex">
                <Shield className="h-3 w-3 mr-1 text-green-500" />
                Messages chiffrés de bout en bout
              </p>
            </div>

            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() && attachedFiles.length === 0}
              className={`p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                newMessage.trim() || attachedFiles.length > 0
                  ? 'bg-sky-500 text-white hover:bg-sky-600 scale-100'
                  : 'bg-gray-200 text-gray-400'
              }`}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Overlay to close attachment menu */}
      {showAttachmentMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setShowAttachmentMenu(false)}
        />
      )}
    </div>
  );
};