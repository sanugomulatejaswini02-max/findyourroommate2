import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isUsingMock, triggerSimulatedRealtimeMessage, triggerSimulatedNotification } from '../lib/supabaseClient';
import { calculateRoommateCompatibility, UserProfile, LifestyleHabits } from '../lib/aiMatching';

interface Property {
  id: number;
  owner_id: number;
  title: string;
  type: string;
  rent: number;
  deposit: number;
  location: string;
  landmark: string;
  description: string;
  amenities: string[]; // parsed from JSON
  available_from: string;
  rooms: number;
  photos: string[]; // parsed from JSON
  is_available: number;
  views: number;
  created_at: string;
}

interface Connection {
  id: number;
  sender_id: number;
  receiver_id: number;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface Message {
  id: number;
  chat_id: number;
  sender_id: number;
  content: string;
  is_read: number;
  created_at: string;
}

interface Chat {
  id: number;
  is_group: number;
  partner: UserProfile;
  lastMessage?: Message;
  unreadCount: number;
}

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'match' | 'message' | 'property' | 'connection';
  is_read: number;
  metadata: any; // parsed from JSON
  created_at: string;
}

interface AppContextType {
  user: UserProfile | null;
  loading: boolean;
  properties: Property[];
  wishlist: number[]; // Array of property_ids
  notifications: Notification[];
  chats: Chat[];
  activeChatId: number | null;
  messages: Message[];
  isTypingPartner: boolean;
  
  // Auth Operations
  signUp: (email: string, password: string, name: string, role: string, additionalData?: any) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  
  // Property Operations
  refreshProperties: () => Promise<void>;
  addProperty: (propertyData: Omit<Property, 'id' | 'owner_id' | 'views' | 'is_available' | 'created_at'>) => Promise<boolean>;
  updateProperty: (propertyId: number, updateData: Partial<Property>) => Promise<boolean>;
  deleteProperty: (propertyId: number) => Promise<boolean>;
  incrementViews: (propertyId: number) => Promise<void>;
  toggleWishlist: (propertyId: number) => Promise<void>;
  
  // Chat Operations
  selectChat: (chatId: number | null) => void;
  sendMessage: (content: string) => Promise<void>;
  sendTypingStatus: (isTyping: boolean) => void;
  createChatRoom: (partnerId: number) => Promise<number>;
  
  // Connection Operations
  sendConnectionRequest: (receiverId: number) => Promise<boolean>;
  respondToConnection: (notif: any, status: 'accepted' | 'rejected') => Promise<boolean>;
  getConnections: () => Promise<Connection[]>;
  
