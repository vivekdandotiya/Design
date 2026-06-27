import { Request, Response } from 'express';
import Product from '../models/Product';
import { generateRecommendation } from '../services/ai.service';

// POST /api/recommend
export const getRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { budget, purpose, priorities, productIds } = req.body;

    if (!budget && !purpose && (!productIds || productIds.length === 0)) {
      res.status(400).json({
        success: false,
        message: 'Please provide at least a budget, purpose, or product IDs.',
      });
      return;
    }

    let products;

    if (productIds && Array.isArray(productIds) && productIds.length > 0) {
      // Get specific products
      products = await Product.find({ _id: { $in: productIds } });
    } else {
      // Find products matching criteria
      const filter: Record<string, any> = {};

      if (budget) {
        // Show products within 20% above and below budget
        filter.price = {
          $gte: Math.floor(budget * 0.8),
          $lte: Math.ceil(budget * 1.2),
        };
      }

      products = await Product.find(filter)
        .sort({ rating: -1, benchmarkScore: -1 })
        .limit(5);
    }

    if (!products || products.length === 0) {
      res.status(404).json({
        success: false,
        message: 'No products found matching your criteria.',
      });
      return;
    }

    const productData = products.map((p) => ({
      name: p.name,
      brand: p.brand,
      processor: p.processor,
      gpu: p.gpu,
      ram: p.ram,
      storage: p.storage,
      display: p.display,
      battery: p.battery,
      weight: p.weight,
      price: p.price,
      os: p.os,
      benchmarkScore: p.benchmarkScore,
      rating: p.rating,
    }));

    const userPreferences = {
      budget: budget || undefined,
      purpose: purpose || undefined,
      priorities: priorities || undefined,
    };

    const recommendations = await generateRecommendation(productData, userPreferences);

    res.status(200).json({
      success: true,
      data: {
        products: products.map((p) => p.toObject()),
        recommendations,
        userPreferences,
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
