
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:4200',  // Allow specific origin
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  // Set global prefix for all routes
  app.setGlobalPrefix('mcdonalds-order-api');

  const config = new DocumentBuilder()
    .setTitle('McDonald\'s Order Controller API')
    .setDescription('API to manage order flows, cooking bots, and VIP order prioritization for McDonald\'s automated kitchen system.')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger-doc', app, document);

  // Enable validation globally
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,  // Automatically remove fields not defined in the DTO
    forbidNonWhitelisted: true,  // Throw an error if non-whitelisted fields are passed
    transform: true,  // Automatically transform payloads to match DTO types
  }));

  await app.listen(3000);
}
bootstrap();