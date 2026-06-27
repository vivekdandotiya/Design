import { Response } from 'express';
import Product from '../models/Product';
import Comparison from '../models/Comparison';
import User from '../models/User';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

// GET /api/admin/analytics
export const getAnalytics = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Most compared products
    const mostCompared = await Comparison.aggregate([
      { $unwind: '$products' },
      { $group: { _id: '$products', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$product.name',
          brand: '$product.brand',
          compareCount: '$count',
        },
      },
    ]);

    // Most saved products
    const mostSaved = await User.aggregate([
      { $unwind: '$savedProducts' },
      { $group: { _id: '$savedProducts', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$product.name',
          brand: '$product.brand',
          saveCount: '$count',
        },
      },
    ]);

    // Search trends
    const searchTrends = await User.aggregate([
      { $unwind: '$searchHistory' },
      { $group: { _id: '$searchHistory', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          term: '$_id',
          count: 1,
        },
      },
    ]);

    // Popular brands
    const popularBrands = await Product.aggregate([
      { $group: { _id: '$brand', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          brand: '$_id',
          productCount: '$count',
          avgRating: { $round: ['$avgRating', 1] },
        },
      },
    ]);

    // Most reviewed products
    const mostReviewed = await Review.aggregate([
      { $group: { _id: '$product', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          _id: 0,
          productId: '$_id',
          name: '$product.name',
          brand: '$product.brand',
          reviewCount: '$count',
          avgRating: { $round: ['$avgRating', 1] },
        },
      },
    ]);

    // General stats
    const [totalProducts, totalUsers, totalComparisons, totalReviews] =
      await Promise.all([
        Product.countDocuments(),
        User.countDocuments(),
        Comparison.countDocuments(),
        Review.countDocuments(),
      ]);

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalProducts,
          totalUsers,
          totalComparisons,
          totalReviews,
        },
        mostCompared,
        mostSaved,
        mostReviewed,
        searchTrends,
        popularBrands,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
