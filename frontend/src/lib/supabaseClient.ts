import { createClient } from '@supabase/supabase-js';

// Read configuration from Vite env variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Detect if we should use the live Supabase client or the localStorage-backed mock client
const isLiveSupabaseConfigured = 
  supabaseUrl && 
  supabaseUrl !== 'YOUR_SUPABASE_URL' && 
  supabaseAnonKey && 
  supabaseAnonKey !== 'YOUR_SUPABASE_ANON_KEY';

// --- SEED DATA DEFINITIONS ---
const defaultUsers = [
  {
    id: 1,
    name: 'Rajesh Kumar',
    email: 'owner@example.com',
    password_hash: 'password123', // plain for simple mock, real app hashes
    role: 'owner',
    age: 42,
    gender: 'male',
    occupation: 'Real Estate Developer',
    college_company: 'Kumar Properties',
    profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    bio: 'Property Owner managing student-friendly apartments in Indiranagar and Koramangala. Dedicated to providing safe, comfortable, and modern shared living experiences.',
    city: 'Bengaluru',
    preferred_area: 'Indiranagar',
    budget: 0,
    lifestyle_habits: JSON.stringify({}),
    roommate_prefs: JSON.stringify({}),
    is_verified: 1,
    is_banned: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Aanya Sharma',
    email: 'seeker1@example.com',
    password_hash: 'password123',
    role: 'seeker',
    age: 21,
    gender: 'female',
    occupation: 'Software Engineering Intern',
    college_company: 'Microsoft / RV College of Engineering',
    profile_pic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    bio: 'Hi! I am a final-year CS student starting my internship. I love exploring cafes, reading, and occasionally cooking. Looking for a neat roommate who values privacy but is down to hang out on weekends.',
    city: 'Bengaluru',
    preferred_area: 'Koramangala',
    budget: 12000,
    lifestyle_habits: JSON.stringify({
      sleep: 'early', // 'early' or 'night'
      cleanliness: 'high', // 'high', 'medium', 'low'
      smoking: 'no', // 'no', 'outside', 'yes'
      drinking: 'outside', // 'no', 'outside', 'yes'
      food: 'veg', // 'veg', 'non-veg', 'any'
      noise: 'low', // 'low', 'medium', 'high'
      guests: 'weekends', // 'no', 'weekends', 'anytime'
      work: 'day', // 'day', 'night', 'flexible'
      study: 'regular' // 'regular', 'flexible'
    }),
    roommate_prefs: JSON.stringify({
      gender: 'female',
      occupation: 'student_working',
      cleanliness: 'high',
      smoking: 'no',
      food: 'veg',
      sleep: 'early'
    }),
    is_verified: 1,
    is_banned: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Vikram Aditya',
    email: 'seeker2@example.com',
    password_hash: 'password123',
    role: 'seeker',
    age: 23,
    gender: 'male',
    occupation: 'Data Analyst',
    college_company: 'Deloitte',
    profile_pic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    bio: 'Working professional in tech. I sleep late, watch football, and keep my space tidy. I prefer a quiet atmosphere during weekdays but love hosting match screenings on weekends.',
    city: 'Bengaluru',
    preferred_area: 'Koramangala',
    budget: 15000,
    lifestyle_habits: JSON.stringify({
      sleep: 'night',
      cleanliness: 'medium',
      smoking: 'outside',
      drinking: 'yes',
      food: 'any',
      noise: 'medium',
      guests: 'weekends',
      work: 'day',
      study: 'flexible'
    }),
    roommate_prefs: JSON.stringify({
      gender: 'male',
      occupation: 'working',
      cleanliness: 'medium',
      smoking: 'outside',
      food: 'any',
      sleep: 'night'
    }),
    is_verified: 0,
    is_banned: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Priyanka Sen',
    email: 'finder1@example.com',
    password_hash: 'password123',
    role: 'finder',
    age: 22,
    gender: 'female',
    occupation: 'UI Designer',
    college_company: 'Razorpay / NIFT',
    profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    bio: 'Independent designer looking for a flatmate to rent a 2BHK together in HSR Layout or Koramangala. I have short-listed a couple of stunning apartments! Friendly, animal lover, and non-smoker.',
    city: 'Bengaluru',
    preferred_area: 'Koramangala',
    budget: 14000,
    lifestyle_habits: JSON.stringify({
      sleep: 'early',
      cleanliness: 'high',
      smoking: 'no',
      drinking: 'no',
      food: 'any',
      noise: 'low',
      guests: 'no',
      work: 'day',
      study: 'regular'
    }),
    roommate_prefs: JSON.stringify({
      gender: 'female',
      occupation: 'working',
      cleanliness: 'high',
      smoking: 'no',
      food: 'any',
      sleep: 'early'
    }),
    is_verified: 1,
    is_banned: 0,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Rohan Mehta',
    email: 'admin@example.com',
    password_hash: 'admin123',
    role: 'admin',
    age: 30,
    gender: 'male',
    occupation: 'Platform Administrator',
    college_company: 'Find Your Roommate Ltd',
    profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    bio: 'Main system administrator account. Verifying property listings and managing safety rules.',
    city: 'Bengaluru',
    preferred_area: 'Indiranagar',
    budget: 0,
    lifestyle_habits: JSON.stringify({}),
    roommate_prefs: JSON.stringify({}),
    is_verified: 1,
    is_banned: 0,
    created_at: new Date().toISOString()
  }
];

