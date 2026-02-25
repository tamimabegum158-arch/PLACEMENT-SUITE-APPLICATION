import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import NotificationBanner from './NotificationBanner';
import ProofFooter from './ProofFooter';

export default function Layout() {
  return (
    <div className="app-shell">
      <TopBar />
      <NotificationBanner />
      <main>
        <Outlet />
      </main>
      <ProofFooter />
    </div>
  );
}
