import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-lg md:max-w-2xl lg:max-w-4xl mx-auto pb-20 px-4 md:px-8 pt-4 md:pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
