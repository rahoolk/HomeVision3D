export interface GenerationResult {
  step1Url: string | null; // Base 3D
  step2Url: string | null; // With Roof
  step3Url: string | null; // Final Textured
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING_STEP_1 = 'GENERATING_STEP_1', // Base 3D
  GENERATING_STEP_2 = 'GENERATING_STEP_2', // Roof
  GENERATING_STEP_3 = 'GENERATING_STEP_3', // Texture
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface DesignAnalysis {
  architecturalStyle: string;
  keyMaterials: string[];
  layoutSummary: string;
  designSuggestions: string[];
}