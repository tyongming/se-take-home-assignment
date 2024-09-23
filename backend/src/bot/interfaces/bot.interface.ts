import { Order } from "src/orders/interfaces/order.interface";

export interface Bot {
    id: number;
    isIdle: Boolean;
    processingOrderId?: number | null;
}
