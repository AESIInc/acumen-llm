'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import useSWR from 'swr';
import { ChatItem } from './sidebar-history-item';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from './ui/sidebar';
import { fetcher } from '@/lib/utils';
import { deleteChatAction } from '@/app/(chat)/actions';

export interface ChatHistory {
  chats: Array<{
    id: string;
    title: string;
    visibility: 'private' | 'public';
    createdAt: Date;
    userId: string;
  }>;
  hasMore: boolean;
}

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { id } = useParams();
  const router = useRouter();
  
  const { data: history, error, mutate } = useSWR<ChatHistory>(
    user ? '/api/history' : null,
    fetcher
  );

  if (!user) {
    return (
      <SidebarGroup>
        <SidebarGroupContent>
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Login to save and revisit previous chats!
          </div>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  }

  if (error) {
    console.error('Failed to fetch history:', error);
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {history?.chats?.map((item: any) => (
            <ChatItem
              key={item.id}
              chat={item}
              isActive={item.id === id}
              onDelete={async (chatId) => {
                try {
                  if (!user?.id) {
                    throw new Error('User not authenticated');
                  }

                  await deleteChatAction({
                    chatId,
                    userId: user.id,
                  });

                  // Refresh the chat history
                  mutate();

                  // Navigate to home if we deleted the current chat
                  if (chatId === id) {
                    router.push('/');
                  }
                } catch (error) {
                  console.error('Failed to delete chat:', error);
                }
              }}
              setOpenMobile={() => {}}
            />
          ))}
        </SidebarMenu>
        {(!history?.chats || history.chats.length === 0) && (
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Your conversations will appear here once you start chatting!
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
