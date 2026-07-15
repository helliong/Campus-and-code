"use client";

import Link from "next/link";
import Image from "next/image";
import { type ComponentType, type MouseEvent, useState } from "react";
import {
  FiChevronRight,
  FiInfo,
  FiMessageCircle,
  FiShoppingBag,
} from "react-icons/fi";
import { LuShirt } from "react-icons/lu";
import { PiHoodie, PiPants, PiTote } from "react-icons/pi";
import "./page.scss";

type SizeCategoryId =
  | "hoodies"
  | "tshirts"
  | "sweatshirts"
  | "pants"
  | "totes"
  | "accessories";

const categories = [
  { id: "hoodies", name: "Худи", icon: PiHoodie, href: "#hoodies" },
  { id: "tshirts", name: "Футболки", icon: LuShirt, href: "#tshirts" },
  { id: "sweatshirts", name: "Свитшоты", icon: PiHoodie, href: "#sweatshirts" },
  { id: "pants", name: "Штаны", icon: PiPants, href: "#pants" },
  { id: "totes", name: "Шопперы", icon: PiTote, href: "#totes" },
  { id: "accessories", name: "Аксессуары", icon: FiShoppingBag, href: "#accessories" },
] satisfies Array<{
  id: SizeCategoryId;
  name: string;
  icon: ComponentType<{ "aria-hidden"?: boolean }>;
  href: `#${SizeCategoryId}`;
}>;

const categoryNames: Record<SizeCategoryId, string> = {
  hoodies: "Худи",
  tshirts: "Футболки",
  sweatshirts: "Свитшоты",
  pants: "Штаны",
  totes: "Шопперы",
  accessories: "Аксессуары",
};

const hoodieSizes = [
  { size: "S", chest: "52-54", length: "66-68", sleeve: "61-63" },
  { size: "M", chest: "55-57", length: "68-70", sleeve: "63-65" },
  { size: "L", chest: "58-60", length: "70-72", sleeve: "65-67" },
  { size: "XL", chest: "61-63", length: "72-74", sleeve: "67-69" },
];

const tshirtSizes = [
  { size: "S", chest: "50-52", length: "66-68", sleeve: "20-21" },
  { size: "M", chest: "53-55", length: "68-70", sleeve: "21-22" },
  { size: "L", chest: "56-58", length: "70-72", sleeve: "22-23" },
  { size: "XL", chest: "59-61", length: "72-74", sleeve: "23-24" },
];

const measureSteps = [
  {
    label: "A",
    title: "Ширина груди",
    text: "Измерьте расстояние между подмышечными впадинами по самой широкой части груди.",
    type: "chest",
  },
  {
    label: "B",
    title: "Длина изделия",
    text: "Измерьте длину от самой высокой точки плеча до нижнего края изделия.",
    type: "length",
  },
  {
    label: "C",
    title: "Длина рукава",
    text: "Измерьте длину рукава от плечевого шва до конца манжеты.",
    type: "sleeve",
  },
];

