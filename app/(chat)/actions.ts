'use server';

import { generateText, type UIMessage } from 'ai';
import { cookies } from 'next/headers';
import {
  deleteMessagesByChatIdAfterTimestamp,
  getMessageById,
  updateChatVisiblityById,
  deleteChatById,
  getChatById,
} from '@/lib/db/queries';
import type { VisibilityType } from '@/components/visibility-selector';
import { myProvider } from '@/lib/ai/providers';

export async function saveChatModelAsCookie(model: string) {
  const cookieStore = await cookies();
  cookieStore.set('chat-model', model);
}

export async function generateTitleFromUserMessage({
  message,
}: {
  message: UIMessage;
}) {
  const { text: title } = await generateText({
    model: myProvider.languageModel('cloud-title-model'),
    system: `\n
    - you will generate a short title based on the first message a user begins a conversation with
    - ensure it is not more than 80 characters long
    - the title should be a summary of the user's message
    - do not use quotes or colons`,
    prompt: JSON.stringify(message),
  });

  return title;
}

export async function deleteTrailingMessages({ id }: { id: string }) {
  const [message] = await getMessageById({ id });

  await deleteMessagesByChatIdAfterTimestamp({
    chatId: message.chatId,
    timestamp: message.createdAt,
  });
}

export async function updateChatVisibility({
  chatId,
  visibility,
}: {
  chatId: string;
  visibility: VisibilityType;
}) {
  await updateChatVisiblityById({ chatId, visibility });
}

export async function deleteChatAction({
  chatId,
  userId,
}: {
  chatId: string;
  userId: string;
}) {
  try {
    // First verify the chat exists and belongs to the user
    const chat = await getChatById({ id: chatId });
    if (!chat) {
      throw new Error('Chat not found');
    }
    
    if (chat.userId !== userId) {
      throw new Error('Unauthorized: You can only delete your own chats');
    }

    // Delete the chat using the existing Drizzle function
    await deleteChatById({ id: chatId });
    
    return { success: true };
  } catch (error) {
    console.error('Failed to delete chat:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to delete chat');
  }
}
