/**
 * API client for AI Agent functionality
 */

const API_BASE_URL = 'http://localhost:5000/api/agent';

export interface ProductData {
  product_name?: string;
  brand?: string;
  brand_id?: number; // AI匹配的品牌ID
  specification?: string;
  category?: string;
  classify_id?: number; // AI匹配的分类ID
  quantity?: number;
  unit_price?: number;
  supplier?: string;
  target_animal?: string;
  features?: string;
  barcode?: string;
  notes?: string;
  shelf_life?: number | string; // 保质期（月数）
  origin?: string; // 产地
}

export interface ExtractionResult {
  success: boolean;
  product_data?: ProductData;
  is_valid?: boolean;
  messages?: string[];
  error?: string;
  raw_response?: string;
  image_info?: {
    format: string;
    width: number;
    height: number;
    size_mb: number;
  };
}

export interface ChatResponse {
  success: boolean;
  response: string;
  product_data?: ProductData;
  is_valid?: boolean;
  messages?: string[];
  requires_more_info?: boolean;
}

/**
 * Check agent service health
 */
export async function checkAgentHealth(): Promise<{ status: string; message: string }> {
  const response = await fetch(`${API_BASE_URL}/health`);
  return response.json();
}

/**
 * Extract product information from text
 */
export async function extractFromText(text: string): Promise<ExtractionResult> {
  const response = await fetch(`${API_BASE_URL}/extract-from-text`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract from text');
  }
  
  return response.json();
}

/**
 * Extract product information from image
 */
export async function extractFromImage(
  image: File,
  context?: string
): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append('image', image);
  if (context) {
    formData.append('context', context);
  }
  
  const response = await fetch(`${API_BASE_URL}/extract-from-image`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract from image');
  }
  
  return response.json();
}

/**
 * Extract product information from mixed text and images
 */
export async function extractMixed(
  text: string,
  images: File[]
): Promise<ExtractionResult> {
  const formData = new FormData();
  formData.append('text', text);
  images.forEach(image => {
    formData.append('images', image);
  });
  
  const response = await fetch(`${API_BASE_URL}/extract-mixed`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to extract from mixed input');
  }
  
  return response.json();
}

/**
 * Chat with agent
 */
export async function chatWithAgent(
  message: string,
  conversationHistory?: any[]
): Promise<ChatResponse> {
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
    }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Chat failed');
  }
  
  return response.json();
}

/**
 * Save product to database
 */
export async function saveProduct(productData: ProductData): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/save-product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ product_data: productData }),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to save product');
  }
  
  return response.json();
}

