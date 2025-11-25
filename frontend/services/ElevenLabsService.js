// frontend/services/ElevenLabsService.js

import Constants from 'expo-constants';

const API_BASE = 'https://api.elevenlabs.io/v1/convai';
const AGENT_ID = 'CwhRBWXzGAHq8TQ4Fs17';

/**
 * Starts a new conversation with ElevenLabs Agents platform.
 * @param {Object} options - Options for the conversation.
 * @param {string} options.language - Language code (e.g., 'en').
 * @returns {Promise<Object>} Conversation object from ElevenLabs API.
 */
export async function startConversation({ language = 'nl' } = {}) {
//   const apiKey = Constants?.manifest?.extra?.elevenlabsApiKey;
    const apiKey = "sk_ef836e6e15f6c922772b2dee1594569b47f0e3410bdd7fef"
  if (!apiKey) {
    throw new Error('ElevenLabs API key not configured');
  }
  const response = await fetch(`${API_BASE}/agents/${AGENT_ID}/simulate-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ language }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs startConversation failed: ${response.status} ${err}`);
  }
  return response.json();
}

/**
 * Sends audio data (base64) to the conversation and receives a response.
 * This is a placeholder; actual implementation would stream audio via WebRTC or similar.
 */
export async function sendAudio(conversationId, audioBase64) {
//   const apiKey = Constants?.manifest?.extra?.elevenlabsApiKey;
    const apiKey = "sk_ef836e6e15f6c922772b2dee1594569b47f0e3410bdd7fef"
  const response = await fetch(`${API_BASE}/agents/${AGENT_ID}/conversations/${conversationId}/audio`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ audio: audioBase64 }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`ElevenLabs sendAudio failed: ${response.status} ${err}`);
  }
  return response.json();
}
