import type { UserProfile } from './aiMatching';

export type LookingFor = 'room_only' | 'roommate_only' | 'room_roommate';

const AUTH_VIEWS = new Set(['login', 'signup', 'login-user', 'login-owner']);
const PUBLIC_VIEWS = new Set(['landing', 'properties', 'property-details', ...AUTH_VIEWS]);

export function parseRoommatePrefs(user: UserProfile | null | undefined): Record<string, any> {
  if (!user?.roommate_prefs) return {};
  try {
    if (typeof user.roommate_prefs === 'object') {
      return user.roommate_prefs as Record<string, any>;
    }
    return JSON.parse(user.roommate_prefs || '{}');
  } catch {
    return {};
  }
}

export function getLookingFor(user: UserProfile | null | undefined): LookingFor | null {
  const prefs = parseRoommatePrefs(user);
  const value = prefs.looking_for;
  if (value === 'room_only' || value === 'roommate_only' || value === 'room_roommate') {
    return value;
  }
  if (user?.role === 'finder') return 'roommate_only';
  return null;
}

export function isOwnerAccount(user: UserProfile | null | undefined): boolean {
  return !!user && (user.account_type === 'owner' || user.role === 'owner');
}

export function isUserAccount(user: UserProfile | null | undefined): boolean {
  if (!user || user.role === 'admin') return false;
  if (user.account_type === 'user') return true;
  return false;
}

export function isOwnerOnboardingComplete(user: UserProfile | null | undefined): boolean {
  if (!user || !isOwnerAccount(user)) return false;
  // Legacy seeded owners already have city/role and should skip the new form.
  if (user.role === 'owner' && user.city && !user.phone) return true;
  return Boolean(user.phone && user.city);
}

export function getUserDashboardView(user: UserProfile | null | undefined): string {
  const lookingFor = getLookingFor(user);
  if (lookingFor === 'roommate_only') return 'roommates';
  if (lookingFor === 'room_only' || lookingFor === 'room_roommate') return 'dashboard-seeker';
  return 'role-selection';
}

export function resolveHomeView(user: UserProfile | null | undefined): string {
  if (!user) return 'landing';
  if (user.role === 'admin') return 'admin';

  if (isOwnerAccount(user)) {
    return isOwnerOnboardingComplete(user) ? 'dashboard-owner' : 'owner-onboarding';
  }

  if (isUserAccount(user)) {
    return getLookingFor(user) ? getUserDashboardView(user) : 'role-selection';
  }

  return 'account-type';
}

export function isViewAllowed(user: UserProfile | null | undefined, view: string): boolean {
  if (!user) return PUBLIC_VIEWS.has(view);

  if (user.role === 'admin') {
    return view === 'admin' || view === 'landing' || view === 'profile';
  }

  if (isOwnerAccount(user)) {
    if (view === 'role-selection' || view === 'account-type' || view === 'roommates') {
      return false;
    }
    if (view === 'owner-onboarding') {
      return !isOwnerOnboardingComplete(user);
    }
    if (view === 'dashboard-seeker') return false;
    return true;
  }

  if (isUserAccount(user)) {
    if (view === 'dashboard-owner' || view === 'owner-onboarding') return false;
    if (view === 'account-type') return false;
    return true;
  }

  // Logged in, but account type not chosen yet
  return view === 'account-type' || AUTH_VIEWS.has(view) || view === 'landing';
}
