import { Request, Response } from 'express';
import Product from '../models/Product';
import Comparison from '../models/Comparison';
import { AuthRequest } from '../middleware/auth';
import { generateComparisonAnalysis } from '../services/ai.service';

interface CompareHighlight {
  bestValue: string;
  bestPerformance: string;
  bestBattery: string;
  mostPortable: string;
}

// POST /api/compare
export const compareProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productIds, productQueries, requirements } = req.body;

    if (productQueries && Array.isArray(productQueries)) {
      if (productQueries.length < 2) {
        res.status(400).json({
          success: false,
          message: 'At least 2 products are required for comparison.',
        });
        return;
      }

      if (productQueries.length > 4) {
        res.status(400).json({
          success: false,
          message: 'Maximum 4 products can be compared at once.',
        });
        return;
      }

      const result = await generateWebComparison(productQueries, requirements);

      // Save comparison if user is authenticated
      const authReq = req as AuthRequest;
      if (authReq.user) {
        await Comparison.create({
          user: authReq.user._id,
        });
      }

      res.status(200).json({
        success: true,
        data: result,
      });
      return;
    }

    if (!productIds || !Array.isArray(productIds)) {
      res.status(400).json({
        success: false,
        message: 'productIds or productQueries must be provided.',
      });
      return;
    }

    const products = await Product.find({ _id: { $in: productIds } });

    if (products.length !== productIds.length) {
      res.status(404).json({
        success: false,
        message: 'One or more products not found.',
      });
      return;
    }

    // Determine highlights
    const highlights: CompareHighlight = {
      bestValue: '',
      bestPerformance: '',
      bestBattery: '',
      mostPortable: '',
    };

    // Best value: highest benchmark per rupee
    let bestValueRatio = 0;
    products.forEach((p) => {
      const ratio = p.price > 0 ? p.benchmarkScore / p.price : 0;
      if (ratio > bestValueRatio) {
        bestValueRatio = ratio;
        highlights.bestValue = p._id.toString();
      }
    });

    // Best performance: highest benchmark
    let bestBenchmark = 0;
    products.forEach((p) => {
      if (p.benchmarkScore > bestBenchmark) {
        bestBenchmark = p.benchmarkScore;
        highlights.bestPerformance = p._id.toString();
      }
    });

    // Best battery: parse battery string for highest Wh
    let bestBatteryWh = 0;
    products.forEach((p) => {
      const whMatch = p.battery.match(/(\d+)\s*Wh/i);
      if (whMatch) {
        const wh = parseInt(whMatch[1]);
        if (wh > bestBatteryWh) {
          bestBatteryWh = wh;
          highlights.bestBattery = p._id.toString();
        }
      }
    });

    // Best portability: lightest weight
    let lightestWeight = Infinity;
    products.forEach((p) => {
      const weightMatch = p.weight.match(/([\d.]+)\s*kg/i);
      if (weightMatch) {
        const weight = parseFloat(weightMatch[1]);
        if (weight < lightestWeight) {
          lightestWeight = weight;
          highlights.mostPortable = p._id.toString();
        }
      }
    });

    // Build comparison data
    const comparisonData = products.map((p) => ({
      _id: p._id,
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
      images: p.images,
      benchmarkScore: p.benchmarkScore,
      rating: p.rating,
      reviewCount: p.reviewCount,
      specs: p.specs,
    }));

    // Generate AI side-by-side comparison analysis
    const analysis = await generateComparisonAnalysis(products);

    // Save comparison if user is authenticated
    const authReq = req as AuthRequest;
    if (authReq.user) {
      await Comparison.create({
        user: authReq.user._id,
        products: productIds,
      });
    }

    res.status(200).json({
      success: true,
      data: {
        products: comparisonData,
        highlights,
        analysis,
        comparedAt: new Date(),
      },
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};

