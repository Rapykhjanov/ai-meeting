import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export default function MeetingCard({ meeting }) {
  const statusColors = {
    done: { bg: '#f0fdf4', color: '#16a34a', label: 'Готово' },
    processing: { bg: '#fefce8', color: '#ca8a04', label: 'Обрабатывается' },
    error: { bg: '#fef2f2', color: '#dc2626', label: 'Ошибка' },
  };

  const s = statusColors[meeting.status] || statusColors.done;

  return (
    <Link to={`/meetings/${meeting.id}`}>
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '12px',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                {meeting.title || 'Встреча без названия'}
              </h3>
              <span style={{
                padding: '2px 10px',
                borderRadius: '999px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: s.bg,
                color: s.color,
              }}>
                {s.label}
              </span>
            </div>

            {meeting.summary && (
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.5',
                marginBottom: '12px',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {meeting.summary}
              </p>
            )}

            <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: '#94a3b8' }}>
              <span>
                📅 {format(new Date(meeting.created_at), 'd MMM yyyy', { locale: ru })}
              </span>
              <span>
                📌 {meeting.open_action_items} открытых задач
              </span>
              <span>
                {meeting.source_type === 'audio' ? '🎙 Аудио' : '📝 Текст'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}