const defaultProperties = [
  {
    id: 1,
    owner_id: 1,
    title: 'Modern 2BHK Shared Apartment near Sony World Signal',
    type: 'Shared Apartment',
    rent: 24000,
    deposit: 60000,
    location: 'Koramangala 4th Block, Bengaluru',
    landmark: 'Opposite Sony World Signal, near Starbucks',
    description: 'Fully furnished 2BHK shared apartment. It features a spacious living room, modular kitchen, and high-speed fiber internet. Ideal for students and young IT professionals. One room is occupied by a friendly software engineer.',
    amenities: JSON.stringify(['WiFi', 'Parking', 'AC', 'Furnished', 'Kitchen', 'Laundry', 'Security']),
    available_from: '2026-06-15',
    rooms: 2,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600'
    ]),
    is_available: 1,
    views: 142,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    owner_id: 1,
    title: 'Independent Luxury Studio Room in Indiranagar',
    type: 'Independent Room',
    rent: 16000,
    deposit: 40000,
    location: 'Indiranagar 100 Feet Road, Bengaluru',
    landmark: 'Behind Toit Brewpub',
    description: 'Premium independent room with attached bath and private balcony. Super private and located right in the heart of Indiranagar. Extremely close to restaurants, gyms, and metro station.',
    amenities: JSON.stringify(['WiFi', 'AC', 'Furnished', 'Security']),
    available_from: '2026-07-01',
    rooms: 1,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=600',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=600'
    ]),
    is_available: 1,
    views: 89,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    owner_id: 1,
    title: 'Cozy PG Double Sharing Accommodation for Girls',
    type: 'PG',
    rent: 9000,
    deposit: 15000,
    location: 'Koramangala 7th Block, Bengaluru',
    landmark: 'Behind Jyoti Nivas College',
    description: 'Perfect PG for college girls. Safe environment with 24/7 security guard, CCTV, home-cooked food (3 meals included in rent), hot water, power backup, and housekeeping. Sharing room with another RV college student.',
    amenities: JSON.stringify(['WiFi', 'Furnished', 'Kitchen', 'Laundry', 'Security']),
    available_from: '2026-06-10',
    rooms: 6,
    photos: JSON.stringify([
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600'
    ]),
    is_available: 1,
    views: 231,
    created_at: new Date().toISOString()
  }
];

const defaultConnections = [
  { id: 1, sender_id: 2, receiver_id: 3, status: 'pending', created_at: new Date().toISOString() }
];

const defaultChats = [
  { id: 1, is_group: 0, created_at: new Date().toISOString() }
];

const defaultParticipants = [
  { id: 1, chat_id: 1, user_id: 2, created_at: new Date().toISOString() },
  { id: 2, chat_id: 1, user_id: 3, created_at: new Date().toISOString() }
];

const defaultMessages = [
  { id: 1, chat_id: 1, sender_id: 3, content: 'Hey, I saw we matched in Koramangala! Your profile looks cool. When are you looking to move?', is_read: 1, created_at: new Date(Date.now() - 3600000).toISOString() },
  { id: 2, chat_id: 1, sender_id: 2, content: 'Hey Vikram! Thanks. I am hoping to move in by mid-June, since my internship starts then. What about you?', is_read: 1, created_at: new Date(Date.now() - 1800000).toISOString() },
  { id: 3, chat_id: 1, sender_id: 3, content: 'Nice, same here! I work nearby Sony Signal, so I am hunting for a flat close to Sony Signal. Let me know if you want to team up and check out a 2BHK.', is_read: 0, created_at: new Date(Date.now() - 600000).toISOString() }
];

