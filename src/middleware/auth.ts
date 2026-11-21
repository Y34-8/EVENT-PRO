import { NextFunction, Request, Response } from 'express';
import { eq } from 'drizzle-orm';
import { adminAuth } from '../lib/firebase-admin.ts';
import { verifySessionToken } from '../lib/auth-crypto.ts';
import { db } from '../db/index.ts';
import { roles, users } from '../db/schema.ts';

export interface AuthenticatedDbUser {
  id: number;
  uid: string;
  email: string;
  fullName: string;
  phone: string;
  city: string;
  role: string;
  isActive: boolean;
}

export interface AuthRequest extends Request {
  dbUser?: AuthenticatedDbUser;
}

const DEFAULT_ADMIN_EMAIL = 'y.benfarah.studies@gmail.com';

export function isConfiguredAdminEmail(email: string): boolean {
  const configured = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL)
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return configured.includes(email.trim().toLowerCase());
}

async function resolveRoleId(roleName: string): Promise<number | null> {
  const existing = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  if (existing.length > 0) return existing[0].id;
  const inserted = await db
    .insert(roles)
    .values({
      name: roleName,
      description: roleName === 'admin' ? 'Administrateur plateforme' : 'Client EVENT PRO',
    })
    .onConflictDoNothing()
    .returning();
  if (inserted.length > 0) return inserted[0].id;
  const refetch = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
  return refetch[0]?.id ?? null;
}

export async function syncFirebaseUserToDb(
  uid: string,
  email: string,
  displayName?: string
): Promise<AuthenticatedDbUser> {
  const normalizedEmail = email.trim().toLowerCase();
  const shouldBeAdmin = isConfiguredAdminEmail(normalizedEmail);

  const existingByUid = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
  if (existingByUid.length > 0) {
    const u = existingByUid[0];
    const nextRole = shouldBeAdmin ? 'admin' : u.role;
    if (nextRole !== u.role || u.email !== normalizedEmail) {
      const roleId = await resolveRoleId(nextRole);
      const updated = await db
        .update(users)
        .set({
          email: normalizedEmail,
          role: nextRole,
          roleId,
          updatedAt: new Date(),
        })
        .where(eq(users.id, u.id))
        .returning();
      const row = updated[0];
      return {
        id: row.id,
        uid: row.uid,
        email: row.email,
        fullName: row.fullName,
        phone: row.phone,
        city: row.city,
        role: row.role,
        isActive: row.isActive,
      };
    }
    return {
      id: u.id,
      uid: u.uid,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      city: u.city,
      role: u.role,
      isActive: u.isActive,
    };
  }

  const existingByEmail = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (existingByEmail.length > 0) {
    const u = existingByEmail[0];
    const nextRole = shouldBeAdmin ? 'admin' : u.role;
    const roleId = await resolveRoleId(nextRole);
    const updated = await db
      .update(users)
      .set({
        uid,
        role: nextRole,
        roleId,
        updatedAt: new Date(),
      })
      .where(eq(users.id, u.id))
      .returning();
    const row = updated[0];
    return {
      id: row.id,
      uid: row.uid,
      email: row.email,
      fullName: row.fullName,
      phone: row.phone,
      city: row.city,
      role: row.role,
      isActive: row.isActive,
    };
  }

  const assignedRole = shouldBeAdmin ? 'admin' : 'client';
  const roleId = await resolveRoleId(assignedRole);
  const result = await db
    .insert(users)
    .values({
      uid,
      email: normalizedEmail,
      fullName: displayName?.trim() || normalizedEmail.split('@')[0],
      phone: '',
      city: 'Casablanca',
      role: assignedRole,
      roleId,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: users.uid,
      set: {
        email: normalizedEmail,
        updatedAt: new Date(),
      },
    })
    .returning();

  const row = result[0];
  return {
    id: row.id,
    uid: row.uid,
    email: row.email,
    fullName: row.fullName,
    phone: row.phone,
    city: row.city,
    role: row.role,
    isActive: row.isActive,
  };
}

async function resolveTokenUser(token: string): Promise<AuthenticatedDbUser | null> {
  // 1. Try server-signed HMAC session token (email/password accounts)
  const sessionPayload = verifySessionToken(token);
  if (sessionPayload) {
    const rows = await db
      .select()
      .from(users)
      .where(eq(users.id, sessionPayload.userId))
      .limit(1);
    if (rows.length === 0) return null;
    const u = rows[0];
    if (u.uid !== sessionPayload.uid) return null;
    return {
      id: u.id,
      uid: u.uid,
      email: u.email,
      fullName: u.fullName,
      phone: u.phone,
      city: u.city,
      role: u.role,
      isActive: u.isActive,
    };
  }

  // 2. Try Firebase ID token (Google Sign-In)
  const decoded = await adminAuth.verifyIdToken(token);
  if (!decoded.email) return null;
  return syncFirebaseUserToDb(decoded.uid, decoded.email, decoded.name);
}

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return next();
  try {
    const user = await resolveTokenUser(token);
    if (user && user.isActive) {
      req.dbUser = user;
    }
  } catch {
    // Ignore invalid optional token
  }
  return next();
};

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) {
    return res.status(401).json({ error: 'Jeton d\'authentification manquant.' });
  }

  try {
    const user = await resolveTokenUser(token);
    if (!user) {
      return res.status(401).json({ error: 'Session invalide ou expirée.' });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: 'Ce compte a été désactivé par l\'administration.' });
    }
    req.dbUser = user;
    return next();
  } catch (err) {
    console.error('Auth verification error:', err);
    return res.status(401).json({ error: 'Session invalide ou expirée.' });
  }
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (!req.dbUser) {
    return res.status(401).json({ error: 'Authentification requise.' });
  }
  if (req.dbUser.role !== 'admin') {
    return res.status(403).json({ error: 'Accès réservé aux administrateurs EVENT PRO.' });
  }
  return next();
};
