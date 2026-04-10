import { actionItemsAPI } from '../api/client';

const statusConfig = {
  todo: { label: 'Нужно сделать', color: '#64748b', bg: '#f1f5f9', next: 'in_progress' },
  in_progress: { label: 'В процессе', color: '#d97706', bg: '#fef3c7', next: 'done' },
  done: { label: 'Готово', color: '#16a34a', bg: '#f0fdf4', next: 'todo' },
};

export default function ActionItemRow({ item, onUpdate }) {
  const s = statusConfig[item.status];

  const handleStatusChange = async () => {
    try {
      await actionItemsAPI.updateStatus(item.id, s.next);
      onUpdate();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 16px',
      backgroundColor: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      marginBottom: '8px',
    }}>
      <button
        onClick={handleStatusChange}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: `2px solid ${item.status === 'done' ? '#16a34a' : '#cbd5e1'}`,
          backgroundColor: item.status === 'done' ? '#16a34a' : 'transparent',
          flexShrink: 0,
        }}
      />

      <div style={{ flex: 1 }}>
        <p style={{
          fontSize: '14px',
          color: item.status === 'done' ? '#94a3b8' : '#1e293b',
          textDecoration: item.status === 'done' ? 'line-through' : 'none',
          marginBottom: '4px',
        }}>
          {item.text}
        </p>
        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8' }}>
          {item.assignee && <span>👤 {item.assignee}</span>}
          {item.deadline && <span>📅 {item.deadline}</span>}
        </div>
      </div>

      <span style={{
        padding: '3px 10px',
        borderRadius: '999px',
        fontSize: '12px',
        fontWeight: '500',
        backgroundColor: s.bg,
        color: s.color,
        whiteSpace: 'nowrap',
      }}>
        {s.label}
      </span>
    </div>
  );
}