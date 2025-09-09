import { Sidebar } from '@/components/ui/sidebar';
import { BottomNavigation } from '@/components/ui/bottom-navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar>
        {children}
      </Sidebar>
      <BottomNavigation />
    </>
  );
}
