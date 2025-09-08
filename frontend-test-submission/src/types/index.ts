export interface UrlData {
  id?: number;
  original_url: string;
  short_code: string;
  created_at: string;
  expires_at: string;
  click_count: number;
  shortLink: string;
  clicks: ClickData[];
}

export interface ClickData {
  timestamp: string;
  source: string;
  location: string;
  userAgent: string;
}

export interface CreateUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface CreateUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface StatisticsResponse {
  total: number;
  urls: UrlData[];
}

export interface FormUrlData extends CreateUrlRequest {
  id: string; // for form management
}
