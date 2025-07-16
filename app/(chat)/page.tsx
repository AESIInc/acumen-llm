import { cookies } from 'next/headers';

import { Chat } from '@/components/chat';
import { DEFAULT_CHAT_MODEL } from '@/lib/ai/models';
import { generateUUID } from '@/lib/utils';
import { DataStreamHandler } from '@/components/data-stream-handler';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  // Create a session object compatible with the existing Chat component
  const session = {
    user: {
      id: user.id,
      email: user.email,
      type: 'regular' as const,
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };

  const id = generateUUID();

  const cookieStore = await cookies();
  const modelIdFromCookie = cookieStore.get('cloud-chat-model');

  if (!modelIdFromCookie) {
    return (
      <>
        <Chat
          key={id}
          id={id}
          initialMessages={[]}
          initialChatModel={DEFAULT_CHAT_MODEL}
          initialVisibilityType="private"
          isReadonly={false}
          session={session}
          autoResume={false}
        />
        <DataStreamHandler />
      </>
    );
  }

  const cookieModelId = modelIdFromCookie.value;

  return (
    <>
      <Chat
        key={id}
        id={id}
        initialMessages={[]}
        initialChatModel={cookieModelId}
        initialVisibilityType="private"
        isReadonly={false}
        session={session}
        autoResume={false}
      />
      <DataStreamHandler />
    </>
  );
}
