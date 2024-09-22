import { Order } from "src/orders/interfaces/order.interface";

export enum BotStatus {
    Processing = 1,
    Idle = 0
}

export interface Bot {
    id: number;
    isIdle: Boolean;
    processingOrderId?: number | null;
}
