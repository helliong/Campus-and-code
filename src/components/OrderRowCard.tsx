import Image from "next/image";
import Link from "next/link";
import "./OrderRowCard.scss";

export interface OrderRowProps {
  id: string;
  orderNumber: string;
  date: string;
  status: "delivered" | "in_transit" | "cancelled";
  itemCount: number;
  totalPrice: number;
  imageUrl: string;
}

export default function OrderRowCard({
  id,
  orderNumber,
  date,
  status,
  itemCount,
  totalPrice,
  imageUrl,
}: OrderRowProps) {
  const formatPrice = (price: number) => {
    return price.toLocaleString("ru-RU") + " ₽";
  };

  const getStatusDisplay = () => {
    switch (status) {
      case "delivered":
        return { text: "Доставлен", className: "status-delivered" };
      case "in_transit":
        return { text: "В пути", className: "status-in-transit" };
      case "cancelled":
        return { text: "Отменён", className: "status-cancelled" };
      default:
        return { text: status, className: "" };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="order-row-card">
      <div className="order-image-wrapper">
        <Image src={imageUrl} alt={`Заказ ${orderNumber}`} fill sizes="80px" className="order-image" />
      </div>
      
      <div className="order-info-main">
        <div className="order-header">
          <span className="order-number">Заказ №{orderNumber}</span>
          <span className="order-date">{date}</span>
          <span className={`order-status ${statusDisplay.className}`}>
            {statusDisplay.text}
          </span>
        </div>
        <p className="order-summary">
          {itemCount} {itemCount === 1 ? "товар" : itemCount > 1 && itemCount < 5 ? "товара" : "товаров"} на сумму {formatPrice(totalPrice)}
        </p>
      </div>

      <div className="order-actions">
        <span className="order-total-price">{formatPrice(totalPrice)}</span>
        <Link href={`/profile/orders/${id}`} className="details-btn">
          Подробнее
        </Link>
      </div>
    </div>
  );
}
