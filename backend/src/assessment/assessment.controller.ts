/* eslint-disable prettier/prettier */
import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Query,
  Res,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth-guard';

@Controller('assessment')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  create(@Body() dto: CreateAssessmentDto) {
    return this.assessmentService.create(dto);
  }

  @Get('sekolah/:id_sekolah')
  findBySekolah(
    @Param('id_sekolah') id_sekolah: string,
    @Query('id_user') id_user: string,
  ) {
    return this.assessmentService.findBySekolah(+id_sekolah, +id_user);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(
    @Req() req: any,
    @Query('jenis') jenis?: string,
    @Query('id_ho') id_ho?: string,
    @Query('pilar') pilar?: string,
  ) {
    const currentUser = req?.user?.user ?? req?.user;

    return this.assessmentService.findAll(
      jenis,
      id_ho ? +id_ho : undefined,
      pilar,
      currentUser,
    );
  }

  @Get('best-renggo')
  getBestRenggo(
    @Query('jenis') jenis?: string,
    @Query('id_assessment') id_assessment?: string,
  ) {
    return this.assessmentService.getBestRenggo(
      jenis,
      id_assessment ? +id_assessment : undefined,
    );
  }

  @Get(':id/hasil')
  getHasilAssessment(@Param('id') id: string) {
    return this.assessmentService.getHasilAssessment(+id);
  }

  @Get(':id/hasil/export')
  async exportHasilAssessment(@Param('id') id: string, @Res() res: Response) {
    const file = await this.assessmentService.exportHasilAssessmentCsv(+id);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.filename}"`,
    );
    return res.send(file.content);
  }

  @Post(':id/hasil/import')
  importHasilAssessment(@Param('id') id: string, @Body() body: any) {
    return this.assessmentService.importHasilAssessment(+id, body);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.assessmentService.findOne(+id);
  }

  @Patch(':id/toggle-aktif')
  toggleAktif(@Param('id') id: string) {
    return this.assessmentService.toggleAktif(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateAssessmentDto) {
    return this.assessmentService.update(+id, body);
  }

  @Post(':id/jawab')
  jawab(@Param('id') id: string, @Body() body: any) {
    return this.assessmentService.jawab(+id, body);
  }

  @Patch(':id/send')
  send(@Param('id') id: string) {
    return this.assessmentService.send(+id);
  }
}
