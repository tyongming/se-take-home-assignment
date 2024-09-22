import { Module, forwardRef } from '@nestjs/common';
import { BotService } from './bot.service';
import { BotController } from './bot.controller';
import { OrdersModule } from 'src/orders/orders.module';
import { OrdersGateway } from 'src/websockets/orders/orders.gateway';

@Module({
  
  imports: [forwardRef(() => OrdersModule)],
  controllers: [BotController],
  providers: [BotService, OrdersGateway],
  exports: [BotService],
})
export class BotModule {}
