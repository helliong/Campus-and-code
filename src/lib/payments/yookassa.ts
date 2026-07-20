const DEFAULT_API_URL = "https://api.yookassa.ru/v3";

type YooKassaAmount = {
  value: string;
  currency: string;
};

export type YooKassaPayment = {
  id: string;
  status: "pending" | "waiting_for_capture" | "succeeded" | "canceled";
  paid: boolean;
  test: boolean;
  amount: YooKassaAmount;
  confirmation?: { type: string; confirmation_url?: string };
  metadata?: Record<string, string>;
  cancellation_details?: { party?: string; reason?: string };
};

export type YooKassaRefund = {
  id: string;
  status: "pending" | "succeeded" | "canceled";
  amount: YooKassaAmount;
  payment_id: string;
  cancellation_details?: { party?: string; reason?: string };
};

function getConfig() {
  const shopId = process.env.YOOKASSA_SHOP_ID?.trim();
  const secretKey = process.env.YOOKASSA_SECRET_KEY?.trim();
  const appUrl = process.env.APP_URL?.trim() || process.env.NEXTAUTH_URL?.trim();

  if (!shopId || !secretKey || !appUrl) {
    throw new Error("YOOKASSA_SHOP_ID, YOOKASSA_SECRET_KEY and APP_URL are required");
  }

  return {
    apiUrl: (process.env.YOOKASSA_API_URL?.trim() || DEFAULT_API_URL).replace(/\/$/, ""),
    appUrl: appUrl.replace(/\/$/, ""),
    authorization: `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString("base64")}`,
  };
}

async function requestYooKassa<T>(path: string, init: RequestInit) {
  const config = getConfig();
  const response = await fetch(`${config.apiUrl}${path}`, {
    ...init,
    headers: {
      Authorization: config.authorization,
      "Content-Type": "application/json",
      ...init.headers,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`YooKassa request failed (${response.status}): ${details.slice(0, 500)}`);
  }

  return response.json() as Promise<T>;
}

export function formatYooKassaAmount(amount: number) {
  return amount.toFixed(2);
}

export async function createYooKassaPayment({
  amount,
  orderId,
  orderNumber,
  idempotenceKey,
}: {
  amount: number;
  orderId: string;
  orderNumber: string;
  idempotenceKey: string;
}) {
  const config = getConfig();

  return requestYooKassa<YooKassaPayment>("/payments", {
    method: "POST",
    headers: { "Idempotence-Key": idempotenceKey },
    body: JSON.stringify({
      amount: { value: formatYooKassaAmount(amount), currency: "RUB" },
      capture: true,
      payment_method_data: { type: "bank_card" },
      confirmation: {
        type: "redirect",
        return_url: `${config.appUrl}/checkout/result?orderId=${encodeURIComponent(orderId)}`,
      },
      description: `Заказ №${orderNumber}`,
      metadata: { order_id: orderId, order_number: orderNumber },
    }),
  });
}

export function getYooKassaPayment(paymentId: string) {
  return requestYooKassa<YooKassaPayment>(`/payments/${encodeURIComponent(paymentId)}`, {
    method: "GET",
  });
}

export function createYooKassaRefund({
  paymentId,
  amount,
  orderNumber,
  idempotenceKey,
}: {
  paymentId: string;
  amount: number;
  orderNumber: string;
  idempotenceKey: string;
}) {
  return requestYooKassa<YooKassaRefund>("/refunds", {
    method: "POST",
    headers: { "Idempotence-Key": idempotenceKey },
    body: JSON.stringify({
      payment_id: paymentId,
      amount: { value: formatYooKassaAmount(amount), currency: "RUB" },
      description: `Возврат заказа №${orderNumber}`,
    }),
  });
}
