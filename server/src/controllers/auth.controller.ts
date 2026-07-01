import { Response } from 'express';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { isDbOffline, mockUsers } from '../config/mockDb';

const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallback-secret';
  const expire = process.env.JWT_EXPIRE || '7d';
  return jwt.sign({ id: userId }, secret, { expiresIn: expire as any });
};

// POST /api/auth/signup
export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { name, email, password } = req.body;

    if (isDbOffline()) {
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        res.status(409).json({ success: false, message: 'Email already registered.' });
        return;
      }

      const mockUser = {
        _id: 'mock-user-' + Math.random().toString(36).substring(2, 11),
        name,
        email,
        password,
        role: 'user',
        avatar: '',
        savedProducts: [],
        savedComparisons: [],
        searchHistory: [],
        createdAt: new Date(),
        comparePassword: async function(pass: string) {
          return this.password === pass;
        }
      };
      mockUsers.push(mockUser);

      const token = generateToken(mockUser._id);
      res.status(201).json({
        success: true,
        token,
        user: {
          id: mockUser._id,
          name: mockUser.name,
          email: mockUser.email,
          role: mockUser.role,
          avatar: mockUser.avatar,
        },
      });
      return;
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'Email already registered.' });
      return;
    }

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ success: false, errors: errors.array() });
      return;
    }

    const { email, password } = req.body;

    if (isDbOffline()) {
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      const token = generateToken(user._id);
      res.status(200).json({
        success: true,
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      });
      return;
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    if (!user.password) {
      res.status(401).json({
        success: false,
        message: 'This account uses Google login. Please sign in with Google.',
      });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    if (isDbOffline()) {
      const user = mockUsers.find(u => u._id === req.user?._id.toString());
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      res.status(200).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          savedProducts: [],
          savedComparisons: [],
          searchHistory: [],
          createdAt: user.createdAt,
        },
      });
      return;
    }

    const user = await User.findById(req.user._id)
      .populate('savedProducts')
      .populate('savedComparisons');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        savedProducts: user.savedProducts,
        savedComparisons: user.savedComparisons,
        searchHistory: user.searchHistory,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/forgot-password
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ success: false, message: 'Email is required.' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether user exists
      res.status(200).json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
      return;
    }

    // TODO: Implement email sending with reset token
    // For now, return success placeholder
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/google-login
export const googleLogin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!googleId || !email) {
      res.status(400).json({ success: false, message: 'Google ID and email are required.' });
      return;
    }

    // Find user by googleId or email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // Update googleId if not set
      if (!user.googleId) {
        user.googleId = googleId;
        if (avatar && !user.avatar) user.avatar = avatar;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: avatar || '',
      });
    }

    const token = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
