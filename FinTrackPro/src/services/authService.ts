import * as LocalAuthentication from 'expo-local-authentication';
import { storage } from '@/storage/storage';
import { CurrencySymbol, User } from '@/types';
import { uid } from '@/utils/finance';

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashPassword(password: string): string {
  // Note: this is a simple obfuscation, NOT real cryptography. For production,
  // use bcrypt server-side. On-device, we rely on SecureStore + biometrics.
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const ch = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash |= 0;
  }
  return `h_${Math.abs(hash).toString(36)}_${password.length}`;
}

function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export const authService = {
  async signUp(name: string, email: string, password: string): Promise<User> {
    const users = await storage.getUsers();
    if (users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error('An account with this email already exists.');
    }
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters.');
    }
    const user: User = {
      id: uid(),
      name,
      email,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      currency: '$' as CurrencySymbol,
      symbol: '$',
      theme: 'system',
      biometricsEnabled: false,
    };
    await storage.setUsers([...users, user]);
    await this.startSession(user);
    return user;
  },

  async signIn(email: string, password: string): Promise<User> {
    const users = await storage.getUsers();
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || !verifyPassword(password, user.password)) {
      throw new Error('Invalid email or password.');
    }
    await this.startSession(user);
    return user;
  },

  async startSession(user: User) {
    const token = `${user.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const expiry = new Date(Date.now() + SESSION_DURATION_MS).toISOString();
    await storage.setUser(user);
    await storage.setToken(token);
    await storage.setSessionExpiry(expiry);
  },

  async endSession() {
    await storage.setUser(null);
    await storage.setToken(null);
    await storage.setSessionExpiry(null);
  },

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const users = await storage.getUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx < 0) throw new Error('Account not found.');
    const user = users[idx];
    if (!verifyPassword(oldPassword, user.password)) {
      throw new Error('Current password is incorrect.');
    }
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters.');
    }
    const updated = { ...user, password: hashPassword(newPassword) };
    users[idx] = updated;
    await storage.setUsers(users);
    const current = await storage.getUser();
    if (current?.id === userId) await storage.setUser(updated);
  },

  async getCurrentUser(): Promise<User | null> {
    const user = await storage.getUser();
    const expiry = await storage.getSessionExpiry();
    if (!user || !expiry) return null;
    if (new Date(expiry).getTime() < Date.now()) {
      await this.endSession();
      return null;
    }
    return user;
  },

  async updateProfile(updates: Partial<Pick<User, 'name' | 'avatar' | 'password'>>): Promise<User> {
    const current = await storage.getUser();
    if (!current) throw new Error('Not signed in.');
    const users = await storage.getUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx < 0) throw new Error('User not found.');
    const updated: User = {
      ...current,
      ...updates,
      password: updates.password ? hashPassword(updates.password) : current.password,
    };
    users[idx] = updated;
    await storage.setUsers(users);
    await storage.setUser(updated);
    return updated;
  },

  async deleteAccount(): Promise<void> {
    const current = await storage.getUser();
    if (!current) return;
    const users = (await storage.getUsers()).filter((u) => u.id !== current.id);
    await storage.setUsers(users);
    await storage.wipe();
  },

  async authenticateWithBiometrics(
    opts: { promptMessage?: string; cancelLabel?: string } = {},
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      if (!hasHardware) return { success: false, error: 'no_hardware' };
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      if (!enrolled) return { success: false, error: 'not_enrolled' };
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: opts.promptMessage || 'Unlock FinTrack Pro',
        cancelLabel: opts.cancelLabel || 'Cancel',
        fallbackLabel: 'Use passcode',
        disableDeviceFallback: false,
      });
      return { success: !!result.success, error: result.success ? undefined : (result as any)?.error || 'failed' };
    } catch (err) {
      return { success: false, error: (err as Error)?.message || 'failed' };
    }
  },

  async isBiometricsAvailable(): Promise<{ available: boolean; enrolled: boolean; type?: LocalAuthentication.AuthenticationType }> {
    try {
      const available = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      return {
        available,
        enrolled,
        type: types[0],
      };
    } catch {
      return { available: false, enrolled: false };
    }
  },

  /**
   * Returns whether the *current user* has biometric lock enabled.
   * Reads from the User object (single source of truth).
   * Falls back to the legacy AsyncStorage key for users created before
   * biometricsEnabled was added to the User shape.
   */
  async getBiometricsEnabled(): Promise<boolean> {
    const u = await storage.getUser();
    if (u && typeof (u as User).biometricsEnabled === 'boolean') {
      return (u as User).biometricsEnabled as boolean;
    }
    return storage.getBiometricsEnabled();
  },

  /**
   * Persist the biometric-lock preference on the User record.
   * Updates both the users index and the current-user pointer.
   * No-op if no user is signed in.
   */
  async setBiometricsEnabled(enabled: boolean): Promise<User | null> {
    const current = await storage.getUser();
    if (!current) return null;
    const users = await storage.getUsers();
    const idx = users.findIndex((u) => u.id === current.id);
    if (idx < 0) return null;
    const updated: User = { ...users[idx], biometricsEnabled: enabled };
    users[idx] = updated;
    await storage.setUsers(users);
    if ((await storage.getUser())?.id === current.id) {
      await storage.setUser(updated);
    }
    // Keep the legacy AsyncStorage key in sync as a cache so old code paths
    // that still read it see the same answer.
    await storage.setBiometricsEnabled(enabled);
    return updated;
  },
};