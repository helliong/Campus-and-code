import "./page.scss";
import { mockProducts } from "../lib/mockData";
import ProductCard from "../components/ProductCard";
import Image from "next/image";
import Link from "next/link";
import { FiFeather, FiGift, FiTruck } from "react-icons/fi";
import { LuLeaf, LuPenTool, LuTruck, LuStar } from "react-icons/lu";

const categories = [
  {
    name: "Худи",
    count: 23,
    id: "hoodie",
    imageLight: "/category-hoodie-premium.png",
    imageDark: "/category-hoodie-white-premium.png",
  },
  {
    name: "Футболки",
    count: 34,
    id: "tshirt",
    imageLight: "/category-tshirt-premium.png",
    imageDark: "/category-tshirt-white-premium.png",
  },
  {
    name: "Стикеры",
    count: 28,
    id: "sticker",
    imageLight: "/category-stickers-premium.png",
    imageDark: "/category-stickers-white-premium3.png",
  },
  {
    name: "Аксессуары",
    count: 42,
    id: "accessories",
    imageLight: "/category-accessories-premium.png",
    imageDark: "/category-accessories-white-premium.png",
  },
  {
    name: "Университеты",
    count: 36,
    id: "universities",
    image: "/category-university-grey.png",
  },
  {
    name: "IT-команды",
    count: 18,
    id: "teams",
    imageLight: "/category-teams-premium.png",
    imageDark: "/category-teams-white-premium.png",
  },
];

export default function Home() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Мерч для тех,
            <br />
            кто учится, кодит
            <br />и создает
          </h1>
          <p className="hero-subtitle">
            Стильная университетская и IT-атрибутика
            <br />
            для вдохновения каждый день.
          </p>
          <div className="hero-actions">
            <Link href="/catalog" className="btn-primary">
              Смотреть каталог
            </Link>
            <Link href="#collections" className="btn-outline">
              Коллекции
            </Link>
          </div>

          <div className="hero-features">
            <div className="feature-item">
              <FiFeather />
              <span>
                Качественные
                <br />
                материалы
              </span>
            </div>
            <div className="feature-item">
              <FiGift />
              <span>
                Лимитированные
                <br />
                коллекции
              </span>
            </div>
            <div className="feature-item">
              <FiTruck />
              <span>
                Доставка
                <br />
                по России
              </span>
            </div>
          </div>
        </div>

        <div className="hero-image-wrapper">
          <Image
            src="/hero-mockup-transparent.png"
            alt="Campus & Code Merch"
            width={900}
            height={700}
            priority
            className="hero-img-element"
            unoptimized
          />
        </div>
      </section>

      <section className="categories-section" id="collections">
        <div className="categories-grid">
          {categories.map((cat) => (
            <Link
              href={`/catalog?category=${cat.id}`}
              key={cat.id}
              className="category-card"
            >
              <div className="category-image-placeholder">
                {cat.imageLight && cat.imageDark ? (
                  <>
                    <Image
                      src={cat.imageLight}
                      alt={cat.name}
                      fill
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                      className="img-light-theme"
                    />
                    <Image
                      src={cat.imageDark}
                      alt={cat.name}
                      fill
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                      className="img-dark-theme"
                    />
                  </>
                ) : cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                ) : (
                  <div className="placeholder-bg"></div>
                )}
              </div>
              <div className="category-info">
                <h3>{cat.name}</h3>
                <p>
                  {cat.count}{" "}
                  {cat.count % 10 === 1 && cat.count % 100 !== 11
                    ? "товар"
                    : [2, 3, 4].includes(cat.count % 10) &&
                        ![12, 13, 14].includes(cat.count % 100)
                      ? "товара"
                      : "товаров"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="catalog-section" id="catalog">
        <div className="section-header">
          <h2>Популярные товары</h2>
          <Link href="/catalog" className="view-all">
            Смотреть все &rarr;
          </Link>
        </div>
        <div className="product-grid">
          {mockProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      <section className="promo-banners-section">
        <Link href="/catalog?category=universities" className="promo-banner">
          <Image
            src="/banner-one.png"
            alt="Коллекции университетов"
            width={800}
            height={380}
            unoptimized
          />
          <span className="promo-banner-content">
            <span className="promo-banner-title">
              Коллекции
              <br />
              университетов
            </span>
            <span className="promo-banner-subtitle">
              Поддерживай свой вуз стильно
            </span>
            <span className="promo-banner-button">Смотреть коллекции</span>
          </span>
        </Link>
        <Link href="/catalog?category=teams" className="promo-banner">
          <Image
            src="/banner-two.png"
            alt="IT-коллекции для разработчиков"
            width={800}
            height={380}
            unoptimized
          />
          <span className="promo-banner-content">
            <span className="promo-banner-title">
              IT-коллекции
              <br />
              для разработчиков
            </span>
            <span className="promo-banner-subtitle">
              Минимализм. Функциональность. Ты.
            </span>
            <span className="promo-banner-button">Смотреть коллекции</span>
          </span>
        </Link>
      </section>

      <section className="features-section">
        <div className="features-container">
          <div className="feature-item">
            <div className="feature-icon">
              <LuLeaf />
            </div>
            <div className="feature-text">
              <h4>Качественные материалы</h4>
              <p>Ткань, принты и фурнитура премиального качества.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <LuPenTool />
            </div>
            <div className="feature-text">
              <h4>Минималистичный дизайн</h4>
              <p>Чистые формы и внимание к деталям.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <LuTruck />
            </div>
            <div className="feature-text">
              <h4>Доставка по России</h4>
              <p>Быстро и надежно доставим ваш заказ.</p>
            </div>
          </div>
          <div className="feature-item">
            <div className="feature-icon">
              <LuStar />
            </div>
            <div className="feature-text">
              <h4>Лимитированные коллекции</h4>
              <p>Уникальные дропы в ограниченном количестве.</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
