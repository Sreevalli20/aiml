import { apiClient } from './client';
import { 
  SpeechSynthesisRequest, 
  SpeechSynthesisResponse, 
  VoiceTranscriptionResponse 
} from '../types/voice';
import { ApiResponse } from '../types/api';

export const voiceApi = {
  /**
   * Transcribe recorded audio file to text.
   */
  async transcribeAudio(audioBlob: Blob, language?: string): Promise<VoiceTranscriptionResponse> {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'voice_input.webm');
    if (language) {
      formData.append('language', language);
    }

    const baseUrl = apiClient.getBaseUrl();
    const token = typeof window !== 'undefined' ? localStorage.getItem('xyz_auth_token') : null;
    const url = baseUrl ? `${baseUrl.replace(/\/$/, '')}/api/voice/transcribe` : '/api/voice/transcribe';

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!res.ok) {
      throw new Error(`Voice transcription failed with HTTP ${res.status}`);
    }

    const json = await res.json();
    if (json && 'data' in json) {
      return json.data as VoiceTranscriptionResponse;
    }
    return json as VoiceTranscriptionResponse;
  },

  /**
   * Synthesize text into speech audio.
   */
  async synthesizeSpeech(payload: SpeechSynthesisRequest): Promise<SpeechSynthesisResponse> {
    const res = await apiClient.post<ApiResponse<SpeechSynthesisResponse> | SpeechSynthesisResponse>(
      '/api/voice/synthesize',
      payload
    );
    if ('data' in res && res.data) {
      return res.data;
    }
    return res as SpeechSynthesisResponse;
  }
};
