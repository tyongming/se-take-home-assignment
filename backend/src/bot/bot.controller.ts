import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BotService } from './bot.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Bots')
@Controller('/bots')
export class BotController {
  constructor(private readonly botService: BotService) {}

  @Post('/add')
  @ApiOperation({ summary: 'Create a new bot' })
  create() {
    return this.botService.create();
  }

  @Get()
  @ApiOperation({ summary: 'Get all bots' })
  findAll() {
    return this.botService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a bot by ID' })
  findOne(@Param('id') id: string) {
    return this.botService.findOne(+id);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove the newest bot' })
  remove() {
    return this.botService.remove();
  }
}
