import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { BotModule } from 'src/bot/bot.module';
import { OrdersGateway } from 'src/websockets/orders/orders.gateway';

@Module({
  imports: [forwardRef(() => BotModule)],
  controllers: [OrdersController],
  providers: [OrdersService, OrdersGateway],
  exports: [OrdersService],
})
export class OrdersModule {}
