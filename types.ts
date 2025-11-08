export enum Role {
  USER = 'user',
  BOT = 'bot',
}

export interface ChartData {
  type: 'chart';
  chartType: 'bar' | 'pie' | 'line';
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey?: string;
  unit?: string;
}

export interface ImageData {
  type: 'image';
  data: string; // base64 data URI
  alt: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string | ChartData | ImageData;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  language: string;
}