export default function SizesPage() {
  const [selectedCategory, setSelectedCategory] =
    useState<SizeCategoryId>("hoodies");

  const handleCategoryClick = (
    event: MouseEvent<HTMLAnchorElement>,
    id: SizeCategoryId,
  ) => {
    event.preventDefault();
    window.history.replaceState(null, "", `#${id}`);
    setSelectedCategory(id);
  };

  return (
    <main className="sizes-page">
      <div className="sizes-header">
        <nav className="breadcrumbs" aria-label="Навигация">
          <Link href="/">Главная</Link>
          <FiChevronRight className="separator" aria-hidden="true" />
          <span>Таблица размеров</span>
        </nav>

        <h1>Таблица размеров</h1>
        <p>
          Чтобы выбрать идеальный размер, измерьте себя и сравните с таблицами
          ниже.
        </p>
      </div>

      <section className="size-tabs" aria-label="Категории размеров">
        {categories.map(({ id, name, icon: Icon, href }) => (
          <Link
            className={`size-tab ${selectedCategory === id ? "active" : ""}`}
            href={href}
            key={name}
            onClick={(event) => handleCategoryClick(event, id)}
          >
            <Icon aria-hidden="true" />
            <span>{name}</span>
          </Link>
        ))}
      </section>

      {selectedCategory === "hoodies" && (
      <section className="sizes-main" id="hoodies">
        <div className="sizes-table-section">
          <h2>Худи унисекс</h2>
          <p>Все измерения указаны в сантиметрах.</p>

          <div className="sizes-table-wrap">
            <table className="sizes-table">
              <thead>
                <tr>
                  <th>Размер</th>
                  <th>Ширина груди (A)</th>
                  <th>Длина изделия (B)</th>
                  <th>Длина рукава (C)</th>
                </tr>
              </thead>
              <tbody>
                {hoodieSizes.map((item) => (
                  <tr key={item.size}>
                    <td>{item.size}</td>
                    <td>{item.chest}</td>
                    <td>{item.length}</td>
                    <td>{item.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="size-note">
            <FiInfo aria-hidden="true" />
            <div>
              <strong>Допустимое отклонение: +/-2 см</strong>
              <span>
                Размер может незначительно отличаться в зависимости от модели.
              </span>
            </div>
          </div>
        </div>

        <div className="size-visual" aria-label="Схема измерений худи">
          <Image
            className="size-image-light"
            src="/size-guide-hoodie-light.webp"
            alt="Схема измерений худи"
            width={1256}
            height={1256}
            priority
          />
          <Image
            className="size-image-dark"
            src="/size-guide-hoodie-transparent.webp"
            alt="Схема измерений худи"
            width={1256}
            height={1256}
            priority
          />
        </div>
      </section>
      )}

      {selectedCategory === "tshirts" && (
      <section className="sizes-main sizes-main--tshirt" id="tshirts">
        <div className="sizes-table-section">
          <h2>Футболки унисекс</h2>
          <p>Все измерения указаны в сантиметрах. Для свободной посадки выбирайте больший размер.</p>

          <div className="sizes-table-wrap">
            <table className="sizes-table">
              <thead>
                <tr>
                  <th>Размер</th>
                  <th>Ширина груди (A)</th>
                  <th>Длина изделия (B)</th>
                  <th>Длина рукава (C)</th>
                </tr>
              </thead>
              <tbody>
                {tshirtSizes.map((item) => (
                  <tr key={item.size}>
                    <td>{item.size}</td>
                    <td>{item.chest}</td>
                    <td>{item.length}</td>
                    <td>{item.sleeve}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="size-note">
            <FiInfo aria-hidden="true" />
            <div>
              <strong>Если сомневаетесь между двумя размерами, выбирайте больший</strong>
              <span>Футболка будет сидеть свободнее и комфортнее после стирки.</span>
            </div>
          </div>
        </div>

        <div className="size-visual" aria-label="Схема измерений футболки">
          <Image
            className="size-image-light"
            src="/size-guide-tshirt-light.webp"
            alt="Схема измерений футболки"
            width={1256}
            height={1256}
          />
          <Image
            className="size-image-dark"
            src="/size-guide-tshirt-transparent.webp"
            alt="Схема измерений футболки"
            width={1256}
            height={1256}
          />
        </div>
      </section>
      )}

      {selectedCategory !== "hoodies" && selectedCategory !== "tshirts" && (
        <section className="sizes-empty-state" id={selectedCategory}>
          <FiInfo aria-hidden="true" />
          <div>
            <h2>{categoryNames[selectedCategory]}</h2>
            <p>
              Таблица размеров для этой категории появится позже. Если сомневаетесь
              в размере, напишите в поддержку.
            </p>
          </div>
        </section>
      )}

      <section className="measure-section">
        <h2>Как снять мерки</h2>
        <div className="measure-grid">
          {measureSteps.map((step) => (
            <article className="measure-card" key={step.label}>
              <div className="measure-copy">
                <span className="measure-label">{step.label}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </div>
              </div>
              <div className={`measure-figure ${step.type}`} aria-hidden="true">
                {step.type === 'chest' && (
                  <svg viewBox="0 0 200 130" style={{ width: '100%', height: '100%', position: 'absolute', bottom: 0, left: 0 }}>
                    <defs>
                      <marker id="chestArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#5c8af0" />
                      </marker>
                      <marker id="chestArrowStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 10 1 L 2 5 L 10 9 z" fill="#5c8af0" />
                      </marker>
                    </defs>
                    <g stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                      <path d="M 85 10 C 85 20, 75 25, 55 30 C 40 33, 30 45, 25 70 C 20 95, 15 130, 15 130" />
                      <path d="M 115 10 C 115 20, 125 25, 145 30 C 160 33, 170 45, 175 70 C 180 95, 185 130, 185 130" />
                      <path d="M 55 65 C 50 90, 45 120, 42 130" />
                      <path d="M 55 65 C 57 90, 60 120, 60 130" />
                      <path d="M 145 65 C 150 90, 155 120, 158 130" />
                      <path d="M 145 65 C 143 90, 140 120, 140 130" />
                    </g>
                    <line x1="57" y1="72" x2="143" y2="72" stroke="#5c8af0" strokeWidth="2.5" strokeDasharray="6 4" markerStart="url(#chestArrowStart)" markerEnd="url(#chestArrow)" />
                  </svg>
                )}
                {step.type === 'length' && (
                  <svg viewBox="0 0 200 130" style={{ width: '100%', height: '100%', position: 'absolute', bottom: 0, left: 0 }}>
                    <defs>
                      <marker id="lengthArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#5c8af0" />
                      </marker>
                      <marker id="lengthArrowStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 10 1 L 2 5 L 10 9 z" fill="#5c8af0" />
                      </marker>
                    </defs>
                    <g stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                      <path d="M 85 10 C 85 20, 75 25, 55 30 C 40 33, 30 45, 25 70 C 20 95, 15 130, 15 130" />
                      <path d="M 115 10 C 115 20, 125 25, 145 30 C 160 33, 170 45, 175 70 C 180 95, 185 130, 185 130" />
                      <path d="M 55 65 C 50 90, 45 120, 42 130" />
                      <path d="M 55 65 C 57 90, 60 120, 60 130" />
                      <path d="M 145 65 C 150 90, 155 120, 158 130" />
                      <path d="M 145 65 C 143 90, 140 120, 140 130" />
                    </g>
                    <line x1="85" y1="15" x2="85" y2="125" stroke="#5c8af0" strokeWidth="2.5" strokeDasharray="6 4" markerStart="url(#lengthArrowStart)" markerEnd="url(#lengthArrow)" />
                  </svg>
                )}
                {step.type === 'sleeve' && (
                  <svg viewBox="0 0 200 130" style={{ width: '100%', height: '100%', position: 'absolute', bottom: 0, left: 0 }}>
                    <defs>
                      <marker id="sleeveArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 1 L 8 5 L 0 9 z" fill="#5c8af0" />
                      </marker>
                      <marker id="sleeveArrowStart" viewBox="0 0 10 10" refX="2" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 10 1 L 2 5 L 10 9 z" fill="#5c8af0" />
                      </marker>
                    </defs>
                    <g stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
                      <path d="M 85 10 C 85 20, 75 25, 55 30 C 40 33, 30 45, 25 70 C 20 95, 15 130, 15 130" />
                      <path d="M 115 10 C 115 20, 125 25, 145 30 C 160 33, 170 45, 175 70 C 180 95, 185 130, 185 130" />
                      <path d="M 55 65 C 50 90, 45 120, 42 130" />
                      <path d="M 55 65 C 57 90, 60 120, 60 130" />
                      <path d="M 145 65 C 150 90, 155 120, 158 130" />
                      <path d="M 145 65 C 143 90, 140 120, 140 130" />
                    </g>
                    <path d="M 123 2 C 133 12, 153 17, 168 35 C 180 50, 192 85, 195 125" fill="none" stroke="#5c8af0" strokeWidth="2.5" strokeDasharray="6 4" markerStart="url(#sleeveArrowStart)" markerEnd="url(#sleeveArrow)" />
                  </svg>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="support-banner">
        <div className="support-copy">
          <FiInfo aria-hidden="true" />
          <div>
            <h2>Не уверены в размере?</h2>
            <p>Напишите нам в чат поддержки - мы поможем подобрать размер.</p>
          </div>
        </div>
        <Link className="support-link" href="/">
          <FiMessageCircle aria-hidden="true" />
          <span>Чат поддержки</span>
        </Link>
      </section>
    </main>
  );
}