const defaultNotifications = [
  {
    id: 1,
    user_id: 2,
    title: 'Potential Roommate Found!',
    message: 'Vikram Aditya matches 86% of your lifestyle and budget preferences in Koramangala.',
    type: 'match',
    is_read: 0,
    metadata: JSON.stringify({ matchUserId: 3 }),
    created_at: new Date().toISOString()
  }
];

// --- MOCK DATABASE CLIENT IMPLEMENTATION ---
class MockDatabase {
  constructor() {
    this.initLocalStorage();
  }

  initLocalStorage() {
    if (!localStorage.getItem('fyr_users')) {
      localStorage.setItem('fyr_users', JSON.stringify(defaultUsers));
    }
    if (!localStorage.getItem('fyr_properties')) {
      localStorage.setItem('fyr_properties', JSON.stringify(defaultProperties));
    }
    if (!localStorage.getItem('fyr_connections')) {
      localStorage.setItem('fyr_connections', JSON.stringify(defaultConnections));
    }
    if (!localStorage.getItem('fyr_chats')) {
      localStorage.setItem('fyr_chats', JSON.stringify(defaultChats));
    }
    if (!localStorage.getItem('fyr_chat_participants')) {
      localStorage.setItem('fyr_chat_participants', JSON.stringify(defaultParticipants));
    }
    if (!localStorage.getItem('fyr_messages')) {
      localStorage.setItem('fyr_messages', JSON.stringify(defaultMessages));
    }
    if (!localStorage.getItem('fyr_notifications')) {
      localStorage.setItem('fyr_notifications', JSON.stringify(defaultNotifications));
    }
    if (!localStorage.getItem('fyr_wishlists')) {
      localStorage.setItem('fyr_wishlists', JSON.stringify([]));
    }
  }

  getTable(name) {
    this.initLocalStorage();
    return JSON.parse(localStorage.getItem(`fyr_${name}`) || '[]');
  }

  setTable(name, data) {
    localStorage.setItem(`fyr_${name}`, JSON.stringify(data));
  }
}

const mockDB = new MockDatabase();

