export default function EmptyState({ icon, title, description }) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '80px 24px',
      color: '#94a3b8',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>{icon}</div>
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>
        {description}
      </p>
    </div>
  );
}