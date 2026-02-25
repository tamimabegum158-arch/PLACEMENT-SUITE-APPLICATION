import { NavLink } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/jobs', label: 'Jobs' },
  { to: '/analyze', label: 'Analyze' },
  { to: '/resume', label: 'Resume' },
  { to: '/applications', label: 'Applications' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
  { to: '/proof', label: 'Proof' },
];

export default function TopBar() {
  return (
    <header className="top-bar">
      <NavLink to="/" className="top-bar__name">
        Placement Suite
      </NavLink>
      <nav className="top-bar__nav" aria-label="Main">
        {NAV_LINKS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `top-bar__link ${isActive ? 'is-active' : ''}`}
            end={false}
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
}
