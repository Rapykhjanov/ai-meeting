import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { meetingsAPI } from '../api/client';
import ActionItemRow from '../components/ActionItemRow';

export default function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTranscript, setShowTranscript] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const fetchMeeting = async () => {
    try {
      const res = await meetingsAPI.getOne(id);
      setMeeting(res.data);
      setEditData({
        summary: res.data.analysis?.summary || '',
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeeting(); }, [id]);

  const handleSave = async () => {
    try {
      await meetingsAPI.updateAnalysis(id, editData);
      setEditing(false);
      fetchMeeting();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Загрузка...</div>
  );

  if (!meeting) return (
    <div style={{ textAlign: 'center', padding: '80px', color: '#94a3b8' }}>Встреча не найдена</div>
  );

  const analysis = meeting.analysis;

  return (
    <div>
      {/* Шапка */}
      <div style={{ marginBottom: '24px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', color: '#64748b', fontSize: '14px', marginBottom: '12px' }}
        >
          ← Назад
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px' }}>
              {meeting.title || 'Встреча без названия'}
            </h1>
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>
              {format(new Date(meeting.created_at), 'd MMMM yyyy, HH:mm', { locale: ru })}
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            style={{
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              border: '1px solid #e2e8f0',
              backgroundColor: editing ? '#fef2f2' : '#ffffff',
              color: editing ? '#dc2626' : '#475569',
            }}
          >
            {editing ? 'Отмена' : '✏️ Редактировать'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* Резюме */}
        <div style={{
          gridColumn: '1 / -1',
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            📝 Резюме
          </h2>
          {editing ? (
            <div>
              <textarea
                value={editData.summary}
                onChange={e => setEditData({ ...editData, summary: e.target.value })}
                style={{
                  width: '100%',
                  minHeight: '120px',
                  padding: '12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '14px',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  marginTop: '12px',
                  padding: '8px 20px',
                  backgroundColor: '#4f46e5',
                  color: '#ffffff',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Сохранить
              </button>
            </div>
          ) : (
            <p style={{ fontSize: '15px', color: '#475569', lineHeight: '1.7' }}>
              {analysis?.summary || 'Резюме недоступно'}
            </p>
          )}
        </div>

        {/* Решения */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            ✅ Решения
          </h2>
          {meeting.decisions?.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Решения не зафиксированы</p>
          ) : (
            meeting.decisions?.map((d, i) => (
              <div key={i} style={{
                padding: '10px 14px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                marginBottom: '8px',
                fontSize: '14px',
                color: '#475569',
                borderLeft: '3px solid #4f46e5',
              }}>
                {d.text}
              </div>
            ))
          )}
        </div>

        {/* Темы */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            🗂 Темы
          </h2>
          {analysis?.topics?.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Темы не определены</p>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {analysis?.topics?.map((topic, i) => (
                <span key={i} style={{
                  padding: '6px 14px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: '500',
                }}>
                  {topic}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Задачи */}
        <div style={{ gridColumn: '1 / -1', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '12px' }}>
            📌 Задачи
          </h2>
          {meeting.action_items?.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#94a3b8' }}>Задачи не найдены</p>
          ) : (
            meeting.action_items?.map(item => (
              <ActionItemRow key={item.id} item={item} onUpdate={fetchMeeting} />
            ))
          )}
        </div>

        {/* Транскрипт */}
        {meeting.transcript && (
          <div style={{ gridColumn: '1 / -1', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' }}>
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              style={{
                background: 'none',
                fontSize: '16px',
                fontWeight: '600',
                color: '#1e293b',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📄 Транскрипт {showTranscript ? '▲' : '▼'}
            </button>
            {showTranscript && (
              <p style={{
                marginTop: '16px',
                fontSize: '14px',
                color: '#64748b',
                lineHeight: '1.8',
                whiteSpace: 'pre-wrap',
              }}>
                {meeting.transcript}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}