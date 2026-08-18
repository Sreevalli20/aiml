export type VoiceStatus = 
  | 'idle'
  | 'listening'
  | 'recording'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'error';

export interface VoiceTranscriptionResponse {
  text: string;
  detectedLanguage?: string;
  confidence?: number;
}

export interface SpeechSynthesisRequest {
  text: string;
  language?: string;
  voiceGender?: 'female' | 'male';
}

export interface SpeechSynthesisResponse {
  audioBase64?: string;
  audioUrl?: string;
  durationSeconds?: number;
}
