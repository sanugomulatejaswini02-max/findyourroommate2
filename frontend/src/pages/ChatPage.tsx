import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ChatWindow } from '../components/ChatWindow';
import { MessageSquare, Search, Sparkles } from 'lucide-react';

interface ChatPageProps {
  setView?: (view: string) => void;
  setSelectedProperty?: (prop: any) => void;
}

export const ChatPage: React.FC<ChatPageProps> = ({ setView, setSelectedProperty }) => {
  const { chats, activeChatId, selectChat } = useApp();
  const [chatSearch, setChatSearch] = useState('');

  const filteredChats = chats.filter((c) =>
    c.partner.name.toLowerCase().includes(chatSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-amber-50/30 text-slate-800 py-10 max-w-7xl mx-auto w-[92%]">

      <div className="mb-8 flex items-center gap-2">
        <MessageSquare className="w-8 h-8 text-amber-500 shrink-0" />
        <div>
          <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 via-amber-600 to-amber-500">
            Inbox
          </h2>
          <p className="text-xs text-slate-400 mt-1">Chat securely and finalize your room sharing arrangements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        <div className="bg-white/90 border border-amber-200/20 shadow-glass rounded-3xl overflow-hidden shadow-sm flex flex-col h-80 md:h-[600px]">
          <div className="p-4 border-b border-slate-100 bg-amber-50/50">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={chatSearch}
                onChange={(e) => setChatSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-amber-200/70 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-amber-500/50 text-slate-800"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {filteredChats.length === 0 ? (
              <p className="text-xs text-center py-12 text-slate-400">No active chats found.</p>
            ) : (
              filteredChats.map((c) => {
                const isActive = c.id === activeChatId;

                const getRoleTagColor = (role: string) => {
                  if (role === 'owner') return 'bg-emerald-50 text-emerald-600';
                  return 'bg-amber-50 text-amber-600';
                };

                return (
                  <div
                    key={c.id}
                    onClick={() => selectChat(c.id)}
                    className={`flex items-center gap-3.5 p-3.5 rounded-2xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-amber-500 text-white shadow-glow'
                        : 'hover:bg-amber-50 border border-transparent hover:border-amber-200/40'
                    }`}
                  >
                    <img
                      src={c.partner.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={c.partner.name}
                      className="w-11 h-11 rounded-xl object-cover shrink-0 ring-2 ring-white/10 shadow-sm"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <h4 className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-slate-800'}`}>
                          {c.partner.name}
                        </h4>
                        {!isActive && (
                          <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded leading-none ${getRoleTagColor(c.partner.role)}`}>
                            {c.partner.role}
                          </span>
                        )}
                      </div>

                      <p className={`text-[10px] truncate mt-1 ${isActive ? 'text-slate-100' : 'text-slate-400'}`}>
                        {c.lastMessage?.content.startsWith('SHARED_PROPERTY_ID:')
                          ? '\uD83C\uDFE0 Shared a room listing'
                          : (c.lastMessage?.content || 'No messages yet')}
                      </p>
                    </div>

                    {c.unreadCount > 0 && (
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shrink-0 shadow-sm ${
                        isActive ? 'bg-white text-amber-500' : 'bg-amber-500 text-white'
                      }`}>
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="md:col-span-2">
          <ChatWindow setView={setView} setSelectedProperty={setSelectedProperty} />
        </div>

      </div>

    </div>
  );
};
