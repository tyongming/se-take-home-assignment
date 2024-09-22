import { ApiProperty } from '@nestjs/swagger';
import { Order } from '../interfaces/order.interface';

class StatsDto {
    @ApiProperty({ example: 100 })
    total: number;
  
    @ApiProperty({ example: 80 })
    normal: number;
  
    @ApiProperty({ example: 20 })
    vip: number;
  }

export class CreateOrderResponseDto {
  @ApiProperty({ example: 'Order created successfully' })
  message: string;

  @ApiProperty({ example: { id: 1, type: 'Normal', status: 'Pending', createdDatetime: '2024-09-20T12:00:00.000Z' } })
  order: Order;

  @ApiProperty({ type: StatsDto })
  stats: StatsDto;
}