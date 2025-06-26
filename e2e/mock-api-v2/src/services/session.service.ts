import { Effect } from 'effect';
import { nanoid } from 'nanoid';

export type SessionData = {
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  data?: Record<string, unknown>;
};

export interface SessionStorageApi {
  createSession: (data: SessionData) => Effect.Effect<string, Error, never>;
  getSession: (sessionId: string) => Effect.Effect<SessionData | null, Error, never>;
  deleteSession: (sessionId: string) => Effect.Effect<void, Error, never>;
  updateSession: (sessionId: string, data: SessionData) => Effect.Effect<void, Error, never>;
  refreshSession: (sessionId: string, expiryDate?: Date) => Effect.Effect<void, Error, never>;
  isSessionExpired: (sessionData: SessionData) => boolean;
  cleanupExpiredSessions: () => Effect.Effect<void, never, never>;
}

export class SessionStorage extends Effect.Service<SessionStorage>()('SessionStorage', {
  sync: () => {
    // In-memory session store
    const _store = new Map<string, SessionData>();

    // Check if a session is expired
    const isSessionExpired = (sessionData: SessionData): boolean => {
      const now = new Date();
      return sessionData.expiresAt < now;
    };

    return {
      createSession: (data: SessionData) => {
        const sessionId = nanoid();
        _store.set(sessionId, data);
        return Effect.succeed(data);
      },

      getSession: Effect.fn(function* (sessionId: string) {
        const session = _store.get(sessionId);

        if (!session) {
          return null;
        }

        // Check if session is expired
        if (isSessionExpired(session)) {
          _store.delete(sessionId);
          return null;
        }

        return session;
      }),

      deleteSession: Effect.fn(function* (sessionId: string) {
        _store.delete(sessionId);
        return undefined;
      }),

      updateSession: Effect.fn(function* (sessionId: string, data: SessionData) {
        if (!_store.has(sessionId)) {
          return new Error('Session not found');
        }
        _store.set(sessionId, data);
        return data;
      }),

      refreshSession: Effect.fn(function* (sessionId: string, expiryDate?: Date) {
        const session = _store.get(sessionId);

        if (!session) {
          return Effect.fail(new Error('Session not found'));
        }

        if (isSessionExpired(session)) {
          _store.delete(sessionId);
          return new Error('Session has expired');
        }

        // Update expiry date
        const newExpiryDate = expiryDate || new Date(Date.now() + 24 * 60 * 60 * 1000); // Default: 24 hours from now
        session.expiresAt = newExpiryDate;
        _store.set(sessionId, session);

        return session.data;
      }),

      isSessionExpired,

      cleanupExpiredSessions: Effect.fn(function* () {
        for (const [sessionId, session] of _store.entries()) {
          if (isSessionExpired(session)) {
            _store.delete(sessionId);
          }
        }
        return undefined;
      }),
    };
  },
}) {}
