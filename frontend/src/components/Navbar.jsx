import { Link, useLocation } from 'react-router-dom';

const links = [
  { path: '/', label: 'Главная' },
  { path: '/meetings', label: 'Встречи' },
  { path: '/action-items', label: 'Задачи' },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav style={{
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        height: '64px',
        gap: '32px',
      }}>
        <Link to="/" style={{ fontWeight: '700', fontSize: '18px', color: '#4f46e5' }}>
          🎙 MeetingAI
        </Link>

        <div style={{ display: 'flex', gap: '8px' }}>
          {links.map(link => (
            <Link
              key={link.path}
              to={link.path}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                color: location.pathname === link.path ? '#4f46e5' : '#64748b',
                backgroundColor: location.pathname === link.path ? '#eef2ff' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}