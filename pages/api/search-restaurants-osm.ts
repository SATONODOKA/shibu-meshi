import { NextApiRequest, NextApiResponse } from 'next';
import { searchRestaurants, geocodeAddress } from '../../lib/overpass';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { location, moodAnalysis, radius = 2000 } = req.body;

    if (!location) {
      return res.status(400).json({ error: '位置情報が必要です' });
    }

    let lat: number, lon: number;

    // 位置情報の処理
    if (typeof location === 'string') {
      // 住所文字列の場合は座標に変換
      const coords = await geocodeAddress(location);
      if (!coords) {
        return res.status(400).json({ error: '住所が見つかりませんでした' });
      }
      lat = coords.lat;
      lon = coords.lon;
    } else if (location.lat && location.lon) {
      // 座標が直接指定された場合
      lat = location.lat;
      lon = location.lon;
    } else {
      return res.status(400).json({ error: '位置情報の形式が正しくありません' });
    }

    // 検索パラメータ
    const searchParams = {
      lat,
      lon,
      radius: parseInt(radius),
      cuisineTypes: moodAnalysis?.cuisine_types || [],
      atmosphere: moodAnalysis?.atmosphere,
      priceRange: moodAnalysis?.price_range,
    };

    // OpenStreetMapで店舗検索
    const restaurants = await searchRestaurants(searchParams, moodAnalysis);

    // 結果を返す
    res.status(200).json({
      success: true,
      restaurants,
      searchCenter: { lat, lon },
      searchRadius: radius,
      totalFound: restaurants.length,
    });

  } catch (error) {
    console.error('Restaurant search error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'レストラン検索に失敗しました',
      success: false 
    });
  }
} 