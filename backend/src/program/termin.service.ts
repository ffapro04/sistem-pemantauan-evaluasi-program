/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Termin } from './entities/termin.entity';
import { TerminChat } from './entities/termin-chat.entity';

@Injectable()
export class TerminService {
  constructor(
    @InjectRepository(Termin)
    private readonly terminRepo: Repository<Termin>,

    @InjectRepository(TerminChat)
    private readonly chatRepo: Repository<TerminChat>,
  ) {}

  private toNumberOrNull(value: any) {
    if (value === undefined || value === null || value === '') return null;

    const numberValue = Number(value);

    return Number.isNaN(numberValue) ? null : numberValue;
  }

  async createTermin(
    createDto: any,
    file: Express.Multer.File,
    id_user: number,
    nama_user: string,
    role_user: string,
  ) {
    try {
      const termin = this.terminRepo.create({
        nama_termin: createDto.nama_termin,
        deskripsi: createDto.deskripsi || null,
        jumlah_pembayaran: createDto.jumlah_pembayaran
          ? Number(createDto.jumlah_pembayaran)
          : 0,
        id_kegiatans: createDto.id_kegiatans
          ? Number(createDto.id_kegiatans)
          : null,
        id_fase: createDto.id_fase ? Number(createDto.id_fase) : null,
        status: 'WAITING_UPLOAD',
        file_dokumentasi: file ? file.filename : null,
        nama_file_dokumentasi: file ? file.originalname : null,
      });

      return await this.terminRepo.save(termin);
    } catch (error) {
      console.error('Error saat save termin:', error);
      throw new InternalServerErrorException('Gagal menyimpan termin!');
    }
  }

  async getTerminsByKegiatans(id_kegiatans: number) {
    return await this.terminRepo.find({
      where: { id_kegiatans },
      order: { created_at: 'ASC' },
      relations: ['chats', 'persyaratan'],
    });
  }

  async createChat(
    createDto: any,
    id_user: number,
    nama_user: string,
    role_user: string,
  ) {
    try {
      if (!createDto.pesan || !String(createDto.pesan).trim()) {
        throw new BadRequestException('Pesan tidak boleh kosong');
      }

      const id_program = this.toNumberOrNull(createDto.id_program);
      const id_fase = this.toNumberOrNull(createDto.id_fase);
      const id_termin = this.toNumberOrNull(createDto.id_termin);
      const id_kegiatans = this.toNumberOrNull(createDto.id_kegiatans);
      const id_persyaratan = this.toNumberOrNull(createDto.id_persyaratan);

      const konteks =
        createDto.konteks ||
        (id_persyaratan
          ? 'PERSYARATAN'
          : id_termin
            ? 'TERMIN'
            : id_kegiatans
              ? 'KEGIATAN'
              : id_fase
                ? 'FASE'
                : 'PROGRAM');

      if (!id_program && !id_termin && !id_kegiatans && !id_persyaratan) {
        throw new BadRequestException(
          'Konteks chat tidak valid. Kirim id_program atau id_termin/id_kegiatans/id_persyaratan.',
        );
      }

      const chat = this.chatRepo.create({
        pesan: String(createDto.pesan).trim(),
        id_user,
        nama_user,
        role_user,
        id_program,
        id_fase,
        id_termin,
        id_kegiatans,
        id_persyaratan,
        konteks,
      });

      return await this.chatRepo.save(chat);
    } catch (error) {
      console.error('Error saat save chat:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException('Gagal mengirim pesan!');
    }
  }

  async getChatsByTermin(id_termin: number) {
    return await this.chatRepo.find({
      where: { id_termin },
      order: { created_at: 'ASC' },
    });
  }

  async getChatsByContext(query: any) {
    const id_program = this.toNumberOrNull(query.id_program);
    const id_fase = this.toNumberOrNull(query.id_fase);
    const id_termin = this.toNumberOrNull(query.id_termin);
    const id_kegiatans = this.toNumberOrNull(query.id_kegiatans);
    const id_persyaratan = this.toNumberOrNull(query.id_persyaratan);

    const builder = this.chatRepo
      .createQueryBuilder('chat')
      .orderBy('chat.created_at', 'ASC');

    if (id_program) {
      builder.andWhere('chat.id_program = :id_program', { id_program });
    }

    if (id_fase) {
      builder.andWhere('chat.id_fase = :id_fase', { id_fase });
    }

    if (id_termin) {
      builder.andWhere('chat.id_termin = :id_termin', { id_termin });
    }

    if (id_kegiatans) {
      builder.andWhere('chat.id_kegiatans = :id_kegiatans', { id_kegiatans });
    }

    if (id_persyaratan) {
      builder.andWhere('chat.id_persyaratan = :id_persyaratan', {
        id_persyaratan,
      });
    }

    if (!id_program && !id_termin && !id_kegiatans && !id_persyaratan) {
      throw new BadRequestException(
        'Konteks chat tidak valid. Minimal kirim id_program atau id_termin/id_kegiatans/id_persyaratan.',
      );
    }

    return await builder.getMany();
  }
}
