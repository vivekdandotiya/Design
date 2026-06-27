import { Request, Response } from 'express';
import Product from '../models/Product';
import Review from '../models/Review';
import { AuthRequest } from '../middleware/auth';

// GET /api/products
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Build filter
    const filter: Record<string, any> = {};

    if (req.query.brand) {
      filter.brand = { $regex: new RegExp(req.query.brand as string, 'i') };
    }
    if (req.query.processor) {
      filter.processor = { $regex: new RegExp(req.query.processor as string, 'i') };
    }
    if (req.query.gpu) {
      filter.gpu = { $regex: new RegExp(req.query.gpu as string, 'i') };
    }
    if (req.query.ram) {
      filter.ram = { $regex: new RegExp(req.query.ram as string, 'i') };
    }
    if (req.query.category) {
      filter.category = req.query.category;
    }

    // Price range filter
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = parseInt(req.query.minPrice as string);
      if (req.query.maxPrice) filter.price.$lte = parseInt(req.query.maxPrice as string);
    }

    // Build sort
    let sort: Record<string, 1 | -1> = { createdAt: -1 };
    if (req.query.sort) {
      const sortField = req.query.sort as string;
      if (sortField === 'price_asc') sort = { price: 1 };
      else if (sortField === 'price_desc') sort = { price: -1 };
      else if (sortField === 'rating') sort = { rating: -1 };
      else if (sortField === 'name') sort = { name: 1 };
      else if (sortField === 'benchmark') sort = { benchmarkScore: -1 };
      else if (sortField === 'newest') sort = { createdAt: -1 };
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: products,
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

// GET /api/products/search
export const searchProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';

    if (!query.trim()) {
      res.status(400).json({ success: false, message: 'Search query is required.' });
      return;
    }

    // Text search
    const products = await Product.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(20);

    // If no text search results, fallback to regex search
    let results = products;
    if (results.length === 0) {
      results = await Product.find({
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { brand: { $regex: new RegExp(query, 'i') } },
          { processor: { $regex: new RegExp(query, 'i') } },
          { gpu: { $regex: new RegExp(query, 'i') } },
        ],
      }).limit(20);
    }

    // Generate suggestions from results
    const suggestions = [
      ...new Set(results.map((p) => p.name).slice(0, 5)),
    ];

    res.status(200).json({
      success: true,
      data: results,
      suggestions,
      total: results.length,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/products/:id
export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json({
      success: true,
      data: {
        ...product.toObject(),
        reviews,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/products (admin)
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/products/:id (admin)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/products/:id (admin)
export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found.' });
      return;
    }

    // Clean up reviews for this product
    await Review.deleteMany({ product: product._id });

    res.status(200).json({
      success: true,
      message: 'Product deleted successfully.',
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
