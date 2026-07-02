import { Response } from 'express';
import User from '../models/User';
import Product from '../models/Product';
import Comparison from '../models/Comparison';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';
import { isDbOffline } from '../config/mockDb';

// PUT /api/users/profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const allowedFields = ['name', 'avatar'];
    const updates: Record<string, any> = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ success: false, message: 'No valid fields to update.' });
      return;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    });

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
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/users/save-product/:productId
export const saveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { productId } = req.params;

    if (isDbOffline()) {
      const mockUser = req.user as any;
      mockUser.savedProducts = mockUser.savedProducts || [];
      const alreadySaved = mockUser.savedProducts.some(
        (id: any) => id.toString() === productId
      );

      if (alreadySaved) {
        res.status(409).json({ success: false, message: 'Product already saved.' });
        return;
      }

      mockUser.savedProducts.push(productId);
      res.status(200).json({
        success: true,
        message: 'Product saved successfully.',
        savedProducts: mockUser.savedProducts,
      });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    // Check if already saved
    const alreadySaved = user.savedProducts.some(
      (id) => id.toString() === productId
    );

    if (alreadySaved) {
      res.status(409).json({ success: false, message: 'Product already saved.' });
      return;
    }

    user.savedProducts.push(product._id);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product saved successfully.',
      savedProducts: user.savedProducts,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/users/unsave-product/:productId
export const unsaveProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { productId } = req.params;

    if (isDbOffline()) {
      req.user.savedProducts = req.user.savedProducts || [];
      const index = req.user.savedProducts.findIndex(
        (id) => id.toString() === productId
      );

      if (index === -1) {
        res.status(404).json({ success: false, message: 'Product not in saved list.' });
        return;
      }

      req.user.savedProducts.splice(index, 1);
      res.status(200).json({
        success: true,
        message: 'Product removed from saved list.',
        savedProducts: req.user.savedProducts,
      });
      return;
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    const index = user.savedProducts.findIndex(
      (id) => id.toString() === productId
    );

    if (index === -1) {
      res.status(404).json({ success: false, message: 'Product not in saved list.' });
      return;
    }

    user.savedProducts.splice(index, 1);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from saved list.',
      savedProducts: user.savedProducts,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/saved-products
export const getSavedProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    if (isDbOffline()) {
      res.status(200).json({
        success: true,
        data: [],
      });
      return;
    }

    const user = await User.findById(req.user._id).populate('savedProducts');

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.savedProducts,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/search-history
export const getSearchHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: user.searchHistory,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/users/dashboard
export const getDashboardStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const userId = req.user._id;

    if (isDbOffline()) {
      const savedCount = req.user.savedProducts?.length || 0;
      const recentComparisons = req.user.savedComparisons || [];
      const comparisonsCount = recentComparisons.length;
      
      res.status(200).json({
        success: true,
        data: {
          savedProducts: savedCount,
          totalComparisons: comparisonsCount,
          totalReviews: 0,
          recentComparisons: recentComparisons,
        },
      });
      return;
    }

    const [savedCount, comparisonsCount, reviewsCount, recentComparisons] =
      await Promise.all([
        User.findById(userId).then((u) => u?.savedProducts?.length || 0),
        Comparison.countDocuments({ user: userId }),
        Review.countDocuments({ user: userId }),
        Comparison.find({ user: userId })
          .populate('products', 'name brand price images')
          .sort({ createdAt: -1 })
          .limit(5),
      ]);

    res.status(200).json({
      success: true,
      data: {
        savedProducts: savedCount,
        totalComparisons: comparisonsCount,
        totalReviews: reviewsCount,
        recentComparisons,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
