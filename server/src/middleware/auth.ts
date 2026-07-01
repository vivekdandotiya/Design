import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { isDbOffline, mockUsers } from '../config/mockDb';

// Extend Express Request
export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token format.',
      });
      return;
    }

    const secret = process.env.JWT_SECRET || 'fallback-secret';
    const decoded = jwt.verify(token, secret) as JwtPayload;

    let user;
    if (isDbOffline()) {
      user = mockUsers.find(u => u._id === decoded.id);
    } else {
      user = await User.findById(decoded.id);
    }

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists.',
      });
      return;
    }

    req.user = user as any;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: 'Invalid token.',
      });
      return;
    }
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: 'Token has expired.',
      });
      return;
    }
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
    });
  }
};

export const adminOnly = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // First run auth
    await new Promise<void>((resolve, reject) => {
      auth(req, res, (err?: any) => {
        if (err) return reject(err);
        resolve();
      });
    });

    // Check if response was already sent (auth failed)
    if (res.headersSent) return;

    if (!req.user || req.user.role !== 'admin') {
      res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.',
      });
      return;
    }

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error.',
    });
  }
};
