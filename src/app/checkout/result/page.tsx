import CheckoutResultClient from "./CheckoutResultClient";
import "./page.scss";

export default async function CheckoutResultPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  return <CheckoutResultClient orderId={orderId || ""} />;
}
