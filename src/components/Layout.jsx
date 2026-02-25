import { Outlet } from 'react-router-dom';
import TopBar from './TopBar';
import ProofFooter from './ProofFooter';

export default function Layout() {
  return (
    <div className="app-shell">
      <TopBar />
      <main>
        <Outlet />
      </main>
      <ProofFooter />
    </div>
  );
}
