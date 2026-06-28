import { GoogleGenerativeAI } from '@google/generative-ai';

interface ProductData {
  name: string;
  brand: string;
  processor: string;
  gpu: string;
  ram: string;
  storage: string;
  display: string;
  battery: string;
  weight: string;
  price: number;
  os: string;
  benchmarkScore: number;
  rating: number;
}

interface UserPreferences {
  budget?: number;
  purpose?: string;
  priorities?: string[];
}

export interface AIRecommendation {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendation: string;
  scores: {
    performance: number;
    battery: number;
    portability: number;
    gaming: number;
    value: number;
  };
  overallScore: number;
}

export interface AIProductRecommendation {
  productName: string;
  recommendation: AIRecommendation;
}

const getGenAI = (): GoogleGenerativeAI => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  return new GoogleGenerativeAI(apiKey);
};

export const generateRecommendation = async (
  products: ProductData[],
  userPreferences: UserPreferences
): Promise<AIProductRecommendation[]> => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const productDescriptions = products
      .map(
        (p, i) =>
          `Product ${i + 1}: ${p.name}
  - Brand: ${p.brand}
  - Processor: ${p.processor}
  - GPU: ${p.gpu}
  - RAM: ${p.ram}
  - Storage: ${p.storage}
  - Display: ${p.display}
  - Battery: ${p.battery}
  - Weight: ${p.weight}
  - Price: ₹${p.price.toLocaleString('en-IN')}
  - OS: ${p.os}
  - Benchmark Score: ${p.benchmarkScore}
  - User Rating: ${p.rating}/5`
      )
      .join('\n\n');

    const prompt = `You are a tech expert analyzing laptops for a buyer. Analyze the following products against the user's requirements and provide a detailed recommendation.

USER REQUIREMENTS:
- Budget: ${userPreferences.budget ? `₹${userPreferences.budget.toLocaleString('en-IN')}` : 'Not specified'}
- Purpose: ${userPreferences.purpose || 'General use'}
- Priorities: ${userPreferences.priorities?.join(', ') || 'Not specified'}

PRODUCTS TO ANALYZE:
${productDescriptions}

For EACH product, provide your analysis in the following JSON format. Return a JSON array with one object per product:

[
  {
    "productName": "exact product name",
    "recommendation": {
      "summary": "2-3 sentence overall assessment of this product for the user's needs",
      "strengths": ["strength 1", "strength 2", "strength 3"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "recommendation": "1-2 sentence specific recommendation about whether to buy this product",
      "scores": {
        "performance": <0-100>,
        "battery": <0-100>,
        "portability": <0-100>,
        "gaming": <0-100>,
        "value": <0-100>
      },
      "overallScore": <0-100>
    }
  }
]

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks. Scores should be integers from 0-100 based on realistic assessment.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean the response - remove markdown code blocks if present
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const parsed: AIProductRecommendation[] = JSON.parse(cleanedText);

    // Validate and clamp scores
    return parsed.map((item) => ({
      productName: item.productName,
      recommendation: {
        summary: item.recommendation.summary || 'No summary available',
        strengths: item.recommendation.strengths || [],
        weaknesses: item.recommendation.weaknesses || [],
        recommendation: item.recommendation.recommendation || 'No recommendation available',
        scores: {
          performance: clampScore(item.recommendation.scores?.performance),
          battery: clampScore(item.recommendation.scores?.battery),
          portability: clampScore(item.recommendation.scores?.portability),
          gaming: clampScore(item.recommendation.scores?.gaming),
          value: clampScore(item.recommendation.scores?.value),
        },
        overallScore: clampScore(item.recommendation.overallScore),
      },
    }));
  } catch (error) {
    const err = error as Error;
    console.error('AI Service Error:', err.message);

    // Return fallback scores if AI fails
    return products.map((p) => ({
      productName: p.name,
      recommendation: {
        summary: `${p.name} is a ${p.brand} laptop with ${p.processor} processor and ${p.ram} RAM, priced at ₹${p.price.toLocaleString('en-IN')}.`,
        strengths: ['Specifications available for comparison'],
        weaknesses: ['AI analysis temporarily unavailable'],
        recommendation: 'Please try again later for a detailed AI recommendation.',
        scores: {
          performance: estimateScore(p.benchmarkScore, 3000, 15000),
          battery: 50,
          portability: 50,
          gaming: p.gpu.toLowerCase().includes('rtx') ? 70 : 30,
          value: estimateValueScore(p.price, p.benchmarkScore),
        },
        overallScore: 50,
      },
    }));
  }
};

function clampScore(score: number | undefined): number {
  if (score === undefined || score === null || isNaN(score)) return 50;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function estimateScore(value: number, min: number, max: number): number {
  const normalized = (value - min) / (max - min);
  return Math.max(0, Math.min(100, Math.round(normalized * 100)));
}

function estimateValueScore(price: number, benchmark: number): number {
  if (price === 0) return 0;
  const ratio = benchmark / price;
  return Math.max(0, Math.min(100, Math.round(ratio * 5000)));
}

export interface AIComparisonAnalysis {
  category: string;
  winner: string;
  details: string;
}

export const generateComparisonAnalysis = async (
  products: ProductData[]
): Promise<AIComparisonAnalysis[]> => {
  try {
    const genAI = getGenAI();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const productDescriptions = products
      .map(
        (p, i) =>
          `Product ${i + 1}: ${p.name}
  - Brand: ${p.brand}
  - Processor: ${p.processor}
  - GPU: ${p.gpu}
  - RAM: ${p.ram}
  - Storage: ${p.storage}
  - Display: ${p.display}
  - Battery: ${p.battery}
  - Weight: ${p.weight}
  - Price: ₹${p.price.toLocaleString('en-IN')}
  - OS: ${p.os}
  - Benchmark Score: ${p.benchmarkScore}
  - User Rating: ${p.rating}/5`
      )
      .join('\n\n');

    const prompt = `You are a tech expert comparing these laptops side-by-side. Analyze their specifications (Performance, Battery, Portability, Display, Value) and determine a winner and detailed comparison for each category.
    
PRODUCTS TO ANALYZE:
${productDescriptions}

Provide your analysis in the following JSON format. Return a JSON array with one object per category (Performance, Battery, Portability, Display, Value):

[
  {
    "category": "Performance",
    "winner": "exact name of the winning product",
    "details": "2-3 sentences explaining why it won and how it compares to the others"
  }
]

IMPORTANT: Return ONLY valid JSON, no markdown formatting or code blocks.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith('```')) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    const parsed: AIComparisonAnalysis[] = JSON.parse(cleanedText);
    return parsed;
  } catch (error) {
    const err = error as Error;
    console.error('AI Comparison Service Error:', err.message);

    // Fallback comparison
    return [
      {
        category: 'Performance',
        winner: products.reduce((prev, current) => (prev.benchmarkScore > current.benchmarkScore ? prev : current)).name,
        details: 'Selected based on benchmark score comparison.',
      },
      {
        category: 'Value',
        winner: products.reduce((prev, current) => ((prev.benchmarkScore / prev.price) > (current.benchmarkScore / current.price) ? prev : current)).name,
        details: 'Selected based on benchmark score per price ratio.',
      }
    ];
  }
};

