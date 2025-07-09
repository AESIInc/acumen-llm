export const DEFAULT_CHAT_MODEL: string = 'cloud-chat-model';

export interface ChatModel {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const chatModels: Array<ChatModel> = [
  {
    id: 'cloud-chat-model',
    name: 'Cloud Chat model',
    icon: '☁️',
    description: 'Primary model for all-purpose chat',
  },
  {
    id: 'cloud-chat-model-reasoning',
    name: 'Cloud Reasoning model',
    icon: '☁️',
    description: 'Uses advanced reasoning',
  },
  {
    id: 'secure-chat-model',
    name: 'Secure Chat model',
    icon: '🔒',
    description: 'Primary model for all-purpose chat',
  },
  
];