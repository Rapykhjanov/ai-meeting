import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { meetingsAPI, actionItemsAPI } from '../api/client';
import MeetingCard from '../components/MeetingCard';
import ActionItemRow from '../components/ActionItemRow';
import EmptyState from '../components/EmptyState';

export default function Home() {
  const [meetings, setMeetings] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [meetingsRes, itemsRes] = await Promise.all([
        meetingsAPI.getAll({ page_size: 5 }),
        actionItemsAPI.getAll({ status: 'todo' }),
      ]);
      setMeetings(meetingsRes.data.results || meetingsRes.data);
      setActionItems(itemsRes.data.results || itemsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>
      Загрузка...
    </div>
  );

  const isEmpty = meetings.length === 0;

  return (
    <div>
      {isEmpty ? (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '60px 40px',
          textAlign: 'center',
          marginBottom: '32px',
        }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎙</div>
          <h2 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '12px' }}>
            Добро пожаловать в MeetingAI
          </h2>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '480px', margin: '0 auto 24px', lineHeight: '1.6' }}>
            Отправь голосовое сообщение или текст встречи в Telegram бот — и получи структурированные заметки автоматически.
          </p>
          <div style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '360px',
            margin: '0 auto',
            textAlign: 'left',
          }}>
            <p style={{ fontSize: '14px', fontWeight: '600', color: '#475569', marginBottom: '12px' }}>
              Как начать:
            </p>
            {[
              '1. Найди бота в Telegram',
              '2. Отправь /start',
              '3. Запиши или отправь текст встречи',
              '4. Получи результат здесь',
            ].map((step, i) => (
              <p key={i} style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
                {step}
              </p>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          {/* Статистика */}
          <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '16px' }}>
            {[
              { label: 'Всего встреч', value: meetings.length, icon: '📋' },
              { label: 'Открытых задач', value: actionItems.length, icon: '📌' },
            ].map((stat, i) => (
              <div key={i} style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '20px 24px',
                flex: 1,
              }}>
                <div style={{ fontSize: '28px', marginBottom: '4px' }}>{stat.icon}</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#1e293b' }}>
                  {stat.value}
                </div>
                <div style={{ fontSize: '14px', color: '#64748b' }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Последние встречи */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Последние встречи
              </h2>
              <Link to="/meetings" style={{ fontSize: '14px', color: '#4f46e5' }}>
                Все встречи →
              </Link>
            </div>
            {meetings.slice(0, 3).map(m => (
              <MeetingCard key={m.id} meeting={m} />
            ))}
          </div>

          {/* Открытые задачи */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1e293b' }}>
                Открытые задачи
              </h2>
              <Link to="/action-items" style={{ fontSize: '14px', color: '#4f46e5' }}>
                Все задачи →
              </Link>
            </div>
            {actionItems.length === 0 ? (
              <EmptyState icon="✅" title="Все задачи выполнены" description="Новые задачи появятся после обработки встречи" />
            ) : (
              actionItems.slice(0, 5).map(item => (
                <ActionItemRow key={item.id} item={item} onUpdate={fetchData} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}