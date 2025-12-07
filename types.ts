export interface ImageAsset {
  id: string;
  url: string;
  isGenerated?: boolean;
  base64Data?: string; // Cache base64 data to avoid re-fetching
}

export enum Step {
  SelectPerson = 1,
  SelectCloth = 2,
  Result = 3,
}

export interface GeneratedHistoryItem {
  id: string;
  personImage: string;
  clothImage: string;
  resultImage: string;
  timestamp: number;
}