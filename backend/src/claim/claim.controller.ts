import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Delete,
  Patch,
  Query,
} from '@nestjs/common';
import { ClaimService } from './claim.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { UpdateClaimDto } from './dto/update-claim.dto';
import { ClaimStatus } from './claim.entities';

@Controller('claims')
export class ClaimController {
  constructor(private readonly claimService: ClaimService) {}

  // ✅ Create Claim
  @Post()
  create(@Body() dto: CreateClaimDto) {
    return this.claimService.create(dto);
  }

  // ✅ Get All (optional ?policyHolderId=)
  @Get()
  findAll(@Query('policyHolderId') policyHolderId?: number) {
    return this.claimService.findAll(policyHolderId);
  }

  // ✅ Get One
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.claimService.findOne(id);
  }

  // ✅ Update Claim (general fields)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateClaimDto) {
    return this.claimService.update(id, dto);
  }

  // ✅ Update Claim Status
  @Patch(':id/status')
  updateStatus(@Param('id') id: number, @Body('status') status: ClaimStatus) {
    return this.claimService.updateStatus(id, status);
  }

  // ✅ Delete Claim
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.claimService.remove(id);
  }
}
