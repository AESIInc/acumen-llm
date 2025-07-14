import { cookies } from 'next/headers';

import { AppSidebar } from '@/components/app-sidebar';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getCurrentUser, getUserType } from '@/app/(auth)/actions';
import Script from 'next/script';
import { DataStreamProvider } from '@/components/data-stream-provider';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, userType, cookieStore] = await Promise.all([
    getCurrentUser(),
    getUserType(),
    cookies()
  ]);
  
  const isCollapsed = cookieStore.get('sidebar:state')?.value !== 'true';

  // Create a user object that matches the expected format
  const userSession = user ? {
    id: user.id,
    email: user.email || `guest-${user.id}`,
    type: userType || 'guest',
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
