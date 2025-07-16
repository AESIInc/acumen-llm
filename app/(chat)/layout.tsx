import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUser } from '@/app/(auth)/actions';
import Script from 'next/script';
import { DataStreamProvider } from '@/components/data-stream-provider';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, cookieStore] = await Promise.all([
    getCurrentUser(),
    cookies()
  ]);
  
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  // Create a user object that matches the expected format
  const userSession = user ? {
    id: user.id,
    email: user.email || 'User',
    type: 'regular' as const,
  } : undefined;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js"
        strategy="beforeInteractive"
      />
      <DataStreamProvider>
        <SidebarProvider defaultOpen={!isCollapsed}>
          <AppSidebar user={userSession} />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </DataStreamProvider>
    </>
  );
}
