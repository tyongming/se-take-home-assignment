import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { OrderStatus, OrderType } from '../interfaces/order.interface';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOrderDto {
    @ApiProperty({
        description: 'The type of the order',
        enum: OrderType,
        example: OrderType.Normal,
      })
    @IsEnum(OrderType)
    type: OrderType;
}
