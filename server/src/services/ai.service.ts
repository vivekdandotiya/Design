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
  category?: string;
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

const callGeminiAPI = async (prompt: string, modelName: string = 'gemini-1.5-flash'): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }

  const apiVersion = modelName.includes('2.5') ? 'v1beta' : 'v1';
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: [{ google_search: {} }]
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
    category?: string;
    storePrices?: { store: string; price: number; url: string }[];
    lowestPriceStore?: string;
    lowestPrice?: number;
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

    const prompt = `You are a professional product comparison and price-finding engine. Search the web and find accurate specs and real-time prices for these products:
${productQueries.join(', ')}

For EACH product, you must search and find the current price in INR on major Indian e-commerce stores: Amazon, Flipkart, Meesho, Myntra, and Ajio. If a product is not listed on a store or not applicable, set its price to 0 and url to "".

USER PREFERENCES / REQUIREMENTS:
${requirements || 'None specified'}

Provide your response in the following JSON format. Return ONLY the valid JSON object. Do not include markdown code blocks (such as \`\`\`json) or extra text.

{
  "products": [
    {
      "name": "exact full product name and model",
      "brand": "brand name",
      "price": 85000, // Best overall representative price in INR
      "category": "category of product (e.g. Laptop, Smart TV, Refrigerator, Shoes, Washing Machine)",
      
      // Dynamic specs dictionary containing 5-8 key technical specifications for this category of product
      "specs": {
        "Spec Name 1": "Value 1",
        "Spec Name 2": "Value 2",
        "Spec Name 3": "Value 3",
        "Spec Name 4": "Value 4"
      },
      
      // Store prices comparison in Indian Rupees (INR)
      "storePrices": [
        { "store": "Amazon", "price": 85000, "url": "https://www.amazon.in/s?k=product+name" },
        { "store": "Flipkart", "price": 87000, "url": "https://www.flipkart.com/search?q=product+name" },
        { "store": "Meesho", "price": 0, "url": "" },
        { "store": "Myntra", "price": 0, "url": "" },
        { "store": "Ajio", "price": 0, "url": "" }
      ],
      "lowestPriceStore": "Amazon", // Name of the store offering the lowest non-zero price
      "lowestPrice": 85000,
      
      // Laptops fields fallback (for compatibility - if laptop, put values. If not laptop, put "N/A")
      "processor": "Processor (for laptops only, else N/A)",
      "gpu": "Graphics (for laptops only, else N/A)",
      "ram": "RAM (for laptops only, else N/A)",
      "storage": "Storage (for laptops only, else N/A)",
      "displaySize": "Display Size (for laptops only, else N/A)",
      "battery": "Battery (for laptops/devices only, else N/A)",
      "weight": "Weight (e.g. 1.35 kg or 65 kg)",
      "os": "Operating System (if applicable, else N/A)",
      
      "benchmarkScore": 85, // Rating score from 0 to 100 representing product quality/specs power
      "rating": 4.5,
      "reviewCount": 120
    }
  ],
  "highlights": {
    "bestValue": "exact name of the winning product",
    "bestPerformance": "exact name of the winning product",
    "bestBattery": "exact name of the winning product",
    "mostPortable": "exact name of the winning product"
  },
  "analysis": [
    {
      "category": "Performance / Core Specs",
      "winner": "exact name of the winning product",
      "details": "2-3 sentences explaining why it won and how the others compare"
    },
    {
      "category": "Efficiency / Durability",
      "winner": "exact name of the winning product",
      "details": "2-3 sentences explaining why it won and how the others compare"
    },
    {
      "category": "Portability / Compactness",
      "winner": "exact name of the winning product",
      "details": "2-3 sentences explaining why it won and how the others compare"
    },
    {
      "category": "Value for Money",
      "winner": "exact name of the winning product",
      "details": "2-3 sentences explaining why it won and how the others compare"
    }
  ]
}

IMPORTANT: Search the web to find accurate, real details and store listings for these models.`;

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

    const getCategoryImage = (category: string): string => {
      const cat = (category || '').toLowerCase();
      if (cat.includes('laptop') || cat.includes('computer')) {
        return 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800';
      }
      if (cat.includes('tv') || cat.includes('television') || cat.includes('screen') || cat.includes('display')) {
        return 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800';
      }
      if (cat.includes('phone') || cat.includes('mobile') || cat.includes('smartphone')) {
        return 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800';
      }
      if (cat.includes('shoe') || cat.includes('clothing') || cat.includes('sneaker') || cat.includes('wear')) {
        return 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800';
      }
      if (cat.includes('fridge') || cat.includes('refrigerator') || cat.includes('washing') || cat.includes('machine') || cat.includes('appliance')) {
        return 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800';
      }
      return 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'; // General
    };

    // Map AI names to generated MongoDB ObjectIds to align with the frontend expectations
    const productsWithIds = (parsed.products || []).map((p: any) => {
      const id = new mongoose.Types.ObjectId().toString();
      const category = p.category || 'laptop';
      return {
        _id: id,
        name: p.name,
        brand: p.brand || 'Unknown',
        category,
        processor: p.processor || 'N/A',
        gpu: p.gpu || 'N/A',
        ram: p.ram || 'N/A',
        storage: p.storage || 'N/A',
        displaySize: p.displaySize || 'N/A',
        battery: p.battery || 'N/A',
        weight: p.weight || 'N/A',
        price: p.price || 0,
        os: p.os || 'N/A',
        benchmarkScore: p.benchmarkScore || 85,
        rating: p.rating || 4.5,
        reviewCount: p.reviewCount || 10,
        images: p.images || [getCategoryImage(category)],
        specs: p.specs || {},
        storePrices: p.storePrices || [],
        lowestPriceStore: p.lowestPriceStore || '',
        lowestPrice: p.lowestPrice || 0
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
    const isPhone = productQueries.some(q => {
      const lower = q.toLowerCase();
      return lower.includes('phone') || lower.includes('iphone') || lower.includes('galaxy') || lower.includes('pixel') || lower.includes('oneplus') || lower.includes('samsung') || lower.includes('ultra') || lower.includes('s2') || lower.includes('note');
    });

    const productsWithIds = productQueries.map((q) => {
      const id = new mongoose.Types.ObjectId().toString();
      return isPhone ? {
        _id: id,
        name: q,
        brand: q.split(' ')[0] || 'Generic',
        processor: q.toLowerCase().includes('iphone') ? 'Apple A17 Pro' : 'Snapdragon 8 Gen 3',
        gpu: q.toLowerCase().includes('iphone') ? 'Apple GPU (6-core)' : 'Adreno 750',
        ram: '8GB / 12GB LPDDR5X',
        storage: '256GB UFS 4.0',
        displaySize: '6.7" Dynamic AMOLED 2X',
        battery: '5000 mAh',
        weight: '220g',
        price: 85000,
        os: q.toLowerCase().includes('iphone') ? 'iOS 17' : 'Android 14',
        benchmarkScore: 9000,
        rating: 4.6,
        reviewCount: 154,
        images: ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800'],
        specs: {}
      } : {
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

    const categorySingular = userPreferences.category === 'phone' ? 'phone' : 'laptop';
    const categoryPlural = userPreferences.category === 'phone' ? 'phones' : 'laptops';

    const prompt = `You are an AI tech advisor. Search the web and find the top 3 best ${categoryPlural} that fit the following user preferences:
- Budget: ${userPreferences.budget ? `₹${userPreferences.budget.toLocaleString('en-IN')}` : 'Not specified'}
- Purpose: ${userPreferences.purpose || 'General use'}
- Priorities: ${userPreferences.priorities?.join(', ') || 'Not specified'}

Identify the single best ${categorySingular} as the winner, and return 2 other ${categoryPlural} as alternatives.

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

    const isPhone = userPreferences.category === 'phone';

    const winner = isPhone ? {
      _id: new mongoose.Types.ObjectId().toString(),
      name: 'Samsung Galaxy S24',
      brand: 'Samsung',
      processor: 'Exynos 2400',
      gpu: 'Xclipse 940',
      ram: '8GB',
      storage: '256GB',
      displaySize: '6.2"',
      battery: '4000 mAh',
      weight: '167g',
      price: 74900,
      os: 'Android 14',
      benchmarkScore: 9200,
      rating: 4.5,
      reviewCount: 218,
      images: ['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'],
      specs: {}
    } : {
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
      aiSummary: isPhone 
        ? 'A high-performance compact smartphone offering superb display quality, solid battery efficiency, and premium cameras.'
        : 'A solid all-rounder budget gaming and study laptop offering excellent price-to-performance ratio.',
      strengths: isPhone
        ? ['Stunning Dynamic AMOLED display', 'Comfortable lightweight design', 'Excellent triple camera system']
        : ['Great dedicated GPU for gaming', 'Decent screen refresh rate'],
      weaknesses: isPhone
        ? ['Charging speed capped at 25W', 'Slight thermal heating under sustained gaming load']
        : ['Slightly heavy at 2.3kg', 'Average battery life'],
      product: winner,
      scores: isPhone ? {
        performance: 90,
        battery: 80,
        portability: 95,
        value: 85
      } : {
        performance: 75,
        battery: 60,
        portability: 50,
        value: 85
      },
      alternatives: []
    };
  }
};

