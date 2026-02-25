import { useState } from 'react';
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

function NavLinks({ className = '', onLinkClick }) {
  return (
    <>
      {NAV_LINKS.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onLinkClick}
          className={({ isActive }) => `top-bar__link ${isActive ? 'is-active' : ''}`}
        >
          {label}
        </NavLink>
      ))}
    </>
  );
}

export default function TopBar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="top-bar">
        <NavLink to="/" className="top-bar__name top-bar__name--link">
          Placement Suite
        </NavLink>
        <nav className="top-bar__nav" aria-label="Main">
          <NavLinks />
        </nav>
        <button
          type="button"
          className="top-bar__menu-btn"
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className="top-bar__menu-btn-icon" aria-hidden="true" />
        </button>
      </header>
      <div
        className={`nav-dropdown ${menuOpen ? 'is-open' : ''}`}
        id="nav-dropdown"
        aria-hidden={!menuOpen}
      >
        <NavLinks onLinkClick={closeMenu} />
      </div>
    </>
  );
}
