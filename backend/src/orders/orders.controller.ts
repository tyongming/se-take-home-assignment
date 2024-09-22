import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiOperation, ApiBody, ApiTags, ApiResponse } from '@nestjs/swagger';
import { OrderStatus } from './interfaces/order.interface';
import { CreateOrderResponseDto } from './dto/create-order-response.dto';

@ApiTags('Orders')
@Controller('/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  
  @Post('/add')
  @ApiOperation({ summary: 'Create a new order'})
  @ApiBody({ description: 'Order creation payload', type: CreateOrderDto })
  @ApiResponse({
    status: 201,
    description: 'The order has been successfully created.',
    type: CreateOrderResponseDto,
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all orders' })
  findAll() {
    return this.ordersService.findAll();
  }

  @Get('/grouped')
  @ApiOperation({ summary: 'Get orders grouped by status' })
  getOrdersGroupedByStatus() {
    return this.ordersService.getOrdersGroupedByStatus();
  }

  @Get('/stats')
  @ApiOperation({ summary: 'Get order statistics', description: 'Returns the total number of orders, VIP orders, and normal orders' })
  @ApiResponse({
    status: 201,
    schema: {
      type: 'object',
      properties: {
        total: { type: 'number', example: 100 },
        vip: { type: 'number', example: 20 },
        normal: { type: 'number', example: 80 },
      },
    },
  })
  getOrderStats() {
    return this.ordersService.getOrderStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  findOne(@Param('id') id: number) {
    return this.ordersService.findOne(id);
  }
}
