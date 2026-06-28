import { GoogleGenerativeAI } from '@google/generative-ai';
import mongoose from 'mongoose';

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

const callGeminiAPI = async (prompt: string, modelName: string = 'gemini-2.5-flash'): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}) as any) as any;
    throw new Error(
      `Gemini API Error [${res.status}]: ${errorJson.error?.message || res.statusText}`
    );
  }

  const data = await res.json() as any;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Empty response from Gemini API');
  }
  return text;
};

export const generateRecommendation = async (
  products: ProductData[],
  userPreferences: UserPreferences
): Promise<AIProductRecommendation[]> => {
  try {

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

    const text = await callGeminiAPI(prompt);

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

    const text = await callGeminiAPI(prompt);

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

export interface WebComparisonResult {
  products: {
    _id: string;
    name: string;
    brand: string;
    processor: string;
    gpu: string;
    ram: string;
    storage: string;
    displaySize: string;
    battery: string;
    weight: string;
    price: number;
    os: string;
    benchmarkScore: number;
    rating: number;
    reviewCount: number;
    images: string[];
    specs: Record<string, any>;
  }[];
  highlights: {
    bestValue: string;
    bestPerformance: string;
    bestBattery: string;
    mostPortable: string;
  };
  analysis: {
    category: string;
    winner: string;
    details: string;
  }[];
}

export const generateWebComparison = async (
  productQueries: string[],
  requirements: string
): Promise<WebComparisonResult> => {
  try {

    const prompt = `Search the web and find accurate, up-to-date specifications for the following products:
${productQueries.join(', ')}

Analyze them side-by-side. Additionally, consider the following user requirements and priorities:
Requirements: ${requirements || 'None specified'}

Provide your response in the following JSON format. Return ONLY the JSON object. Do not include markdown code blocks or any extra text.

{
  "products": [
    {
      "name": "exact full product name and model",
      "brand": "brand name",
      "price": 85000,
      "processor": "processor model (e.g. Intel Core i7-1355U)",
      "gpu": "graphics card (e.g. Intel Iris Xe or NVIDIA RTX 4050)",
      "ram": "amount and type (e.g. 16GB LPDDR5)",
      "storage": "storage size and type (e.g. 512GB NVMe SSD)",
      "displaySize": "display size and characteristics (e.g. 14 inch OLED 120Hz)",
      "battery": "battery capacity (e.g. 70 Wh)",
      "weight": "weight (e.g. 1.35 kg)",
      "os": "operating system",
      "benchmarkScore": 8500,
      "rating": 4.5,
      "reviewCount": 120
    }
  ],
  "highlights": {
    "bestValue": "exact name of the product offering the best performance/features per rupee",
    "bestPerformance": "exact name of the product with highest raw performance",
    "bestBattery": "exact name of the product with longest battery life",
    "mostPortable": "exact name of the product that is lightest and easiest to carry"
  },
  "analysis": [
    {
      "category": "Performance",
      "winner": "exact name of the winning product in this category",
      "details": "2-3 sentences explaining why it won and how the others compare"
    },
    {
      "category": "Battery",
      "winner": "exact name of the winning product in this category",
      "details": "2-3 sentences explaining why it won and how the others compare"
    },
    {
      "category": "Portability",
      "winner": "exact name of the winning product in this category",
      "details": "2-3 sentences explaining why it won and how the others compare"
    },
    {
      "category": "Display",
      "winner": "exact name of the winning product in this category",
      "details": "2-3 sentences explaining why it won and how the others compare"
    },
    {
      "category": "Value",
      "winner": "exact name of the winning product in this category",
      "details": "2-3 sentences explaining why it won and how the others compare"
    }
  ]
}

IMPORTANT: Search the web to find accurate, real details for these models. If a specific model year isn't specified, use the latest model year.`;

    const text = await callGeminiAPI(prompt);

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

    const parsed = JSON.parse(cleanedText);

    // Map AI names to generated MongoDB ObjectIds to align with the frontend expectations
    const productsWithIds = (parsed.products || []).map((p: any) => {
      const id = new mongoose.Types.ObjectId().toString();
      return {
        _id: id,
        name: p.name,
        brand: p.brand || 'Unknown',
        processor: p.processor || 'Unknown',
        gpu: p.gpu || 'Unknown',
        ram: p.ram || 'Unknown',
        storage: p.storage || 'Unknown',
        displaySize: p.displaySize || 'Unknown',
        battery: p.battery || 'Unknown',
        weight: p.weight || 'Unknown',
        price: p.price || 0,
        os: p.os || 'Unknown',
        benchmarkScore: p.benchmarkScore || 5000,
        rating: p.rating || 4.0,
        reviewCount: p.reviewCount || 10,
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
        specs: {}
      };
    });

    const findProductIdByName = (name: string): string => {
      if (!name || productsWithIds.length === 0) return '';
      const target = name.toLowerCase().trim();
      const exact = productsWithIds.find((p: any) => p.name.toLowerCase().trim() === target);
      if (exact) return exact._id;

      const partial = productsWithIds.find((p: any) => {
        const pName = p.name.toLowerCase().trim();
        return pName.includes(target) || target.includes(pName);
      });
      if (partial) return partial._id;

      const firstWord = target.split(' ')[0];
      const brandMatch = productsWithIds.find((p: any) => p.name.toLowerCase().trim().startsWith(firstWord));
      if (brandMatch) return brandMatch._id;

      return productsWithIds[0]._id;
    };

    const mappedHighlights = {
      bestValue: findProductIdByName(parsed.highlights?.bestValue),
      bestPerformance: findProductIdByName(parsed.highlights?.bestPerformance),
      bestBattery: findProductIdByName(parsed.highlights?.bestBattery),
      mostPortable: findProductIdByName(parsed.highlights?.mostPortable)
    };

    return {
      products: productsWithIds,
      highlights: mappedHighlights,
      analysis: parsed.analysis || []
    };
  } catch (error) {
    const err = error as Error;
    console.error('AI Web Comparison Service Error:', err.message);

    // Fallback comparison with ObjectIds
    const productsWithIds = productQueries.map((q) => {
      const id = new mongoose.Types.ObjectId().toString();
      return {
        _id: id,
        name: q,
        brand: q.split(' ')[0] || 'Generic',
        processor: 'Intel Core i7 / Apple M3',
        gpu: 'Integrated Graphics',
        ram: '16GB LPDDR5',
        storage: '512GB SSD',
        displaySize: '14" IPS',
        battery: '60 Wh',
        weight: '1.4 kg',
        price: 85000,
        os: 'Windows / macOS',
        benchmarkScore: 8000,
        rating: 4.5,
        reviewCount: 42,
        images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
        specs: {}
      };
    });

    return {
      products: productsWithIds,
      highlights: {
        bestValue: productsWithIds[0]._id,
        bestPerformance: productsWithIds[0]._id,
        bestBattery: productsWithIds[0]._id,
        mostPortable: productsWithIds[0]._id
      },
      analysis: [
        {
          category: 'Performance',
          winner: productsWithIds[0].name,
          details: 'Basic performance comparison. Set GEMINI_API_KEY for a real live search.'
        }
      ]
    };
  }
};

export interface DynamicRecommendationResult {
  aiSummary: string;
  strengths: string[];
  weaknesses: string[];
  product: any;
  scores: {
    performance: number;
    battery: number;
    portability: number;
    value: number;
  };
  alternatives: any[];
}

export const generateDynamicRecommendation = async (
  userPreferences: UserPreferences
): Promise<DynamicRecommendationResult> => {
  try {

    const prompt = `You are an AI tech advisor. Search the web and find the top 3 best laptops that fit the following user preferences:
- Budget: ${userPreferences.budget ? `₹${userPreferences.budget.toLocaleString('en-IN')}` : 'Not specified'}
- Purpose: ${userPreferences.purpose || 'General use'}
- Priorities: ${userPreferences.priorities?.join(', ') || 'Not specified'}

Identify the single best laptop as the winner, and return 2 other laptops as alternatives.

Provide your response in the following JSON format. Return ONLY the JSON object. Do not include markdown code blocks or extra text.

{
  "aiSummary": "A detailed 3-4 sentence explanation of why the winner was chosen for this user.",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2"],
  "product": {
    "name": "exact winner product name",
    "brand": "brand name",
    "price": 85000,
    "processor": "processor model",
    "gpu": "graphics card",
    "ram": "16GB LPDDR5",
    "storage": "512GB SSD",
    "displaySize": "14 inch OLED",
    "battery": "70 Wh",
    "weight": "1.35 kg",
    "os": "Windows / macOS",
    "benchmarkScore": 8500,
    "rating": 4.5,
    "reviewCount": 120
  },
  "scores": {
    "performance": 85,
    "battery": 75,
    "portability": 80,
    "value": 90
  },
  "alternatives": [
    {
      "name": "alternative product name 1",
      "brand": "brand name",
      "price": 75000,
      "processor": "processor model",
      "gpu": "graphics card",
      "ram": "16GB LPDDR5",
      "storage": "512GB SSD",
      "displaySize": "15.6 inch IPS",
      "battery": "60 Wh",
      "weight": "1.7 kg",
      "os": "Windows",
      "benchmarkScore": 7500,
      "rating": 4.2,
      "reviewCount": 90
    }
  ]
}

IMPORTANT: Search the web to find accurate, real details for these models.`;

    const text = await callGeminiAPI(prompt);

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

    const parsed = JSON.parse(cleanedText);

    // Map fields and generate IDs
    const mapProduct = (p: any) => ({
      _id: new mongoose.Types.ObjectId().toString(),
      name: p.name,
      brand: p.brand || 'Generic',
      processor: p.processor || 'Unknown',
      gpu: p.gpu || 'Unknown',
      ram: p.ram || 'Unknown',
      storage: p.storage || 'Unknown',
      displaySize: p.displaySize || 'Unknown',
      battery: p.battery || 'Unknown',
      weight: p.weight || 'Unknown',
      price: p.price || 0,
      os: p.os || 'Unknown',
      benchmarkScore: p.benchmarkScore || 5000,
      rating: p.rating || 4.2,
      reviewCount: p.reviewCount || 50,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
      specs: {}
    });

    return {
      aiSummary: parsed.aiSummary || 'No summary available.',
      strengths: parsed.strengths || [],
      weaknesses: parsed.weaknesses || [],
      product: mapProduct(parsed.product),
      scores: {
        performance: clampScore(parsed.scores?.performance),
        battery: clampScore(parsed.scores?.battery),
        portability: clampScore(parsed.scores?.portability),
        value: clampScore(parsed.scores?.value)
      },
      alternatives: (parsed.alternatives || []).map(mapProduct)
    };
  } catch (error) {
    const err = error as Error;
    console.error('AI Recommendation Service Error:', err.message);

    // Fallback recommendation
    const winner = {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'HP Victus 15',
      brand: 'HP',
      processor: 'Intel Core i5-12450H',
      gpu: 'RTX 3050',
      ram: '16GB',
      storage: '512GB SSD',
      displaySize: '15.6"',
      battery: '52.5 Wh',
      weight: '2.3 kg',
      price: 62990,
      os: 'Windows 11',
      benchmarkScore: 8200,
      rating: 4.2,
      reviewCount: 342,
      images: ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800'],
      specs: {}
    };

    return {
      aiSummary: 'A solid all-rounder budget gaming and study laptop offering excellent price-to-performance ratio.',
      strengths: ['Great dedicated GPU for gaming', 'Decent screen refresh rate'],
      weaknesses: ['Slightly heavy at 2.3kg', 'Average battery life'],
      product: winner,
      scores: {
        performance: 75,
        battery: 60,
        portability: 50,
        value: 85
      },
      alternatives: []
    };
  }
};

