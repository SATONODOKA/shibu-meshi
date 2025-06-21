// OpenStreetMap Overpass API クライアント
import axios from 'axios';

// Overpass APIエンドポイント（複数のサーバーを設定）
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.openstreetmap.ru/api/interpreter'
];

export interface OSMRestaurant {
  id: string;
  name: string;
  cuisine?: string;
  amenity?: string;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  distance?: number;
  score?: number;
}

export interface SearchParams {
  lat: number;
  lon: number;
  radius?: number; // メートル単位、デフォルト2000m
  cuisineTypes?: string[];
  atmosphere?: string;
  priceRange?: string;
}

// Overpass API クライアント（複数エンドポイント対応）
export async function queryOverpass(query: string): Promise<any> {
  let lastError: Error | null = null;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const response = await axios.post(endpoint, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 15000, // 15秒タイムアウト
      });
      
      return response.data;
    } catch (error) {
      console.warn(`Overpass endpoint ${endpoint} failed:`, error);
      lastError = error as Error;
      continue;
    }
  }

  throw lastError || new Error('すべてのOverpass APIエンドポイントが利用できません');
}

// 飲食店検索クエリ生成
export function buildRestaurantQuery(params: SearchParams): string {
  const { lat, lon, radius = 2000, cuisineTypes = [] } = params;

  // 検索範囲を計算（緯度経度の概算）
  const latDiff = radius / 111000; // 緯度1度 ≈ 111km
  const lonDiff = radius / (111000 * Math.cos(lat * Math.PI / 180));

  const south = lat - latDiff;
  const north = lat + latDiff;
  const west = lon - lonDiff;
  const east = lon + lonDiff;

  // 料理タイプフィルター
  let cuisineFilter = '';
  if (cuisineTypes.length > 0) {
    const cuisineRegex = cuisineTypes
      .map(type => type.toLowerCase())
      .join('|');
    cuisineFilter = `[cuisine~"${cuisineRegex}",i]`;
  }

  // Overpass QL クエリ
  const query = `
    [out:json][timeout:25];
    (
      // レストラン・カフェ・ファストフード
      node["amenity"~"^(restaurant|cafe|fast_food|bar|pub|izakaya)$"]${cuisineFilter}(${south},${west},${north},${east});
      way["amenity"~"^(restaurant|cafe|fast_food|bar|pub|izakaya)$"]${cuisineFilter}(${south},${west},${north},${east});
      relation["amenity"~"^(restaurant|cafe|fast_food|bar|pub|izakaya)$"]${cuisineFilter}(${south},${west},${north},${east});
      
      // 日本特有の飲食タグ
      node["cuisine"]${cuisineFilter}(${south},${west},${north},${east});
      way["cuisine"]${cuisineFilter}(${south},${west},${north},${east});
      
      // 居酒屋特別対応
      node["amenity"="izakaya"](${south},${west},${north},${east});
      way["amenity"="izakaya"](${south},${west},${north},${east});
    );
    out center meta;
  `;

  return query.trim();
}

// 料理タイプマッピング（日本語→英語/OSMタグ）
export const CUISINE_MAPPING: Record<string, string[]> = {
  '和食': ['japanese', 'sushi', 'ramen', 'udon', 'soba', 'tempura', 'yakitori'],
  '中華': ['chinese', 'asian'],
  'イタリアン': ['italian', 'pizza', 'pasta'],
  'フレンチ': ['french'],
  '韓国料理': ['korean', 'asian'],
  'タイ料理': ['thai', 'asian'],
  'インド料理': ['indian'],
  'アメリカン': ['american', 'burger'],
  '焼肉': ['bbq', 'korean', 'yakiniku'],
  '居酒屋': ['izakaya', 'japanese'],
  'カフェ': ['cafe', 'coffee'],
  'ファストフード': ['fast_food', 'burger'],
  '洋食': ['western', 'european'],
  'アジア料理': ['asian', 'thai', 'vietnamese', 'korean'],
  'バー': ['bar', 'cocktail'],
  '寿司': ['sushi', 'japanese'],
  'ラーメン': ['ramen', 'japanese'],
  '焼き鳥': ['yakitori', 'japanese'],
  '天ぷら': ['tempura', 'japanese'],
  'うどん': ['udon', 'japanese'],
  'そば': ['soba', 'japanese'],
};

