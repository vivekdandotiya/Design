import { Request, Response } from 'express';
import { generateDynamicRecommendation } from '../services/ai.service';

// POST /api/recommend
export const getRecommendation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { budget, purpose, priorities, category } = req.body;

    const userPreferences = {
      budget: budget ? parseInt(budget) : undefined,
      purpose: purpose || undefined,
      priorities: priorities || undefined,
      category: category || undefined,
    };

    const recommendationResult = await generateDynamicRecommendation(userPreferences);

    res.status(200).json({
      success: true,
      data: recommendationResult,
    });
  } catch (error) {
    const err = error as Error;
    res.status(500).json({ success: false, message: err.message });
  }
};