class MockQueryBuilder {
  private tableName: string;
  private filters: Array<(row: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderAscending = true;
  private isSingle = false;
  private action: 'select' | 'insert' | 'update' | 'delete' = 'select';
  private insertData: any | null = null;
  private updateData: any | null = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(columns?: string) {
    this.action = 'select';
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  match(queryObj: Record<string, any>) {
    this.filters.push((row) => {
      for (const key in queryObj) {
        if (row[key] !== queryObj[key]) return false;
      }
      return true;
    });
    return this;
  }

  order(column: string, { ascending = true } = {}) {
    this.orderCol = column;
    this.orderAscending = ascending;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  maybeSingle() {
    this.isSingle = true;
    return this;
  }

  insert(data: any | any[]) {
    this.action = 'insert';
    this.insertData = data;
    return this;
  }

  update(data: any) {
    this.action = 'update';
    this.updateData = data;
    return this;
  }

  delete() {
    this.action = 'delete';
    return this;
  }

  private executeSelect() {
    let rows = mockDB.getTable(this.tableName);

    for (const filter of this.filters) {
      rows = rows.filter(filter);
    }

    if (this.orderCol) {
      rows.sort((a, b) => {
        const valA = a[this.orderCol!];
        const valB = b[this.orderCol!];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    if (this.isSingle) {
      return { data: rows[0] || null, error: null };
    }

    return { data: rows, error: null };
  }

  private executeInsert() {
    const rows = mockDB.getTable(this.tableName);
    const data = this.insertData;
    const inserts = Array.isArray(data) ? data : [data];
    let nextId = rows.length > 0 ? Math.max(...rows.map((r: any) => r.id || 0)) + 1 : 1;
    const insertedRecords: any[] = [];

    for (const item of inserts) {
      const record = {
        id: nextId++,
        created_at: new Date().toISOString(),
        ...item
      };
      rows.push(record);
      insertedRecords.push(record);
    }

    mockDB.setTable(this.tableName, rows);
    return { data: Array.isArray(data) ? insertedRecords : insertedRecords[0], error: null };
  }

  private executeUpdate() {
    let rows = mockDB.getTable(this.tableName);
    let updatedCount = 0;
    const updatedRows: any[] = [];

    rows = rows.map((row) => {
      let match = true;
      for (const filter of this.filters) {
        if (!filter(row)) {
          match = false;
          break;
        }
      }

      if (match) {
        updatedCount++;
        const newRow = { ...row, ...this.updateData };
        updatedRows.push(newRow);
        return newRow;
      }
      return row;
    });

    mockDB.setTable(this.tableName, rows);
    return { data: updatedRows, error: null, count: updatedCount };
  }

  private executeDelete() {
    let rows = mockDB.getTable(this.tableName);
    const initialLength = rows.length;

    rows = rows.filter((row) => {
      let match = true;
      for (const filter of this.filters) {
        if (!filter(row)) {
          match = false;
          break;
        }
      }
      return !match;
    });

    mockDB.setTable(this.tableName, rows);
    return { data: null, error: null, count: initialLength - rows.length };
  }

  private execute() {
    switch (this.action) {
      case 'insert': return this.executeInsert();
      case 'update': return this.executeUpdate();
      case 'delete': return this.executeDelete();
      default: return this.executeSelect();
    }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }
}

// Global active session state for mock auth
let mockActiveUser: any = null;

// Read active session from localStorage if present
try {
  const stored = localStorage.getItem('fyr_mock_session');
  if (stored) {
    mockActiveUser = JSON.parse(stored);
  }
} catch (e) {
  console.error(e);
}

const mockChannelListeners: Record<string, Array<(payload: any) => void>> = {};

const mockAuth = {
  signUp: async ({ email, password, options }: any) => {
    const users = mockDB.getTable('users');
    const existing = users.find((u) => u.email === email);
    if (existing) {
      return { data: { user: null }, error: new Error('User already exists') };
    }

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id || 0)) + 1 : 1,
      email,
      name: options?.data?.name || email.split('@')[0],
      role: options?.data?.role || 'seeker',
      password_hash: password, // simple storage for mock
      age: options?.data?.age || 20,
      gender: options?.data?.gender || 'other',
      occupation: options?.data?.occupation || '',
      college_company: options?.data?.college_company || '',
      profile_pic: options?.data?.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: options?.data?.bio || '',
      city: options?.data?.city || 'Bengaluru',
      preferred_area: options?.data?.preferred_area || '',
      budget: options?.data?.budget || 0,
      lifestyle_habits: JSON.stringify(options?.data?.lifestyle_habits || {}),
      roommate_prefs: JSON.stringify(options?.data?.roommate_prefs || {}),
      is_verified: options?.data?.role === 'owner' ? 0 : 1, // owners require admin verify, seekers/finders auto-verify in mock
      is_banned: 0,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    mockDB.setTable('users', users);

    // Auto login
    mockActiveUser = newUser;
    localStorage.setItem('fyr_mock_session', JSON.stringify(newUser));
    triggerAuthStateChange('SIGNED_IN', newUser);

    return { data: { user: newUser, session: { user: newUser } }, error: null };
  },

  signInWithPassword: async ({ email, password }: any) => {
    const users = mockDB.getTable('users');
    const user = users.find((u) => u.email === email && u.password_hash === password);
    if (!user) {
      return { data: { user: null }, error: new Error('Invalid email or password') };
    }

    if (user.is_banned) {
      return { data: { user: null }, error: new Error('This account has been banned by the administrator') };
    }

    mockActiveUser = user;
    localStorage.setItem('fyr_mock_session', JSON.stringify(user));
    triggerAuthStateChange('SIGNED_IN', user);

    return { data: { user, session: { user } }, error: null };
  },

  signOut: async () => {
    mockActiveUser = null;
    localStorage.removeItem('fyr_mock_session');
    triggerAuthStateChange('SIGNED_OUT', null);
    return { error: null };
  },

  getUser: async () => {
    // Refresh active user from DB in case profile was edited
    if (mockActiveUser) {
      const users = mockDB.getTable('users');
      const latest = users.find((u) => u.id === mockActiveUser.id);
      if (latest) {
        mockActiveUser = latest;
        localStorage.setItem('fyr_mock_session', JSON.stringify(latest));
      }
    }
    return { data: { user: mockActiveUser }, error: null };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    authListeners.push(callback);
    // Trigger initial state
    callback(mockActiveUser ? 'SIGNED_IN' : 'SIGNED_OUT', mockActiveUser ? { user: mockActiveUser } : null);
    return {
      data: {
        subscription: {
          unsubscribe: () => {
            const index = authListeners.indexOf(callback);
            if (index !== -1) authListeners.splice(index, 1);
          }
        }
      }
    };
  }
};

const authListeners: Array<(event: string, session: any) => void> = [];
function triggerAuthStateChange(event: string, user: any) {
  const session = user ? { user } : null;
  authListeners.forEach((listener) => {
    try {
      listener(event, session);
    } catch (e) {
      console.error(e);
    }
  });
}

// Real-time channel simulation
const mockChannel = (channelName: string) => {
  return {
    on: (type: string, filter: any, callback: (payload: any) => void) => {
      // For mock chats & messages
      if (!mockChannelListeners[channelName]) {
        mockChannelListeners[channelName] = [];
      }
      mockChannelListeners[channelName].push(callback);
      return mockChannel(channelName);
    },
    subscribe: (callback?: (status: string) => void) => {
      if (callback) callback('SUBSCRIBED');
      return {
        unsubscribe: () => {
          delete mockChannelListeners[channelName];
        }
      };
    },
    send: (payload: any) => {
      // Simulate socket broadcast
      const listeners = mockChannelListeners[channelName] || [];
      listeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (e) {
          console.error(e);
        }
      });
      // Also broadcast to general active notification listeners if it is a notification or message
      return { error: null };
    }
  };
};

// Mock Client Interface
const MockSupabaseClientInstance = {
  auth: mockAuth,
  from: (table: string) => new MockQueryBuilder(table),
  channel: mockChannel
};

// Exported client
export const supabase = isLiveSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (MockSupabaseClientInstance as any);

export const isUsingMock = !isLiveSupabaseConfigured;

// Clean utility to trigger simulated real-time messages & notifications
export const triggerSimulatedRealtimeMessage = (chatId: number, senderId: number, content: string) => {
  const messages = mockDB.getTable('messages');
  const newMessage = {
    id: messages.length > 0 ? Math.max(...messages.map((m) => m.id || 0)) + 1 : 1,
    chat_id: chatId,
    sender_id: senderId,
    content,
    is_read: 0,
    created_at: new Date().toISOString()
  };
  messages.push(newMessage);
  mockDB.setTable('messages', messages);

  // Broadcast
  const channelName = `chat:${chatId}`;
  if (mockChannelListeners[channelName]) {
    mockChannelListeners[channelName].forEach((cb) => {
      cb({
        eventType: 'INSERT',
        new: newMessage
      });
    });
  }

  // Also notify typing indicator clearing
  const typingChannel = `typing:${chatId}`;
  if (mockChannelListeners[typingChannel]) {
    mockChannelListeners[typingChannel].forEach((cb) => {
      cb({ typing: false, userId: senderId });
    });
  }

  // Send system-wide notification
  const participants = mockDB.getTable('chat_participants').filter((p) => p.chat_id === chatId);
  const users = mockDB.getTable('users');
  const senderName = users.find((u) => u.id === senderId)?.name || 'Someone';

  participants.forEach((p) => {
    if (p.user_id !== senderId) {
      triggerSimulatedNotification(
        p.user_id,
        'New Message',
        `${senderName}: ${content.substring(0, 40)}${content.length > 40 ? '...' : ''}`,
        'message',
        { chatId, senderId }
      );
    }
  });
};

export const triggerSimulatedNotification = (
  userId: number,
  title: string,
  message: string,
  type: string,
  metadata: any = {}
) => {
  const notifications = mockDB.getTable('notifications');
  const newNotif = {
    id: notifications.length > 0 ? Math.max(...notifications.map((n) => n.id || 0)) + 1 : 1,
    user_id: userId,
    title,
    message,
    type,
    is_read: 0,
    metadata: JSON.stringify(metadata),
    created_at: new Date().toISOString()
  };
  notifications.unshift(newNotif); // latest first
  mockDB.setTable('notifications', notifications);

  // Broadcast to user notifications channel
  const channelName = `notifications:${userId}`;
  if (mockChannelListeners[channelName]) {
    mockChannelListeners[channelName].forEach((cb) => {
      cb({
        eventType: 'INSERT',
        new: newNotif
      });
    });
  }
};
