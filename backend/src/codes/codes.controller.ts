import { Controller, Get, Post, Param, Body, UsePipes, ValidationPipe } from '@nestjs/common';
import { CodesService } from './codes.service';
import { CreateCodeDto } from './dto/create-code.dto';

@Controller('codes')
export class CodesController {
  constructor(private readonly codesService: CodesService) {}

  @Post()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() dto: CreateCodeDto) {
    return this.codesService.create(dto);
  }

  @Get()
  findAll() {
    return this.codesService.findAll();
  }

  // Must be declared before :id to prevent NestJS matching 'summary' as a param
  @Get('summary')
  getSummary() {
    return this.codesService.getSummary();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.codesService.findOne(id);
  }

  @Post(':id/redeem')
  redeem(@Param('id') id: string) {
    return this.codesService.redeem(id);
  }
}
