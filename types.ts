export interface Province {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export interface MapPoint {
  lat: number;
  lng: number;
  title: string;
  description?: string;
  uri?: string;
}

export interface EventItem {
  title: string;
  address?: string;
  uri?: string;
  coordinates?: { lat: number; lng: number };
  description?: string;
}

export interface GeminiResponseState {
  text: string;
  events: EventItem[];
  loading: boolean;
  error: string | null;
}
