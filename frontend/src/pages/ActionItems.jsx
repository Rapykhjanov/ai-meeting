import { useState, useEffect } from 'react';
import { actionItemsAPI } from '../api/client';
import ActionItemRow from '../components/ActionItemRow';
import EmptyState from '../components/EmptyState';

const STATUSES = [
  { value: '', label: 'Все' },
  { value: 'todo', label: 'Нужно сделать' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'done', label: 'Готово' },
];

export default function ActionItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const res = await actionItemsAPI.getAll(params);
      setItems(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, [statusFilter]);

  // Группировка по ответственному
  const grouped = items.reduce((acc, item) => {
    const key = item.assignee || 'Без ответственного';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b' }}>
          Все задачи
        </h1>

        <div style={{ display: 'flex', gap: '8px' }}>
          {STATUSES.map(s => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '500',
                border: '1px solid',
                borderColor: statusFilter === s.value ? '#4f46e5' : '#e2e8f0',
                backgroundColor: statusFilter === s.value ? '#eef2ff' : '#ffffff',
                color: statusFilter === s.value ? '#4f46e5' : '#64748b',
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Загрузка...</div>
      ) : items.length === 0 ? (
        <EmptyState
          icon="📌"
          title="Задач нет"
          description="Задачи появятся автоматически после обработки встречи"
        />
      ) : (
        Object.entries(grouped).map(([assignee, assigneeItems]) => (
          <div key={assignee} style={{ marginBottom: '32px' }}>
            <h2 style={{
              fontSize: '15px',
              fontWeight: '600',
              color: '#475569',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              👤 {assignee}
              <span style={{
                backgroundColor: '#f1f5f9',
                color: '#64748b',
                borderRadius: '999px',
                padding: '2px 10px',
                fontSize: '12px',
              }}>
                {assigneeItems.length}
              </span>
            </h2>
            {assigneeItems.map(item => (
              <ActionItemRow key={item.id} item={item} onUpdate={fetchItems} />
            ))}
          </div>
        ))
      )}
    </div>
  );
}
