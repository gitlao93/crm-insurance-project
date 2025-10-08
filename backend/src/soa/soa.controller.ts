import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { SoaService } from './soa.service';
import { CreateSoaDto } from './dto/create-soa.dto';
import { UpdateSoaDto } from './dto/update-soa.dto';

@Controller('soa')
export class SoaController {
  constructor(private readonly service: SoaService) {}

  @Post()
  create(@Body() dto: CreateSoaDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSoaDto) {
    return this.service.update(+id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}
