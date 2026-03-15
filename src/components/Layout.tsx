import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-sm px-4 pb-24 pt-5">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
