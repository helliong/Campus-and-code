"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import SupportChatModal from "./SupportChatModal";
import {
  FiBox,
  FiChevronDown,
  FiCreditCard,
  FiMail,
  FiMessageCircle,
  FiMoreHorizontal,
  FiPaperclip,
  FiPhone,
  FiRefreshCw,
  FiSend,
  FiShoppingBag,
  FiUser,
} from "react-icons/fi";
import "./page.scss";

const supportCategories = [
  { id: "orders", label: "Заказы и доставка", icon: FiBox },
  { id: "returns", label: "Возврат и обмен", icon: FiRefreshCw },
  { id: "payments", label: "Оплата и бонусы", icon: FiCreditCard },
  { id: "products", label: "Товары и наличие", icon: FiShoppingBag },
  { id: "account", label: "Аккаунт и профиль", icon: FiUser },
  { id: "other", label: "Другое", icon: FiMoreHorizontal },
];

const popularQuestions = [
  {
    question: "Как отследить мой заказ?",
    answer: "Актуальный статус и детали доставки доступны в разделе «Мои заказы» личного кабинета.",
  },
  {
    question: "Какие сроки доставки?",
    answer: "Срок зависит от города и выбранного способа доставки. Точная дата появится при оформлении заказа.",
  },
  {
    question: "Как вернуть или обменять товар?",
    answer: "Напишите нам номер заказа и причину обращения — специалист поддержки подскажет дальнейшие шаги.",
  },
  {
    question: "Как использовать бонусы?",
    answer: "Доступные бонусы можно применить при оформлении заказа. Ими можно оплатить до 30% покупки.",
  },
  {
    question: "Какие способы оплаты доступны?",
    answer: "Доступные способы оплаты отображаются на странице оформления заказа.",
  },
];

export default function SupportPage() {
  const { data: session } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedCategory, setSelectedCategory] = useState("orders");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [fileName, setFileName] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    setName(session?.user?.name ?? "");
    setEmail(session?.user?.email ?? "");
  }, [session]);

  useEffect(() => {
    const syncChatWithHash = () => setIsChatOpen(window.location.hash === "#chat");
    const handleChatOpen = () => setIsChatOpen(true);
    syncChatWithHash();
    window.addEventListener("hashchange", syncChatWithHash);
    window.addEventListener("support-chat:open", handleChatOpen);

    return () => {
      window.removeEventListener("hashchange", syncChatWithHash);
      window.removeEventListener("support-chat:open", handleChatOpen);
    };
  }, []);

  const openChat = () => {
    window.history.replaceState(null, "", `${window.location.pathname}#chat`);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    window.history.replaceState(null, "", window.location.pathname);
    setIsChatOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      setFileName("");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setFormError("Размер файла не должен превышать 10 МБ.");
      event.target.value = "";
      setFileName("");
      return;
    }

    setFormError("");
    setFileName(file.name);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    setIsSubmitted(false);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setFormError("Заполните имя, email и сообщение.");
      return;
    }

    setIsSubmitted(true);
    setMessage("");
    setFileName("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="support-page">
      <section className="support-card support-topics" aria-labelledby="support-topics-title">
        <div className="support-section-heading">
          <h2 id="support-topics-title">Чем мы можем помочь?</h2>
          <p>Выберите тему вашего вопроса, чтобы мы могли быстрее помочь</p>
        </div>

        <div className="support-category-grid">
          {supportCategories.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              key={id}
              className={`support-category ${selectedCategory === id ? "active" : ""}`}
              onClick={() => setSelectedCategory(id)}
              aria-pressed={selectedCategory === id}
            >
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="support-card support-form-card" aria-labelledby="support-form-title">
        <div className="support-section-heading">
          <h2 id="support-form-title">Напишите нам</h2>
          <p>Заполните форму, и мы ответим вам в ближайшее время</p>
        </div>

        <form className="support-form" onSubmit={handleSubmit}>
          <div className="support-fields-row">
            <label>
              <span>Ваше имя</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Введите ваше имя"
              />
            </label>
            <label>
              <span>E-mail</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </label>
          </div>

          <label>
            <span>Тема обращения</span>
            <div className="support-select-wrapper">
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {supportCategories.map(({ id, label }) => (
                  <option key={id} value={id}>{label}</option>
                ))}
              </select>
              <FiChevronDown aria-hidden="true" />
            </div>
          </label>

          <label>
            <span>Сообщение</span>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Опишите ваш вопрос как можно подробнее..."
              rows={5}
            />
          </label>

          {formError && <p className="support-form-message error">{formError}</p>}
          {isSubmitted && (
            <p className="support-form-message success">
              Форма заполнена. Отправка обращения будет доступна после подключения сервиса поддержки.
            </p>
          )}

          <div className="support-form-actions">
            <div className="support-attachment">
              <input
                ref={fileInputRef}
                type="file"
                id="support-file"
                onChange={handleFileChange}
              />
              <label htmlFor="support-file" className="attachment-button">
                <FiPaperclip aria-hidden="true" />
                Прикрепить файл
              </label>
              <span>{fileName || "До 10 МБ"}</span>
            </div>
            <button type="submit" className="support-submit">
              <FiSend aria-hidden="true" />
              Отправить обращение
            </button>
          </div>
        </form>
      </section>

      <div className="support-bottom-grid">
        <section className="support-card support-faq" aria-labelledby="support-faq-title">
          <h2 id="support-faq-title">Популярные вопросы</h2>
          <div className="faq-list">
            {popularQuestions.map(({ question, answer }) => (
              <details key={question}>
                <summary>
                  {question}
                  <FiChevronDown aria-hidden="true" />
                </summary>
                <p>{answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="support-card support-contacts" aria-labelledby="support-contacts-title">
          <div className="support-section-heading">
            <h2 id="support-contacts-title">Другие способы связи</h2>
            <p>Выберите удобный способ связи с нами</p>
          </div>

          <div className="contact-list">
            <button type="button" className="contact-row" onClick={openChat}>
              <FiMessageCircle aria-hidden="true" />
              <span><strong>Онлайн-чат</strong><small>Быстрые ответы на ваши вопросы</small></span>
              <em>Онлайн</em>
            </button>
            <a href="https://t.me/campuscode_support" className="contact-row" target="_blank" rel="noreferrer">
              <FiSend aria-hidden="true" />
              <span><strong>Telegram</strong><small>@campuscode_support</small></span>
              <em>Онлайн</em>
            </a>
            <a href="mailto:hello@campuscode.ru" className="contact-row">
              <FiMail aria-hidden="true" />
              <span><strong>E-mail</strong><small>hello@campuscode.ru</small></span>
            </a>
            <a href="tel:88001234567" className="contact-row">
              <FiPhone aria-hidden="true" />
              <span><strong>Телефон</strong><small>8 (800) 123-45-67 · ежедневно 10:00–20:00</small></span>
            </a>
          </div>
        </section>
      </div>

      <SupportChatModal isOpen={isChatOpen} onClose={closeChat} />
    </div>
  );
}
