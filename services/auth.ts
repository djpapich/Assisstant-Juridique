import { NextFunction, Request, Response } from 'express';
import { sign, verify } from 'jsonwebtoken';
import { securityConfig } from '../config/security';

export const generateToken = (payload: object) => {
  return sign(payload, securityConfig.jwt.secret, {
    expiresIn: securityConfig.jwt.expires
  });
};

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Please authenticate.' });
  }

  verify(token, securityConfig.jwt.secret, (err: any, decoded: any) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};