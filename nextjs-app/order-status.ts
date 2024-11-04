/*
This file helps mimic order tracking capabilities.
In reality, order status info would be more complex and also be stored in a database.
However, for demo purposes, we do not use a database, and we keep the interfaces/fields simple.
*/

interface OrderStatus {
  referenceNum?: string;
  status: 'Delivered' | 'Out for delivery'; // Keep it simple — just a few different statuses is fine
  estimatedArrivalTimestamp: number;
}

async function getOrderStatus(referenceNum: string): Promise<OrderStatus | undefined> {
  if (referenceNum.startsWith('1')) {
    return {
      referenceNum,
      status: 'Delivered',
      estimatedArrivalTimestamp: 1727395200000, // Sept 27, 2024
    };
  }
  if (referenceNum.startsWith('2')) {
    return {
      referenceNum,
      status: 'Out for delivery',
      estimatedArrivalTimestamp: getTomorrowAsTimestamp(),
    };
  }
}

function getTomorrowAsTimestamp(): number {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.getTime();
}

export type { OrderStatus };
export { getOrderStatus };