// 距離計算（ハバサイン公式）
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // 地球の半径（メートル）
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// OSMデータからレストラン情報を抽出
export function parseOSMRestaurant(element: any, userLat: number, userLon: number): OSMRestaurant {
  const lat = element.lat || (element.center ? element.center.lat : 0);
  const lon = element.lon || (element.center ? element.center.lon : 0);
  
  const name = element.tags?.name || element.tags?.['name:ja'] || 'unknown';
  const distance = calculateDistance(userLat, userLon, lat, lon);

  return {
    id: `${element.type}_${element.id}`,
    name,
    cuisine: element.tags?.cuisine,
    amenity: element.tags?.amenity,
    lat,
    lon,
    tags: element.tags || {},
    distance: Math.round(distance),
  };
}

// 気分に基づくスコアリング
export function scoreRestaurant(restaurant: OSMRestaurant, moodAnalysis: any): number {
  let score = 100; // ベーススコア

  // 距離による減点（近いほど高得点）
  if (restaurant.distance) {
    score -= Math.min(restaurant.distance / 50, 50); // 最大50点減点
  }

  // 料理タイプマッチング
  if (moodAnalysis.cuisine_types && restaurant.cuisine) {
    const matchedCuisines = moodAnalysis.cuisine_types.some((type: string) => 
      CUISINE_MAPPING[type]?.some(mappedType => 
        restaurant.cuisine?.toLowerCase().includes(mappedType) ||
        restaurant.tags?.cuisine?.toLowerCase().includes(mappedType)
      )
    );
    if (matchedCuisines) score += 30;
  }

  // 雰囲気マッチング（タグベース）
  if (moodAnalysis.atmosphere) {
    const atmosphere = moodAnalysis.atmosphere.toLowerCase();
    if (atmosphere.includes('リラックス') && (restaurant.amenity === 'cafe' || restaurant.tags?.atmosphere === 'casual')) {
      score += 20;
    }
    if (atmosphere.includes('特別') && restaurant.tags?.formal === 'yes') {
      score += 25;
    }
    if (atmosphere.includes('にぎやか') && restaurant.amenity === 'izakaya') {
      score += 20;
    }
  }

  // 価格帯マッチング
  if (moodAnalysis.price_range && restaurant.tags?.price_range) {
    const priceMap: Record<string, string[]> = {
      '安い': ['$', 'budget', 'cheap'],
      '普通': ['$$', 'moderate'],
      '高い': ['$$$', '$$$$', 'expensive', 'fine_dining']
    };
    
    const expectedPrices = priceMap[moodAnalysis.price_range] || [];
    if (expectedPrices.some(price => restaurant.tags?.price_range?.includes(price))) {
      score += 15;
    }
  }

  return Math.max(0, Math.min(100, score));
}

// メイン検索関数
export async function searchRestaurants(params: SearchParams, moodAnalysis?: any): Promise<OSMRestaurant[]> {
  try {
    // 料理タイプを英語/OSMタグに変換
    const cuisineTypes = params.cuisineTypes?.flatMap(type => CUISINE_MAPPING[type] || []) || [];
    const searchParams = { ...params, cuisineTypes };

    // Overpass クエリ実行
    const query = buildRestaurantQuery(searchParams);
    const data = await queryOverpass(query);

    if (!data.elements || data.elements.length === 0) {
      return [];
    }

    // 結果を解析
    const restaurants: OSMRestaurant[] = data.elements
      .filter((element: any) => element.tags?.name) // 名前があるもののみ
      .map((element: any) => parseOSMRestaurant(element, params.lat, params.lon))
      .filter((restaurant: OSMRestaurant) => restaurant.distance && restaurant.distance <= (params.radius || 2000));

    // 気分分析に基づくスコアリング
    if (moodAnalysis) {
      restaurants.forEach(restaurant => {
        restaurant.score = scoreRestaurant(restaurant, moodAnalysis);
      });
      
      // スコア順にソート
      restaurants.sort((a, b) => (b.score || 0) - (a.score || 0));
    } else {
      // 距離順にソート
      restaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
    }

    return restaurants.slice(0, 20); // 上位20件
  } catch (error) {
    console.error('Restaurant search error:', error);
    throw new Error('レストラン検索に失敗しました。ネットワーク接続を確認してください。');
  }
}

// 住所から座標を取得（Nominatim API）
export async function geocodeAddress(address: string): Promise<{lat: number, lon: number} | null> {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1,
        countrycodes: 'jp', // 日本に限定
      },
      headers: {
        'User-Agent': 'ShibuMeshi/1.0 (https://github.com/your-repo)'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lon: parseFloat(result.lon)
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
} 