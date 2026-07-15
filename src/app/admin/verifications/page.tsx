"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

type RequestType = {
  id: string;
  userId: string;
  universityId: string;
  documentUrl: string;
  status: string;
  createdAt: string;
  user: { name: string; email: string; };
  university: { name: string; shortName: string; };
};

export default function AdminVerificationsPage() {
  const [requests, setRequests] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/verifications");
      if (res.ok) {
        setRequests(await res.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (id: string, status: "APPROVED" | "REJECTED") => {
    try {
      const res = await fetch("/api/admin/verifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: id, status })
      });
      if (res.ok) {
        setRequests(requests.filter(req => req.id !== id));
      }
    } catch (err) {
      console.error("Error updating", err);
    }
  };

  if (loading) return <div>Загрузка заявок...</div>;

  return (
    <div>
      <div className="admin-header">
        <h1>Заявки на подтверждение статуса студента</h1>
      </div>

      <div style={{ marginTop: '2rem' }}>
        {requests.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>Нет новых заявок на рассмотрение.</p>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
            {requests.map(req => (
              <div key={req.id} style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <h3 style={{ margin: 0 }}>{req.user.name || "Без имени"}</h3>
                  <p style={{ margin: '0.2rem 0', color: 'var(--text-secondary)' }}>{req.user.email}</p>
                  <p style={{ margin: '0.5rem 0', fontWeight: 500, color: 'var(--accent-color)' }}>Вуз: {req.university.name}</p>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(req.createdAt).toLocaleString('ru-RU')}
                  </p>
                </div>
                
                {req.documentUrl && (
                  <div style={{ marginBottom: '1.5rem', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                    <a href={req.documentUrl} target="_blank" rel="noreferrer">
                      <Image 
                        src={req.documentUrl} 
                        alt="Студенческий" 
                        width={300} 
                        height={200}
                        style={{ width: '100%', height: 'auto', objectFit: 'cover' }}
                      />
                    </a>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                    style={{ flex: 1, padding: '0.6rem', background: '#2A9D8F', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Одобрить
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                    style={{ flex: 1, padding: '0.6rem', background: '#E63946', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 500 }}
                  >
                    Отклонить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
