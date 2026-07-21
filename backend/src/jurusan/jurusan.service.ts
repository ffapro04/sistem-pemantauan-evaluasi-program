/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Jurusan } from './entities/jurusan.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { CreateJurusanDto } from './dto/create-jurusan.dto';
import { UpdateJurusanDto } from './dto/update-jurusan.dto';
import { NotifikasiService } from '../notifikasi/notifikasi.service';

@Injectable()
export class JurusanService implements OnModuleInit {
  constructor(
    @InjectRepository(Jurusan)
    private readonly jurusanRepo: Repository<Jurusan>,

    @InjectRepository(Sekolah)
    private readonly sekolahRepo: Repository<Sekolah>,

    private readonly notifikasiService: NotifikasiService,
  ) {}

  async onModuleInit() {
    await this.jurusanRepo.query(
      'ALTER TABLE "m_jurusan" ADD COLUMN IF NOT EXISTS "gambar_jurusan" character varying(255)',
    );
  }

  private normalizeKode(value: any) {
    return String(value || '')
      .trim()
      .toUpperCase();
  }

  private normalizeNama(value: any) {
    return String(value || '').trim();
  }

  private normalizeDeskripsi(value: any) {
    const text = String(value || '').trim();
    return text || null;
  }

  private normalizeGambar(value: any) {
    const text = String(value || '').trim();
    return text || null;
  }

  private parseStatus(value: any) {
    if (value === undefined || value === null || value === '') return true;

    return (
      value === true ||
      value === 'true' ||
      value === 1 ||
      value === '1' ||
      String(value).toLowerCase() === 'aktif'
    );
  }

