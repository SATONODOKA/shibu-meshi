// 基本的なタイプ定義
export interface Restaurant {
  id: string;
  name: string;
  cuisine?: string;
  amenity?: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  distance?: number;
  score?: number;
  
  // 従来のGoogleマップ形式との互換性保持
  place_id?: string;
  rating?: number;
  user_ratings_total?: number;
  price_level?: number;
  photos?: string[];
  opening_hours?: {
    open_now?: boolean;
    weekday_descriptions?: string[];
  };
  formatted_address?: string;
  phone?: string;
  website?: string;
}

export interface MoodAnalysis {
  cuisine_types: string[];
  atmosphere: string;
  price_range: string;
  dining_style: string;
  additional_questions?: string[];
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface Location {
  lat: number;
  lng: number;
}

export interface SearchRequest {
  mood: string;
  location: Location;
  radius?: number;
}

export interface SearchResponse {
  restaurants: Restaurant[];
  analysis: MoodAnalysis;
  totalCount: number;
}

export interface Question {
  id: string;
  text: string;
  type: 'text' | 'choice' | 'rating';
  options?: string[];
  required: boolean;
}

export interface UserPreferences {
  location?: Location;
  favoriteGenres?: string[];
  priceRange?: [number, number];
  savedRestaurants?: string[];
}

// OpenStreetMap検索パラメータ
export interface OSMSearchParams {
  lat: number;
  lon: number;
  radius?: number;
  cuisineTypes?: string[];
  atmosphere?: string;
  priceRange?: string;
} 