import { useState, useEffect } from 'react';
import { meetingsAPI } from '../api/client';
import MeetingCard from '../components/MeetingCard';
import EmptyState from '../components/EmptyState';

export default function Meetings() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (dateFrom) params.date_from = dateFrom;
      if (dateTo) params.date_to = dateTo;
      const res = await meetingsAPI.getAll(params);
      setMeetings(res.data.results || res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeetings(); }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMeetings();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '16px' }}>
          Все встречи
        </h1>

        {/* Фильтры */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Поиск по встречам..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1,
              minWidth: '200px',
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
            }}
          />
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
            }}
          />
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            style={{
              padding: '10px 16px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              backgroundColor: '#ffffff',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '10px 24px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
            }}
          >
            Найти
          </button>
        </form>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Загрузка...</div>
      ) : meetings.length === 0 ? (
        <EmptyState
          icon="📋"
          title="Встречи не найдены"
          description="Попробуй изменить параметры поиска или отправь первую встречу в бот"
        />
      ) : (
        meetings.map(m => <MeetingCard key={m.id} meeting={m} />)
      )}
    </div>
  );
}