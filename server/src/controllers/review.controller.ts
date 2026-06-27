import { Response } from 'express';
import Review from '../models/Review';
import Product from '../models/Product';
import { AuthRequest } from '../middleware/auth';
import { Request } from 'express';

// Helper to recalculate product rating
const recalculateProductRating = async (productId: string): Promise<void> => {
  const stats = await Review.aggregate([
    { $match: { product: { $toObjectId: productId } } },
    {
      $group: {
        _id: '$product',
        avgRating: { $avg: '$rating' },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0,
    });
  }
};

// GET /api/reviews/product/:productId
export const getProductReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const [reviews, total] = await Promise.all([
      Review.find({ product: productId })
        .populate('user', 'name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Review.countDocuments({ product: productId }),
    ]);

    res.status(200).json({
      success: true,
      data: reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/reviews
export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const { product, rating, pros, cons, opinion } = req.body;

    if (!product || !rating) {
      res.status(400).json({ success: false, message: 'Product and rating are required.' });
      return;
    }

    // Check product exists
    const productDoc = await Product.findById(product);
    if (!productDoc) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Check for existing review
    const existingReview = await Review.findOne({
      user: req.user._id,
      product,
    });

    if (existingReview) {
      res.status(409).json({
        success: false,
        message: 'You have already reviewed this product. Use PUT to update.',
      });
      return;
    }

    const review = await Review.create({
      user: req.user._id,
      product,
      rating,
      pros: pros || '',
      cons: cons || '',
      opinion: opinion || '',
    });

    await recalculateProductRating(product);

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(201).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/reviews/:id
export const updateReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    if (review.user.toString() !== req.user._id.toString()) {
      res.status(403).json({ success: false, message: 'Not authorized to update this review.' });
      return;
    }

    const { rating, pros, cons, opinion } = req.body;

    if (rating !== undefined) review.rating = rating;
    if (pros !== undefined) review.pros = pros;
    if (cons !== undefined) review.cons = cons;
    if (opinion !== undefined) review.opinion = opinion;

    await review.save();
    await recalculateProductRating(review.product.toString());

    const populated = await Review.findById(review._id).populate('user', 'name avatar');

    res.status(200).json({
      success: true,
      data: populated,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/reviews/:id
export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated.' });
      return;
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      res.status(404).json({ success: false, message: 'Review not found.' });
      return;
    }

    // Allow review owner or admin to delete
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Not authorized to delete this review.' });
      return;
    }

    const productId = review.product.toString();
    await Review.findByIdAndDelete(req.params.id);
    await recalculateProductRating(productId);

    res.status(200).json({
      success: true,
      message: 'Review deleted successfully.',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
