import Gemini from '@/components/icons/gemini';
import type { ReactElement } from 'react';

export const DEFAULT_CHAT_MODEL: string = 'secure-model-lite';

export interface ChatModel {
  id: string;
  name: string;
  description: string;
  icon: string | ReactElement;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'secure-model-lite',
    name: 'Secure Model Lite',
    icon: '🔒',
    description: 'A quick and 🔐 secure model allowing for fast and secure conversations, including sensitive client data.',
  },
  {
    id: 'secure-model-pro',
    name: 'Secure Model Pro',
    icon: '🔒',
    description: 'A powerful and 🔐 secure model allowing for advanced conversations, including sensitive client data.',
  },
  {
    id: 'cloud-model-gemini-flash',
    name: 'Google Cloud Model (gemini-2.5-flash)',
    icon: Gemini({}),
    description: 'Light and fast advanced cloud model for use with non-sensitive client data.',
  },
  {
    id: 'cloud-model-gemini-pro',
    name: 'Google Cloud Model (gemini-2.5-pro)',
    icon: Gemini({}),
    description: 'Advanced cloud model for use with non-sensitive client data.',
  },
];
