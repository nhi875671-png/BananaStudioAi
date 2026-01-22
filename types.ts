
export type AspectRatio = "1:1" | "3:4" | "4:3" | "9:16" | "16:9";

export enum LightingStyle {
  CINEMATIC = "Cinematic",
  STUDIO = "Studio Professional",
  NATURAL = "Golden Hour Natural",
  NEON = "Cyberpunk Neon",
  SOFT = "Soft Box Portrait",
  DRAMATIC = "Dramatic Chiaroscuro"
}

export enum CameraPerspective {
  EYE_LEVEL = "Eye Level",
  TOP_DOWN = "Flat Lay (Top Down)",
  CLOSE_UP = "Macro / Close-up",
  WIDE_ANGLE = "Wide Angle Environment",
  LOW_ANGLE = "Hero (Low Angle)"
}

export interface StudioSettings {
  aspectRatio: AspectRatio;
  lighting: LightingStyle;
  perspective: CameraPerspective;
}

export interface ProcessingState {
  isGeneratingPrompt: boolean;
  isGeneratingImage: boolean;
  error: string | null;
}
