import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md md:max-w-xl lg:max-w-3xl mx-auto pb-24 px-6 md:px-8 pt-5 md:pt-6">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
