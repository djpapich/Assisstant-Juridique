import { NextFunction, Request, Response } from 'express';
import { securityConfig } from '../config/security';

// Store blocked IPs and their incident counts
const blockedIPs = new Map<string, { incidents: number; lastSeen: number }>();
const maxIncidents = 5; // Max incidents before blocking

export const ipBlocker = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip;
  const now = Date.now();
  const timeout = 1000 * 60 * 60; // 1 hour timeout

  // Check if IP is already blocked
  if (blockedIPs.has(ip)) {
    const { incidents, lastSeen } = blockedIPs.get(ip);
    if (now - lastSeen < timeout) {
      return res.status(403).json({ error: 'Forbidden - IP is blocked' });
    }
  }

  // Update incident count
  blockedIPs.set(ip, {
    incidents: (blockedIPs.get(ip)?.incidents || 0) + 1,
    lastSeen: now
  });

  // Block IP if incident limit is reached
  if (blockedIPs.get(ip)?.incidents >= maxIncidents) {
    return res.status(403).json({ error: 'Forbidden - Too many incidents' });
  }

  next();
};