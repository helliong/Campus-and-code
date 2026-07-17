"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import "./page.scss";
import { getPublicUniversities } from "@/actions/products";

export default function VerifyPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"email" | "document">("document");
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  
  const [universities, setUniversities] = useState<any[]>([]);
  const [selectedUnivId, setSelectedUnivId] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    getPublicUniversities().then(setUniversities);
  }, []);

  // Removing old file handlers

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("purpose", "verification-document");
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    if (!res.ok) throw new Error("Ошибка загрузки файла");
    const data = await res.json();
    return data.url;
  };

  const handleSubmit = async () => {
    if (activeTab === "document") {
      if (!selectedUnivId) return setError("Выберите вуз");
      if (!documentFile) return setError("Загрузите фото студенческого билета");
      if (!confirmed) return setError("Подтвердите, что документ принадлежит вам");
      
      setIsSubmitting(true);
      setError("");
      try {
        const documentUrl = await uploadFile(documentFile);
        
        const combinedUrl = documentUrl;
        
        const res = await fetch("/api/user/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universityId: selectedUnivId, documentUrl: combinedUrl })
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка отправки");
        
        router.push("/profile");
      } catch (err: any) {
        setError(err.message || "Ошибка");
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Logic for email tab (if they want to manually trigger it)
      if (!selectedUnivId) return setError("Выберите вуз");
      setIsSubmitting(true);
      setError("");
      try {
        const res = await fetch("/api/user/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ universityId: selectedUnivId, documentUrl: "" })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Ошибка отправки");
        router.push("/profile");
      } catch(err: any) {
        setError(err.message || "Ошибка");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  if (status === "loading") return <div style={{ padding: "2rem" }}>Загрузка...</div>;

  const getInitials = () => {
    if (!session?.user?.name) return "US";
    return session.user.name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="verify-page-wrapper">
      <div className="verify-page-container">
        <div className="verify-breadcrumbs">
          <Link href="/">Главная</Link> &gt; <Link href="/profile">Профиль</Link> &gt; <span>Подтверждение студента</span>
        </div>

      <div className="verify-header">
        <h1>Подтверждение статуса студента</h1>
        <p>Сейчас у вас статус «Исследователь». После подтверждения вы получите статус «Студент» и студенческую скидку.</p>
      </div>

      <div className="verify-tabs">
        <button 
          className={activeTab === "email" ? "active" : ""} 
          onClick={() => setActiveTab("email")}
        >
          Корпоративная почта
        </button>
        <button 
          className={activeTab === "document" ? "active" : ""} 
          onClick={() => setActiveTab("document")}
        >
          Студенческий билет
        </button>
      </div>

      <div className="verify-content-grid">
        <div className="verify-left-pane">
          
          <div className="status-change-card">
            <div className="user-info">
              <div className="avatar">{getInitials()}</div>
              <div>
                <div className="name">{session?.user?.name || "Без имени"}</div>
                <div className="email">{session?.user?.email}</div>
              </div>
            </div>
            
            <div className="current-status">Исследователь</div>
            
            <svg className="arrow-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            
            <div className="target-status">
              <div className="role-title">Студент</div>
              <div className="role-discount">+ скидка 10%</div>
            </div>
          </div>

          <div className="upload-section">
            <h3>Университет</h3>
            <select 
              className="univ-select"
              value={selectedUnivId}
              onChange={e => setSelectedUnivId(e.target.value)}
            >
              <option value="">Выберите ваш университет</option>
              {universities.map(u => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>

            {activeTab === "document" ? (
              <>
                <h3 style={{ marginTop: '1.5rem' }}>Загрузите студенческий билет</h3>
                <label className={`upload-dropzone ${documentFile ? 'has-file' : ''}`} style={{ display: 'block', borderColor: documentFile ? '#4ea0f5' : '' }}>
                  {documentFile ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ color: '#4ea0f5', wordBreak: 'break-all' }}>{documentFile.name}</span>
                      <button onClick={(e) => { e.preventDefault(); setDocumentFile(null); }} style={{ padding: '0.5rem 1rem', background: '#1d2735', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Удалить файл</button>
                    </div>
                  ) : (
                    <>
                      <input type="file" onChange={e => { if (e.target.files?.[0]) setDocumentFile(e.target.files[0]) }} accept="image/*,.pdf" hidden />
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>Нажмите или перетащите фото/PDF студенческого билета<br/><span>JPG, PNG или PDF до 10 МБ</span></p>
                    </>
                  )}
                </label>

                <label className="confirm-checkbox">
                  <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />
                  <span>Я подтверждаю, что документ принадлежит мне</span>
                </label>
              </>
            ) : (
              <div style={{ marginTop: '1.5rem', color: 'var(--text-secondary)' }}>
                <p>Если вы зарегистрированы с корпоративной почты университета, статус будет присвоен автоматически без необходимости загрузки документов. Просто нажмите «Отправить на проверку».</p>
              </div>
            )}
            
            {error && <div className="error-message">{error}</div>}

            <div className="action-buttons">
              <button className="btn-cancel" onClick={() => router.push('/profile')}>Загрузить позже</button>
              <button className="btn-submit" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Отправка..." : "Отправить на проверку"}
              </button>
            </div>
          </div>
        </div>

        <div className="verify-right-pane">
          <div className="info-card">
            <h3>Как это работает</h3>
            <div className="step">
              <div className="step-num">1</div>
              <div className="step-text">
                <h4>Загрузите студенческий билет</h4>
                <p>Прикрепите фото или скан обеих сторон вашего студенческого билета.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">2</div>
              <div className="step-text">
                <h4>Мы проверим данные</h4>
                <p>Наша команда проверит документ в течение 1–2 рабочих дней.</p>
              </div>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <div className="step-text">
                <h4>Получите статус Студент и скидку</h4>
                <p>После подтверждения вам будет доступна студенческая скидка 10%.</p>
              </div>
            </div>
          </div>

          <div className="security-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 12l2 2 4-4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <p>Документ используется только для верификации и не отображается публично.</p>
          </div>

          <div className="support-card">
            <h3>Нужна помощь?</h3>
            <p>Если у вас остались вопросы, мы всегда на связи.</p>
            <Link href="#">Напишите в поддержку</Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