  private async ensureSekolah(id_sekolah: number) {
    const idSekolah = Number(id_sekolah);

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid.');
    }

    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: idSekolah },
    });

    if (!sekolah) {
      throw new NotFoundException('Sekolah tidak ditemukan.');
    }

    return sekolah;
  }

  async findBySekolah(id_sekolah: number) {
    const idSekolah = Number(id_sekolah);

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid.');
    }

    return this.jurusanRepo.find({
      where: { id_sekolah: idSekolah },
      order: {
        nama_jurusan: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const jurusan = await this.jurusanRepo.findOne({
      where: { id_jurusan: Number(id) },
      relations: ['sekolah'],
    });

    if (!jurusan) {
      throw new NotFoundException('Jurusan tidak ditemukan.');
    }

    return jurusan;
  }

  async create(dto: CreateJurusanDto) {
    const sekolah = await this.ensureSekolah(Number(dto.id_sekolah));

    if (String(sekolah.jenjang || '').toUpperCase() !== 'SMK') {
      throw new BadRequestException(
        'Jurusan hanya dapat dibuat untuk sekolah jenjang SMK.',
      );
    }

    const namaJurusan = this.normalizeNama(dto.nama_jurusan);
    const kodeJurusan = this.normalizeKode(dto.kode_jurusan);
    const deskripsiJurusan = this.normalizeDeskripsi(dto.deskripsi);
    const gambarJurusan = this.normalizeGambar(dto.gambar_jurusan);

    if (!namaJurusan) {
      throw new BadRequestException('Nama jurusan wajib diisi.');
    }

    if (!kodeJurusan) {
      throw new BadRequestException('Kode jurusan wajib diisi.');
    }

    const duplicate = await this.jurusanRepo
      .createQueryBuilder('j')
      .where('j.id_sekolah = :id_sekolah', { id_sekolah: sekolah.id_sekolah })
      .andWhere('LOWER(TRIM(j.kode_jurusan)) = LOWER(TRIM(:kode_jurusan))', {
        kode_jurusan: kodeJurusan,
      })
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Kode jurusan sudah terdaftar di sekolah ini.',
      );
    }

    const jurusan = await this.jurusanRepo.save({
      id_sekolah: sekolah.id_sekolah,
      nama_jurusan: namaJurusan,
      kode_jurusan: kodeJurusan,
      deskripsi: deskripsiJurusan,
      gambar_jurusan: gambarJurusan,
      status: this.parseStatus(dto.status),
    });

    await this.notifikasiService.notifyAdmins({
      judul: 'Jurusan Baru Ditambahkan',
      pesan: `${sekolah.nama_sekolah} menambahkan jurusan baru: ${jurusan.nama_jurusan}.`,
      tipe: 'JURUSAN',
      targetUrl: `/admin/sekolah/detail/${sekolah.id_sekolah}`,
      metadata: {
        action: 'CREATE_JURUSAN',
        id_sekolah: sekolah.id_sekolah,
        id_jurusan: jurusan.id_jurusan,
        nama_jurusan: jurusan.nama_jurusan,
        kode_jurusan: jurusan.kode_jurusan,
      },
    });

    return jurusan;
  }
  async update(id: number, dto: UpdateJurusanDto) {
    const jurusan = await this.findOne(id);

    const nextIdSekolah =
      dto.id_sekolah !== undefined
        ? Number(dto.id_sekolah)
        : Number(jurusan.id_sekolah);

    const sekolah = await this.ensureSekolah(nextIdSekolah);

    if (String(sekolah.jenjang || '').toUpperCase() !== 'SMK') {
      throw new BadRequestException(
        'Jurusan hanya dapat digunakan untuk sekolah jenjang SMK.',
      );
    }

    const nextNama =
      dto.nama_jurusan !== undefined
        ? this.normalizeNama(dto.nama_jurusan)
        : jurusan.nama_jurusan;

    const nextKode =
      dto.kode_jurusan !== undefined
        ? this.normalizeKode(dto.kode_jurusan)
        : jurusan.kode_jurusan;

    const nextDeskripsi =
      dto.deskripsi !== undefined
        ? this.normalizeDeskripsi(dto.deskripsi)
        : jurusan.deskripsi;

    const nextGambar =
      dto.gambar_jurusan !== undefined
        ? this.normalizeGambar(dto.gambar_jurusan)
        : jurusan.gambar_jurusan;

    if (!nextNama) {
      throw new BadRequestException('Nama jurusan wajib diisi.');
    }

    if (!nextKode) {
      throw new BadRequestException('Kode jurusan wajib diisi.');
    }

    const duplicate = await this.jurusanRepo
      .createQueryBuilder('j')
      .where('j.id_sekolah = :id_sekolah', { id_sekolah: sekolah.id_sekolah })
      .andWhere('LOWER(TRIM(j.kode_jurusan)) = LOWER(TRIM(:kode_jurusan))', {
        kode_jurusan: nextKode,
      })
      .andWhere('j.id_jurusan != :id', { id })
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Kode jurusan sudah digunakan di sekolah ini.',
      );
    }

    jurusan.id_sekolah = sekolah.id_sekolah;
    jurusan.nama_jurusan = nextNama;
    jurusan.kode_jurusan = nextKode;
    jurusan.deskripsi = nextDeskripsi;
    jurusan.gambar_jurusan = nextGambar;

    if (dto.status !== undefined) {
      jurusan.status = this.parseStatus(dto.status);
    }

    const saved = await this.jurusanRepo.save(jurusan);

    await this.notifikasiService.notifyAdmins({
      judul: 'Data Jurusan Diperbarui',
      pesan: `${sekolah.nama_sekolah} memperbarui data jurusan: ${saved.nama_jurusan}.`,
      tipe: 'JURUSAN',
      targetUrl: `/admin/sekolah/detail/${sekolah.id_sekolah}`,
      metadata: {
        action: 'UPDATE_JURUSAN',
        id_sekolah: sekolah.id_sekolah,
        id_jurusan: saved.id_jurusan,
        nama_jurusan: saved.nama_jurusan,
        kode_jurusan: saved.kode_jurusan,
        status: saved.status,
      },
    });

    return saved;
  }

  async remove(id: number) {
    const jurusan = await this.findOne(id);

    const idSekolah = jurusan.id_sekolah;
    const namaJurusan = jurusan.nama_jurusan;
    const kodeJurusan = jurusan.kode_jurusan;

    await this.jurusanRepo.remove(jurusan);

    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: idSekolah },
    });

    await this.notifikasiService.notifyAdmins({
      judul: 'Jurusan Dihapus',
      pesan: `${sekolah?.nama_sekolah || 'Sekolah'} menghapus jurusan: ${namaJurusan}.`,
      tipe: 'JURUSAN',
      targetUrl: `/admin/sekolah/detail/${idSekolah}`,
      metadata: {
        action: 'DELETE_JURUSAN',
        id_sekolah: idSekolah,
        nama_jurusan: namaJurusan,
        kode_jurusan: kodeJurusan,
      },
    });

    return {
      message: 'Jurusan berhasil dihapus.',
    };
  }
}
