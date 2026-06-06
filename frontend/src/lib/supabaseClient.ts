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


// --- MOCK DATABASE CLIENT IMPLEMENTATION ---
class MockDatabase {
  constructor() {
    this.initLocalStorage();
  }

  initLocalStorage() {
    const DB_VERSION = '2';
    if (localStorage.getItem('fyr_db_version') !== DB_VERSION) {
      const sessionBackup = localStorage.getItem('fyr_mock_session');
      const keys = Object.keys(localStorage).filter(k => k.startsWith('fyr_'));
      keys.forEach(k => localStorage.removeItem(k));
      localStorage.setItem('fyr_db_version', DB_VERSION);
      if (sessionBackup) {
        localStorage.setItem('fyr_mock_session', sessionBackup);
      }
    }
    if (!localStorage.getItem('fyr_users')) {
      localStorage.setItem('fyr_users', JSON.stringify([]));
    }
    if (!localStorage.getItem('fyr_properties')) {
      localStorage.setItem('fyr_properties', JSON.stringify([]));
    }
    if (!localStorage.getItem('fyr_connections')) {
      localStorage.setItem('fyr_connections', JSON.stringify([]));
    }
    if (!localStorage.getItem('fyr_chats')) {
      localStorage.setItem('fyr_chats', JSON.stringify([]));
    }
    if (!localStorage.getItem('fyr_chat_participants')) {
      localStorage.setItem('fyr_chat_participants', JSON.stringify([]));
    }
    if (!localStorage.getItem('fyr_messages')) {
      localStorage.setItem('fyr_messages', JSON.stringify([]));
    }
    if (!localStorage.getItem('fyr_notifications')) {
      localStorage.setItem('fyr_notifications', JSON.stringify([]));
    }
    if (!localStorage.getItem('fyr_wishlists')) {
      localStorage.setItem('fyr_wishlists', JSON.stringify([]));
    }
  }

  getTable(name) {
    this.initLocalStorage();
    try {
      return JSON.parse(localStorage.getItem(`fyr_${name}`) || '[]');
    } catch {
      console.error(`Corrupted localStorage data for fyr_${name}, resetting.`);
      localStorage.setItem(`fyr_${name}`, '[]');
      return [];
    }
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

  in(column: string, values: any[]) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  or(filterString: string) {
    const conditions = filterString.split(',');
    this.filters.push((row) => {
      return conditions.some(cond => {
        const [field, op, ...valParts] = cond.split('.');
        const value = valParts.join('.');
        if (op === 'eq') return String(row[field]) === value;
        return false;
      });
    });
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((row) => String(row[column]) === String(value));
    return this;
  }

  match(queryObj: Record<string, any>) {
    this.filters.push((row) => {
      for (const key in queryObj) {
        if (String(row[key]) !== String(queryObj[key])) return false;
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
      if (rows.length === 0) {
        return { data: null, error: null };
      }
      if (rows.length > 1) {
        return { data: null, error: new Error('Multiple or no rows returned for single() query') };
      }
      return { data: rows[0], error: null };
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

  catch(onrejected?: (reason: any) => any) {
    return Promise.resolve(this.execute()).catch(onrejected);
  }

  finally(onfinally?: (() => void) | undefined | null) {
    return Promise.resolve(this.execute()).finally(onfinally!);
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
    const normalizedEmail = email.toLowerCase();
    const existing = users.find((u) => u.email === normalizedEmail);
    if (existing) {
      return { data: { user: null }, error: new Error('User already exists') };
    }

    const stringifyIfObj = (val: any) =>
      typeof val === 'string' ? val : JSON.stringify(val || {});

    const newUser = {
      id: users.length > 0 ? Math.max(...users.map((u) => u.id || 0)) + 1 : 1,
      email: normalizedEmail,
      name: options?.data?.name || normalizedEmail.split('@')[0],
      role: options?.data?.role || 'seeker',
      password_hash: password,
      age: options?.data?.age || 20,
      gender: options?.data?.gender || 'other',
      occupation: options?.data?.occupation || '',
      college_company: options?.data?.college_company || '',
      profile_pic: options?.data?.profile_pic || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      bio: options?.data?.bio || '',
      city: options?.data?.city || 'Bengaluru',
      preferred_area: options?.data?.preferred_area || '',
      budget: options?.data?.budget || 0,
      lifestyle_habits: stringifyIfObj(options?.data?.lifestyle_habits),
      roommate_prefs: stringifyIfObj(options?.data?.roommate_prefs),
      is_verified: options?.data?.role === 'owner' ? 0 : 1,
      is_banned: 0,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    mockDB.setTable('users', users);

    mockActiveUser = newUser;
    const { password_hash, ...safeUser } = newUser;
    localStorage.setItem('fyr_mock_session', JSON.stringify(safeUser));
    triggerAuthStateChange('SIGNED_IN', safeUser);

    return { data: { user: safeUser, session: { user: safeUser } }, error: null };
  },

  signInWithPassword: async ({ email, password }: any) => {
    const users = mockDB.getTable('users');
    const user = users.find((u) => u.email === email.toLowerCase() && u.password_hash === password);
    if (!user) {
      return { data: { user: null }, error: new Error('Invalid email or password') };
    }

    if (user.is_banned) {
      return { data: { user: null }, error: new Error('This account has been banned by the administrator') };
    }

    mockActiveUser = user;
    const { password_hash, ...safeUser } = user;
    localStorage.setItem('fyr_mock_session', JSON.stringify(safeUser));
    triggerAuthStateChange('SIGNED_IN', safeUser);

    return { data: { user: safeUser, session: { user: safeUser } }, error: null };
  },

  signOut: async () => {
    mockActiveUser = null;
    localStorage.removeItem('fyr_mock_session');
    triggerAuthStateChange('SIGNED_OUT', null);
    return { error: null };
  },

  getUser: async () => {
    if (mockActiveUser) {
      const users = mockDB.getTable('users');
      const latest = users.find((u) => u.id === mockActiveUser.id);
      if (latest) {
        const { password_hash, ...safeUser } = latest;
        mockActiveUser = safeUser;
        localStorage.setItem('fyr_mock_session', JSON.stringify(safeUser));
      } else {
        mockActiveUser = null;
        localStorage.removeItem('fyr_mock_session');
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
