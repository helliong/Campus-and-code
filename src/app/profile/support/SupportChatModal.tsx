"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  FiBox,
  FiClock,
  FiCreditCard,
  FiHeadphones,
  FiMoreHorizontal,
  FiPaperclip,
  FiSend,
  FiShoppingBag,
  FiUser,
  FiX,
} from "react-icons/fi";
import "./SupportChatModal.scss";

type SupportChatModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ChatMessage = {
  id: number;
  text: string;
  time: string;
  direction: "incoming" | "outgoing";
};

const chatTopics = [
  { id: "orders", title: "Заказы и доставка", description: "Статус заказа, доставка, возврат", icon: FiBox },
  { id: "payments", title: "Оплата и бонусы", description: "Оплата заказа, бонусы и скидки", icon: FiCreditCard },
  { id: "products", title: "Товары и наличие", description: "Характеристики, размеры, наличие", icon: FiShoppingBag },
  { id: "account", title: "Аккаунт и профиль", description: "Личные данные, настройки", icon: FiUser },
  { id: "other", title: "Другое", description: "Другие вопросы", icon: FiMoreHorizontal },
];

const initialMessages: ChatMessage[] = [
  {
    id: 1,
    text: "Здравствуйте! 👋\nМы здесь, чтобы помочь. Опишите, пожалуйста, ваш вопрос, и мы постараемся ответить как можно быстрее.",
    time: "10:24",
    direction: "incoming",
  },
];

const getCurrentTime = () => new Intl.DateTimeFormat("ru-RU", {
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date());

export default function SupportChatModal({ isOpen, onClose }: SupportChatModalProps) {
  const [selectedTopic, setSelectedTopic] = useState("orders");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);
  const responseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => inputRef.current?.focus());

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => () => {
    if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
  }, []);

  const sendMessage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setMessages((current) => [
      ...current,
      { id: Date.now(), text, time: getCurrentTime(), direction: "outgoing" },
    ]);
    setDraft("");

    if (responseTimerRef.current) clearTimeout(responseTimerRef.current);
    responseTimerRef.current = setTimeout(() => {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          text: "Спасибо за сообщение! Мы получили ваш вопрос. Специалист поддержки подключится к диалогу в ближайшее время.",
          time: getCurrentTime(),
          direction: "incoming",
        },
      ]);
    }, 900);
  };

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="support-chat-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="support-chat-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-chat-title"
      >
        <header className="chat-modal-header">
          <div>
            <h2 id="support-chat-title">Связаться в чате</h2>
            <p>Мы онлайн и готовы помочь</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть чат">
            <FiX aria-hidden="true" />
          </button>
        </header>

        <div className="chat-modal-body">
          <aside className="chat-topics-panel">
            <h3>Выберите тему</h3>
            <div className="chat-topic-list">
              {chatTopics.map(({ id, title, description, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={`chat-topic ${selectedTopic === id ? "active" : ""}`}
                  onClick={() => setSelectedTopic(id)}
                >
                  <span className="chat-topic-icon"><Icon aria-hidden="true" /></span>
                  <span><strong>{title}</strong><small>{description}</small></span>
                </button>
              ))}
            </div>

            <div className="chat-info-card">
              <span className="online-indicator" aria-hidden="true" />
              <span><strong>Мы онлайн</strong><small>Среднее время ответа — 2 минуты</small></span>
            </div>
            <div className="chat-info-card">
              <FiClock aria-hidden="true" />
              <span><strong>Время работы поддержки</strong><small>Ежедневно с 10:00 до 20:00</small></span>
            </div>
          </aside>

          <section className="chat-conversation">
            <div className="chat-operator-bar">
              <span className="operator-avatar"><FiHeadphones aria-hidden="true" /></span>
              <span><strong>Поддержка Campus &amp; Code</strong><small><i /> Онлайн</small></span>
              <FiMoreHorizontal aria-hidden="true" />
            </div>

            <div className="chat-messages" ref={messagesRef} aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`chat-message ${message.direction}`}>
                  <p>{message.text}</p>
                  <span>{message.time}{message.direction === "outgoing" && " ✓✓"}</span>
                </div>
              ))}
            </div>

            <form className="chat-composer" onSubmit={sendMessage}>
              <label className="chat-attachment" aria-label="Прикрепить файл">
                <FiPaperclip aria-hidden="true" />
                <input type="file" />
              </label>
              <input
                ref={inputRef}
                type="text"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Введите сообщение..."
                aria-label="Сообщение"
              />
              <button type="submit" aria-label="Отправить сообщение" disabled={!draft.trim()}>
                <FiSend aria-hidden="true" />
              </button>
            </form>
          </section>
        </div>

        <footer className="chat-modal-footer">
          Если чат не помогает, напишите нам на почту
          <a href="mailto:hello@campuscode.ru">hello@campuscode.ru</a>
        </footer>
      </div>
    </div>,
    document.body,
  );
}
