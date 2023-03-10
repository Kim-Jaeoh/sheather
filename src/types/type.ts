import { Point } from "react-easy-crop";

export interface LocationCoordsType {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
}

export interface LocationErrorType {
  code: number;
  message: string;
}

export interface LocationStateType {
  coordinates?: {
    lat: number;
    lon: number;
    acc: number;
  };
  error?: { code: number; message: string };
}

// 현재 날씨
export interface WeatherDataType {
  id?: number;
  cod?: number;
  dt?: number;
  main: {
    feels_like: number;
    temp: number;
    temp_max: number;
    temp_min: number;
  };
  weather: {
    description: string;
    icon: string;
    id: number;
    main: string;
  }[];
  wind: {
    deg: number;
    gust: number;
    speed: number;
  };
  coord?: {
    lat: number;
    lon: number;
  };
}

// 단기 예보
export interface WeathersFiveDataType extends WeatherDataType {
  city?: {
    id: number;
    name: string;
  };
  clouds?: {
    all: number;
  };
  dt_txt?: string;
  realDateTime?: number;
}

// 단기 예보 map 돌릴 때
export interface WeatherMapDataType {
  list: WeathersFiveDataType[];
}

export interface ResDataType {
  dt?: number;
  dt_txt?: string;
  weather?: { description: string; icon: string }[];
  main?: {
    temp: number;
    feels_like: number;
    temp_max: number;
    temp_min: number;
  };
  wind?: { speed: number };
}

export interface replyType {
  parentId: string;
  replyId: string;
  email: string;
  displayName: string;
  text: string;
  replyAt: number;
}

export interface FeedType {
  id: string;
  url: string[];
  name?: string;
  displayName: string;
  imgAspect: string;
  email: string;
  createdAt: number;
  like: {
    displayName: string;
    likedAt: number;
    email?: string;
  }[];
  text: string;
  feel: string;
  wearInfo: {
    outer: string;
    top: string;
    innerTop: string;
    bottom: string;
    etc: string;
  };
  weatherInfo: {
    temp: number;
    wind: number;
    weatherIcon: string;
    weather: string;
  };
  region: string;
  reply: replyType[];
  editAt?: number;
  tag?: string[];
}

export interface AspectRatio {
  value: number;
  text: string;
  paddingTop?: number;
}

export interface ImageType {
  name?: string;
  imageUrl: string;
  crop?: Point;
  zoom?: number;
  aspect?: AspectRatio;
  croppedImageUrl?: string;
}
