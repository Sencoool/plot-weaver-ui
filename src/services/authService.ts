import api from './api';

/**
 * Revokes every token issued to the current user — this one included.
 *
 * The API stamps `User.tokensValidFrom` with the current time, and JwtStrategy
 * rejects anything issued before it, so this is the only way to kill a session
 * that is already out there. Call it before clearing the local token, since the
 * request needs the bearer header.
 */
export async function logoutEverywhere(): Promise<void> {
  await api.post('/auth/logout-all');
}
