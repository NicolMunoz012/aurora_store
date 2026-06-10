// =============================================================================
// @aurora/core/orders — generateWhatsappMessageUseCase
// Genera un enlace de WhatsApp con el resumen del pedido para
// confirmación vía mensaje (Req 8.13).
// =============================================================================

import { OrderNotFoundError } from "@aurora/shared";
import type { GenerateWhatsappMessageParams } from "../types.js";

export async function generateWhatsappMessageUseCase(
  params: GenerateWhatsappMessageParams,
): Promise<string> {
  const { repository, orderId, whatsappNumber } = params;

  // 1. Find order
  const order = await repository.findById(orderId);
  if (!order) {
    throw new OrderNotFoundError();
  }

  // 2. Build message text with order summary
  const lines: string[] = [];
  lines.push(`*Pedido #${order.id}*`);
  lines.push(`Cliente: ${order.clientName}`);
  lines.push("");
  lines.push("*Detalle:*");

  for (const item of order.items) {
    lines.push(`• ${item.productName} × ${item.quantity} @ ${item.unitPriceAtPurchase}`);
  }

  lines.push("");
  lines.push(`*Total:* ${order.productsTotal}`);
  lines.push("");

  if (order.deliveryMethod === "HOME_DELIVERY") {
    lines.push(`Entrega: Domicilio`);
    const addressParts = [
      order.shippingAddress,
      order.shippingNeighborhood,
      order.shippingMunicipality,
      order.shippingDepartment,
    ].filter(Boolean);
    lines.push(`Dirección: ${addressParts.join(", ")}`);
  } else {
    lines.push(`Entrega: Retiro en tienda`);
    if (order.storePickupAddress) {
      lines.push(`Dirección de retiro: ${order.storePickupAddress}`);
    }
  }

  const message = lines.join("\n");

  // 3. URL-encode the message
  const encodedMessage = encodeURIComponent(message);

  // 4. Return WhatsApp link
  return `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
}
