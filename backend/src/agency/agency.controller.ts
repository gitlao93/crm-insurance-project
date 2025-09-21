import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { AgencyService } from './agency.service';
import { CreateAgencyDto } from './dto/create-agency.dto';
import { UpdateAgencyDto } from './dto/update-agency.dto';
import { plainToInstance } from 'class-transformer';
import { AgencyResponseDto } from './dto/response-agency.dto';

@Controller('agencies')
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Post()
  async create(@Body() dto: CreateAgencyDto) {
    const agency = await this.agencyService.create(dto);
    return plainToInstance(AgencyResponseDto, agency, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll() {
    const agencies = await this.agencyService.findAll();
    return agencies.map((agency) =>
      plainToInstance(AgencyResponseDto, agency, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const agency = await this.agencyService.findOne(id);
    return plainToInstance(AgencyResponseDto, agency, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAgencyDto,
  ) {
    const agency = await this.agencyService.update(id, dto);
    return plainToInstance(AgencyResponseDto, agency, {
      excludeExtraneousValues: true,
    });
  }

  @Patch('deactivate/:id')
  async deactivate(@Param('id', ParseIntPipe) id: number) {
    await this.agencyService.deactivate(id);
    return { message: `Agency with id ${id} has been Deactivated` };
  }

  @Patch('activate/:id')
  async activate(@Param('id', ParseIntPipe) id: number) {
    await this.agencyService.activate(id);
    return { message: `Agency with id ${id} has been Activated` };
  }
}
