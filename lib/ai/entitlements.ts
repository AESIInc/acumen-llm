
import type { ChatModel } from './models';

interface Entitlements {
  maxMessagesPerDay: number;
  availableChatModelIds: Array<ChatModel['id']>;
}

export const entitlementsByUserType: Record<string, Entitlements> = {
  /*
   * For users without an account
   */
  guest: {
    maxMessagesPerDay: 20,
    availableChatModelIds: ['cloud-chat-model', 'cloud-chat-model-reasoning', 'secure-chat-model'],
  },

  /*
   * For users with an account
   */
  regular: {
    maxMessagesPerDay: 100,
    availableChatModelIds: ['cloud-chat-model', 'cloud-chat-model-reasoning', 'secure-chat-model'],
  },

  /*
   * TODO: For users with an account and a paid membership
   */
};
