'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import type { User } from '@/lib/types';
import { useEffect, useState } from 'react';
import { ChatItem } from './sidebar-history-item';
import { SidebarGroup, SidebarGroupContent, SidebarMenu } from './ui/sidebar';

export function SidebarHistory({ user }: { user: User | undefined }) {
  const { id } = useParams();
  const router = useRouter();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user) return;

    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/history');
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (error) {
        console.error('Failed to fetch history:', error);
      }
    };

    fetchHistory();
  }, [user]);

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

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {history.map((item: any) => (
            <ChatItem
              key={item.id}
              chat={item}
              isActive={item.id === id}
              onDelete={(chatId) => {
                // Handle delete
                console.log('Delete chat:', chatId);
              }}
              setOpenMobile={() => {}}
            />
          ))}
        </SidebarMenu>
        {history.length === 0 && (
          <div className="px-2 text-zinc-500 w-full flex flex-row justify-center items-center text-sm gap-2">
            Your conversations will appear here once you start chatting!
          </div>
        )}
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
