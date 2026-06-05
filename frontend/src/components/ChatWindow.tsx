import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Send, MapPin, ExternalLink, RefreshCw, Home } from 'lucide-react';

interface ChatWindowProps {
  setView?: (view: string) => void;
  setSelectedProperty?: (prop: any) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ setView, setSelectedProperty }) => {
  const { 
    user, 
    chats, 
    activeChatId, 
    messages, 
    sendMessage, 
    sendTypingStatus, 
    isTypingPartner,
    properties,
    wishlist
  } = useApp();

  const [input, setInput] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const activeChat = chats.find(c => c.id === activeChatId);
  const partner = activeChat?.partner;

  // Handle auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTypingPartner]);

  // Handle typing status notification
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendTypingStatus(true);
  };

  // Debounce typing status clearing
  useEffect(() => {
    if (!input) {
      sendTypingStatus(false);
      return;
    }
    const timer = setTimeout(() => {
      sendTypingStatus(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [input]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    await sendMessage(input.trim());
    setInput('');
    sendTypingStatus(false);
  };

  const handleShareProperty = async (propertyId: number) => {
    const prop = properties.find(p => p.id === propertyId);
    if (!prop) return;
    
    // Send a structured message with property details
    const content = `SHARED_PROPERTY_ID:${prop.id}|TITLE:${prop.title}|RENT:₹${prop.rent}|LOCATION:${prop.location}`;
    await sendMessage(content);
    setShowShareModal(false);
  };

  // Helper to parse shared property messages
  const parseSharedProperty = (content: string) => {
    if (!content.startsWith('SHARED_PROPERTY_ID:')) return null;
    try {
      const parts = content.split('|');
      const id = Number(parts[0].replace('SHARED_PROPERTY_ID:', ''));
      const title = parts[1].replace('TITLE:', '');
      const rent = parts[2].replace('RENT:', '');
      const location = parts[3].replace('LOCATION:', '');
      
      const fullProp = properties.find(p => p.id === id);
      return { id, title, rent, location, photo: fullProp?.photos?.[0] };
    } catch (e) {
      return null;
    }
  };

  if (!activeChat || !partner) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-amber-50/20 rounded-3xl border border-amber-200/20">
        <Home className="w-16 h-16 text-slate-300 mb-4 animate-bounce" />
        <h3 className="font-extrabold text-slate-700 text-lg">Your Messages</h3>
        <p className="text-sm text-slate-400 mt-2 max-w-sm">
          Select a chat room from the conversation panel to start messaging with property owners or potential roommates.
        </p>
      </div>
    );
  }

  // Get wishlisted properties for sharing
  const myWishlistProperties = properties.filter(p => wishlist.includes(p.id));

  return (
    <div className="flex-1 flex flex-col bg-white border border-amber-200/60 rounded-3xl overflow-hidden shadow-sm h-80 md:h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-amber-100">
        <div className="flex items-center gap-3">
          <img 
            src={partner.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'} 
            alt={partner.name}
            className="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-500/20"
          />
          <div>
            <h4 className="font-bold text-slate-800 text-sm">{partner.name}</h4>
            <p className="text-[10px] text-slate-400 capitalize">
              {partner.role.replace('_', ' ')} • Online
            </p>
          </div>
        </div>

        {/* Share Button (Only show if seeker/finder) */}
        {user?.role !== 'owner' && myWishlistProperties.length > 0 && (
          <button
            onClick={() => setShowShareModal(true)}
            className="text-xs px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-90 text-white font-bold rounded-xl shadow-sm transition-all"
          >
            Share Room
          </button>
        )}
      </div>

      {/* Messages list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-amber-50/20">
        {messages.map((msg) => {
          const isMe = msg.sender_id === user?.id;
          const sharedProp = parseSharedProperty(msg.content);

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              {sharedProp ? (
                /* Shared Property Card Layout */
                <div className="max-w-xs w-full bg-white border border-amber-200/60 rounded-2xl overflow-hidden shadow-md">
                  <div className="aspect-[16/9] w-full bg-slate-100">
                    <img 
                      src={sharedProp.photo || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=300'} 
                      alt={sharedProp.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <span className="text-[10px] font-extrabold uppercase bg-amber-100 text-amber-700 px-2 py-0.5 rounded">
                      Shared Room
                    </span>
                    <h5 className="font-bold text-slate-800 text-xs mt-1.5 line-clamp-1">
                      {sharedProp.title}
                    </h5>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{sharedProp.location}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100">
                      <span className="text-xs font-extrabold text-amber-500">{sharedProp.rent} / mo</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (setView && setSelectedProperty && sharedProp) {
                            setSelectedProperty(properties.find(p => p.id === sharedProp.id));
                            setView('property-details');
                          }
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-500 flex items-center gap-0.5"
                      >
                        Details <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Standard Message Bubble */
                <div 
                  className={`max-w-[70%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? 'bg-amber-500 text-white rounded-br-none' : 'bg-white border border-amber-100 text-slate-700 rounded-bl-none'}`}
                >
                  <p>{msg.content}</p>
                </div>
              )}
              
              <span className="text-[9px] text-slate-400 mt-1 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                {isMe && (
                  <span className="ml-1 text-amber-400 font-bold">
                    {msg.is_read ? ' • Read' : ' • Sent'}
                  </span>
                )}
              </span>
            </div>
          );
        })}

        {/* Partner Typing indicator */}
        {isTypingPartner && (
          <div className="flex items-center gap-2">
            <div className="flex gap-1 p-2.5 bg-slate-100 rounded-2xl rounded-bl-none">
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
            <span className="text-[9px] text-slate-400">Typing...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form 
        onSubmit={handleSend}
        className="p-3 border-t border-amber-100 bg-amber-50/20 flex gap-2 items-center"
      >
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message here..."
          className="flex-1 bg-white border border-amber-200/70 px-4 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 text-slate-800"
        />
        <button
          type="submit"
          className="p-3 bg-gradient-to-r from-amber-500 to-amber-700 hover:opacity-90 text-white rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Share Property Modal Overlay */}
      {showShareModal && (
        <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl p-5 border border-amber-200 max-h-[80%] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-extrabold text-slate-800">Share shortlisted properties</h4>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600"
              >
                Close
              </button>
            </div>
            
            <div className="space-y-2.5">
              {myWishlistProperties.map((prop) => (
                <div 
                  key={prop.id}
                  onClick={() => handleShareProperty(prop.id)}
                  className="flex items-center gap-3 p-2 border border-amber-100 hover:bg-amber-50 rounded-2xl cursor-pointer transition-colors"
                >
                  <img 
                    src={prop.photos?.[0]} 
                    alt={prop.title}
                    className="w-12 h-12 object-cover rounded-xl"
                  />
                  <div className="flex-1 min-w-0">
                    <h5 className="font-bold text-xs text-slate-800 truncate">{prop.title}</h5>
                    <p className="text-[10px] text-slate-400 truncate">{prop.location}</p>
                  </div>
                  <span className="text-xs font-extrabold text-amber-500 shrink-0">₹{prop.rent}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