  // General Operations
  markNotificationsRead: () => Promise<void>;
  refreshAll: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTypingPartner, setIsTypingPartner] = useState(false);

  // Listen to Auth State Changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        // Fetch detailed profile
        try {
          const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', session.user.email)
            .maybeSingle();

          if (profile) {
            setUser(profile);
            // Load application data for this user
            await loadUserData(profile);
            // Refresh properties listed by all owners so seekers can see them
            await refreshProperties();
          } else {
            setUser(null);
            await refreshProperties();
          }
        } catch (e) {
          console.error('Error fetching user profile:', e);
          setUser(null);
          await refreshProperties();
        }
      } else {
        setUser(null);
        setWishlist([]);
        setNotifications([]);
        setChats([]);
        setActiveChatId(null);
        setMessages([]);
        await refreshProperties();
      }
      setLoading(false);
    });

    // Initial properties load (available to visitors too)
    refreshProperties();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Set up realtime subscriptions for messages and notifications if logged in
  useEffect(() => {
    if (!user) return;

    // Realtime Notifications Subscription
    const notificationChannel = supabase
      .channel(`notifications:${user.id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications' }, (payload: any) => {
        const newNotif = payload.new;
        try {
          newNotif.metadata = typeof newNotif.metadata === 'string' ? JSON.parse(newNotif.metadata) : newNotif.metadata;
        } catch (e) {}
        setNotifications(prev => [newNotif, ...prev]);
        
        // Also check if match notification triggers automated match connections logic
        if (newNotif.type === 'match' && isUsingMock) {
          // Trigger a follow up visual prompt
          console.log('Realtime match notification:', newNotif);
        }
      })
      .subscribe();

    return () => {
      notificationChannel.unsubscribe();
    };
  }, [user]);

  // Set up realtime subscription for active chat messages
  useEffect(() => {
    if (!user || activeChatId === null) {
      setMessages([]);
      return;
    }

    // Load existing messages
    loadChatMessages(activeChatId);

    // Subscribe to messages
    const messageChannel = supabase
      .channel(`chat:${activeChatId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload: any) => {
        const newMsg = payload.new;
        if (newMsg.chat_id === activeChatId) {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, newMsg];
          });
          
          // Mark as read
          if (newMsg.sender_id !== user.id) {
            supabase.from('messages').update({ is_read: 1 }).eq('id', newMsg.id);
          }
        }
      })
      .subscribe();

    // Subscribe to typing indicator
    const typingChannel = supabase
      .channel(`typing:${activeChatId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'typing_status' }, (payload: any) => {
        // Typing handler
      })
      .subscribe((status: string) => {
        // Handle subscription typing channel
      });

    // Mock custom listener for typing
    const cleanTypingMock = supabase.channel(`typing:${activeChatId}`).on('typing', null, (payload: any) => {
      if (payload.userId !== user.id) {
        setIsTypingPartner(payload.typing);
      }
    }).subscribe();

    return () => {
      messageChannel.unsubscribe();
      cleanTypingMock.unsubscribe();
      setIsTypingPartner(false);
    };
  }, [user, activeChatId]);

  const loadUserData = async (currentUser: UserProfile) => {
    try {
      // 1. Fetch Wishlist
      const { data: wishData } = await supabase
        .from('wishlists')
        .select('property_id')
        .eq('user_id', currentUser.id);
      
      if (wishData) {
        setWishlist(wishData.map((w: any) => w.property_id));
      }

      // 2. Fetch Notifications
      const { data: notifData } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      
      if (notifData) {
        setNotifications(
          notifData.map((n: any) => ({
            ...n,
            metadata: typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : n.metadata
          }))
        );
      }

      // 3. Fetch Chats
      await refreshChats(currentUser.id);
    } catch (e) {
      console.error('Error loading user data:', e);
    }
  };

  const refreshChats = async (currentUserId: number) => {
    try {
      // Fetch participant links
      const { data: myParticipations } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', currentUserId);

      if (!myParticipations || myParticipations.length === 0) {
        setChats([]);
        return;
      }

      const chatIds = myParticipations.map((p: any) => p.chat_id);
      const activeRooms: Chat[] = [];

      for (const cid of chatIds) {
        // Get all participants of this chat
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('chat_id', cid);

        if (!participants) continue;
        
        const partnerLink = participants.find((p: any) => p.user_id !== currentUserId);
        if (!partnerLink) continue;

        // Fetch partner profile
        const { data: partner } = await supabase
          .from('users')
          .select('*')
          .eq('id', partnerLink.user_id)
          .single();

        if (!partner) continue;

        // Fetch last message
        const { data: lastMsgs } = await supabase
          .from('messages')
          .select('*')
          .eq('chat_id', cid)
          .order('created_at', { ascending: false });

        const lastMsg = lastMsgs && lastMsgs.length > 0 ? lastMsgs[0] : undefined;

        // Calculate unread count
        const unreadCount = lastMsgs
          ? lastMsgs.filter((m: any) => m.sender_id !== currentUserId && m.is_read === 0).length
          : 0;

        activeRooms.push({
          id: cid,
          is_group: 0,
          partner,
          lastMessage: lastMsg,
          unreadCount
        });
      }

      // Order chats by last message timestamp
      activeRooms.sort((a, b) => {
        const timeA = new Date(a.lastMessage?.created_at || 0).getTime();
        const timeB = new Date(b.lastMessage?.created_at || 0).getTime();
        return timeB - timeA;
      });

      setChats(activeRooms);
    } catch (e) {
      console.error('Error loading chats:', e);
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (data) {
        setMessages(data);
        
        // Mark all messages as read for this user
        if (user) {
          const unreadMsgs = data.filter(m => m.sender_id !== user.id && m.is_read === 0);
          for (const m of unreadMsgs) {
            await supabase.from('messages').update({ is_read: 1 }).eq('id', m.id);
          }
          // Update local unread count
          setChats(prev => 
            prev.map(c => c.id === chatId ? { ...c, unreadCount: 0 } : c)
          );
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const refreshProperties = async () => {
    try {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (data) {
        setProperties(
          data.map((p: any) => ({
            ...p,
            amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities || '[]') : (p.amenities || []),
            photos: typeof p.photos === 'string' ? JSON.parse(p.photos || '[]') : (p.photos || [])
          }))
        );
      }
    } catch (e) {
      console.error('Error refreshing properties:', e);
    }
  };

  // --- AUTH ACTIONS ---
  const signUp = async (email: string, password: string, name: string, role: string, additionalData: any = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
          ...additionalData
        }
      }
    });

    if (error) throw error;
    
    // Automatically trigger live roommate matching check on the client-side for seeker/finder
    if (role === 'seeker' || role === 'finder') {
      setTimeout(() => triggerInitialMatchingCheck(data.user), 1500);
    }

    return data.user;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
    return data.user;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return false;
    try {
      const dbPayload: Record<string, any> = { ...profileData };

      // Stringify lifestyle_habits only if it's an object (not already a string)
      if (profileData.lifestyle_habits && typeof profileData.lifestyle_habits === 'object') {
        dbPayload.lifestyle_habits = JSON.stringify(profileData.lifestyle_habits);
      }

      // Stringify roommate_prefs only if it's an object (not already a string)
      if (profileData.roommate_prefs && typeof profileData.roommate_prefs === 'object') {
        dbPayload.roommate_prefs = JSON.stringify(profileData.roommate_prefs);
      }

      const { error } = await supabase
        .from('users')
        .update(dbPayload)
        .eq('id', user.id);

      if (error) throw error;

      const updatedUser = { 
        ...user, 
        ...profileData,
        lifestyle_habits: typeof profileData.lifestyle_habits === 'object' ? JSON.stringify(profileData.lifestyle_habits) : profileData.lifestyle_habits
      };
      setUser(updatedUser);
      localStorage.setItem('fyr_mock_session', JSON.stringify(updatedUser));

      if (user.role === 'seeker' || user.role === 'finder') {
        triggerInitialMatchingCheck(updatedUser);
      }

      return true;
    } catch (e) {
      console.error('Profile update failed:', e);
      if (e instanceof DOMException && e.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Profile picture may be too large.');
      }
      return false;
    }
  };

  // --- PROPERTY ACTIONS ---
  const addProperty = async (propertyData: any) => {
    if (!user || user.role !== 'owner') return false;
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert({
          owner_id: user.id,
          title: propertyData.title,
          type: propertyData.type,
          rent: propertyData.rent,
          deposit: propertyData.deposit,
          location: propertyData.location,
          landmark: propertyData.landmark,
          description: propertyData.description,
          amenities: JSON.stringify(propertyData.amenities),
          available_from: propertyData.available_from,
          rooms: propertyData.rooms,
          photos: JSON.stringify(propertyData.photos),
          is_available: 1,
          views: 0
        });

      if (error) throw error;
      
      // Update properties
      await refreshProperties();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const updateProperty = async (propertyId: number, updateData: any) => {
    if (!user || user.role !== 'owner') return false;
    try {
      const dbPayload = { ...updateData };
      if (updateData.amenities) {
        dbPayload.amenities = JSON.stringify(updateData.amenities);
      }
      if (updateData.photos) {
        dbPayload.photos = JSON.stringify(updateData.photos);
      }

      const { error } = await supabase
        .from('properties')
        .update(dbPayload)
        .eq('id', propertyId)
        .eq('owner_id', user.id);

      if (error) throw error;
      
      await refreshProperties();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const deleteProperty = async (propertyId: number) => {
    if (!user || user.role !== 'owner') return false;
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyId)
        .eq('owner_id', user.id);

      if (error) throw error;
      
      await refreshProperties();
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const incrementViews = async (propertyId: number) => {
    try {
      const property = properties.find(p => p.id === propertyId);
      if (!property) return;
      
      await supabase
        .from('properties')
        .update({ views: property.views + 1 })
        .eq('id', propertyId);
        
      setProperties(prev => 
        prev.map(p => p.id === propertyId ? { ...p, views: p.views + 1 } : p)
      );
    } catch (e) {
      console.error(e);
    }
  };

  const toggleWishlist = async (propertyId: number) => {
    if (!user) return;
    try {
      const isSaved = wishlist.includes(propertyId);
      if (isSaved) {
        await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('property_id', propertyId);
        setWishlist(prev => prev.filter(id => id !== propertyId));
      } else {
        await supabase
          .from('wishlists')
          .insert({ user_id: user.id, property_id: propertyId });
        setWishlist(prev => [...prev, propertyId]);
        
        // Notify owner of interest if using Mock
        if (isUsingMock) {
          const prop = properties.find(p => p.id === propertyId);
          if (prop) {
            triggerSimulatedNotification(
              prop.owner_id,
              'Property Shortlisted!',
              `${user.name} saved your listing "${prop.title.substring(0, 30)}..." to their wishlist.`,
              'property',
              { seekerId: user.id, propertyId }
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // --- CHAT ACTIONS ---
  const selectChat = (chatId: number | null) => {
    setActiveChatId(chatId);
  };

  const sendMessage = async (content: string) => {
    if (!user || activeChatId === null) return;
    try {
      if (isUsingMock) {
        // Leverage simulated helper for notifications and active channels
        triggerSimulatedRealtimeMessage(activeChatId, user.id, content);
        await loadChatMessages(activeChatId);
      } else {
        const { error } = await supabase
          .from('messages')
          .insert({
            chat_id: activeChatId,
            sender_id: user.id,
            content,
            is_read: 0
          });
        if (error) throw error;
      }
      
      // Update chats list locally
      setChats(prev => 
        prev.map(c => c.id === activeChatId 
          ? { 
              ...c, 
              lastMessage: { 
                id: Math.random(), 
                chat_id: activeChatId, 
                sender_id: user.id, 
                content, 
                is_read: 0, 
                created_at: new Date().toISOString() 
              } 
            } 
          : c
        )
      );
    } catch (e) {
      console.error(e);
    }
  };

  const sendTypingStatus = (isTyping: boolean) => {
    if (!user || activeChatId === null) return;
    supabase.channel(`typing:${activeChatId}`).send({
      type: 'broadcast',
      event: 'typing',
      payload: { userId: user.id, typing: isTyping }
    });
  };

  const createChatRoom = async (partnerId: number) => {
    if (!user) return -1;
    try {
      // Check if chat already exists
      const { data: myParticipations } = await supabase
        .from('chat_participants')
        .select('chat_id')
        .eq('user_id', user.id);

      if (myParticipations && myParticipations.length > 0) {
        const chatIds = myParticipations.map((p: any) => p.chat_id);
        
        const { data: partnerParticipations } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .in('chat_id', chatIds)
          .eq('user_id', partnerId);

        if (partnerParticipations && partnerParticipations.length > 0) {
          // Room already exists, return first matched chat_id
          const existingId = partnerParticipations[0].chat_id;
          await refreshChats(user.id);
          return existingId;
        }
      }

      // Create new chat room
      const { data: newChat, error: chatErr } = await supabase
        .from('chats')
        .insert({ is_group: 0 })
        .single();

      if (chatErr) throw chatErr;
      const chatId = newChat.id;

      // Add participants
      await supabase.from('chat_participants').insert([
        { chat_id: chatId, user_id: user.id },
        { chat_id: chatId, user_id: partnerId }
      ]);

      await refreshChats(user.id);
      return chatId;
    } catch (e) {
      console.error(e);
      return -1;
    }
  };

  // --- CONNECTION ACTIONS ---
  const sendConnectionRequest = async (receiverId: number) => {
    if (!user) return false;
    try {
      const { data, error } = await supabase
        .from('connections')
        .insert({
          sender_id: user.id,
          receiver_id: receiverId,
          status: 'pending'
        });

      if (error) throw error;

      // Simulated notification if mock
      if (isUsingMock) {
        triggerSimulatedNotification(
          receiverId,
          'Connection Request Received',
          `${user.name} wants to connect as a roommate partner.`,
          'connection',
          { senderId: user.id }
        );
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const respondToConnection = async (notif: any, status: 'accepted' | 'rejected') => {
    if (!user || !notif?.metadata?.senderId) return;
    try {
      const senderId = notif.metadata.senderId;
      const { data: conn } = await supabase
        .from('connections')
        .select('*')
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .single();

      if (!conn) return;

      await supabase
        .from('connections')
        .update({ status })
        .eq('id', conn.id);

      // Remove notification from state and localStorage
      setNotifications(prev => prev.filter(n => !(n.type === 'connection' && n.metadata?.senderId === senderId)));
      if (isUsingMock) {
        const allNotifs = JSON.parse(localStorage.getItem('fyr_notifications') || '[]');
        const filtered = allNotifs.filter((n: any) => {
          const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : (n.metadata || {});
          return !(n.type === 'connection' && (meta.senderId === senderId || meta.senderId === user.id));
        });
        localStorage.setItem('fyr_notifications', JSON.stringify(filtered));
      }

      if (status === 'accepted') {
        // Create chat room
        const chatId = await createChatRoom(senderId);
        
        // Notify sender they were accepted
        if (isUsingMock) {
          triggerSimulatedNotification(
            senderId,
            'Connection Request Accepted!',
            `${user.name} accepted your connection request. Start chatting now!`,
            'connection',
            { receiverId: user.id, chatId }
          );
          
          // Add a welcoming message
          triggerSimulatedRealtimeMessage(
            chatId,
            user.id,
            `Hey! I accepted your connection request. Great to meet you!`
          );
        }
      }
      
      // Update data
      await loadUserData(user);
      return status === 'accepted';
    } catch (e) {
      console.error(e);
    }
  };

  const getConnections = async () => {
    if (!user) return [];
    const { data } = await supabase
      .from('connections')
      .select('*')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`);
    return data || [];
  };

  // --- GENERAL ACTIONS ---
  const markNotificationsRead = async () => {
    if (!user) return;
    try {
      await supabase
        .from('notifications')
        .update({ is_read: 1 })
        .eq('user_id', user.id);
      
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    } catch (e) {
      console.error(e);
    }
  };

  const refreshAll = async () => {
    if (user) {
      await loadUserData(user);
    }
    await refreshProperties();
  };

  // --- AUTOMATED MATCH FINDING FOR LIVE DEMO ---
  const triggerInitialMatchingCheck = async (currentUser: UserProfile) => {
    if (!isUsingMock) return;
    
    const allUsers = JSON.parse(localStorage.getItem('fyr_users') || '[]');
    const otherUsers = allUsers.filter((u: any) => u.id !== currentUser.id && (u.role === 'seeker' || u.role === 'finder') && u.is_banned === 0);
    
    // Check for existing match notifications to avoid duplicates
    const existingNotifs = JSON.parse(localStorage.getItem('fyr_notifications') || '[]');
    
    for (const other of otherUsers) {
      const areaA = (currentUser.preferred_area || '').trim().toLowerCase();
      const areaB = (other.preferred_area || '').trim().toLowerCase();
      const cityA = (currentUser.city || '').trim().toLowerCase();
      const cityB = (other.city || '').trim().toLowerCase();
      const budgetA = Number(currentUser.budget || 0);
      const budgetB = Number(other.budget || 0);
      
      const isLocationMatch = areaA && areaB && areaA === areaB && cityA && cityB && cityA === cityB;
      const isBudgetMatch = budgetA > 0 && budgetB > 0 && Math.abs(budgetA - budgetB) <= 4000;
      
      if (isLocationMatch && isBudgetMatch) {
        const { score, explanation } = await calculateRoommateCompatibility(currentUser, other);
        if (score >= 80) {
          // Check if a match notification already exists for this pair
          const alreadyNotified = existingNotifs.some((n: any) => {
            const meta = typeof n.metadata === 'string' ? JSON.parse(n.metadata || '{}') : (n.metadata || {});
            return n.type === 'match' && (meta.matchUserId === other.id || meta.matchUserId === currentUser.id);
          });
          
          if (alreadyNotified) continue;

          // Notify current user about the match
          triggerSimulatedNotification(
            currentUser.id,
            'Potential Roommate Found!',
            `${other.name}, ${other.age || ''} • ${other.occupation || 'Looking for roommate'} • ₹${other.budget || '?'}/mo — looking in ${currentUser.preferred_area}`,
            'match',
            { matchUserId: other.id, score, explanation, name: other.name, age: other.age, occupation: other.occupation, budget: other.budget, preferred_area: other.preferred_area, profile_pic: other.profile_pic, city: other.city }
          );

          // Also notify the other user about the current user
          triggerSimulatedNotification(
            other.id,
            'Potential Roommate Found!',
            `${currentUser.name}, ${currentUser.age || ''} • ${currentUser.occupation || 'Looking for roommate'} • ₹${currentUser.budget || '?'}/mo — looking in ${currentUser.preferred_area}`,
            'match',
            { matchUserId: currentUser.id, score, explanation, name: currentUser.name, age: currentUser.age, occupation: currentUser.occupation, budget: currentUser.budget, preferred_area: currentUser.preferred_area, profile_pic: currentUser.profile_pic, city: currentUser.city }
          );
        }
      }
    }
  };

  return (
    <AppContext.Provider
      value={{
        user,
        loading,
        properties,
        wishlist,
        notifications,
        chats,
        activeChatId,
        messages,
        isTypingPartner,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProperties,
        addProperty,
        updateProperty,
        deleteProperty,
        incrementViews,
        toggleWishlist,
        selectChat,
        sendMessage,
        sendTypingStatus,
        createChatRoom,
        sendConnectionRequest,
        respondToConnection,
        getConnections,
        markNotificationsRead,
        refreshAll
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
