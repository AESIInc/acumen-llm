import { createClient } from '@/lib/supabase/server';
import { getChatById, getVotesByChatId, voteMessage } from '@/lib/db/queries';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const chatId = searchParams.get('chatId');

  if (!chatId) {
    return Response.json({ error: 'Missing chatId' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return Response.json({ error: 'Chat not found' }, { status: 404 });
  }

  if (chat.userId !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const votes = await getVotesByChatId({ id: chatId });
  return Response.json(votes);
}

export async function PATCH(request: NextRequest) {
  const { chatId, messageId, type } = await request.json();

  if (!chatId || !messageId || !type) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const chat = await getChatById({ id: chatId });

  if (!chat) {
    return Response.json({ error: 'Chat not found' }, { status: 404 });
  }

  if (chat.userId !== user.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await voteMessage({
    chatId,
    messageId,
    type: type,
  });

  return Response.json({ success: true });
}
