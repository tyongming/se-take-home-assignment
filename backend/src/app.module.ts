import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrdersModule } from './orders/orders.module';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [OrdersModule, BotModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
