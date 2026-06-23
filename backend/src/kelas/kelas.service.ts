/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Kelas } from './entities/kelas.entity';
import { Sekolah } from '../sekolah/entities/sekolah.entity';
import { Jurusan } from '../jurusan/entities/jurusan.entity';
import { CreateKelasDto } from './dto/create-kelas.dto';
import { UpdateKelasDto } from './dto/update-kelas.dto';
import { NotifikasiService } from '../notifikasi/notifikasi.service';

const TINGKAT_BY_JENJANG = {
  SD: ['I', 'II', 'III', 'IV', 'V', 'VI'],
  SMP: ['VII', 'VIII', 'IX'],
  SMK: ['X', 'XI', 'XII'],
};

const ROMAN_ORDER = {
  I: 1,
  II: 2,
  III: 3,
  IV: 4,
  V: 5,
  VI: 6,
  VII: 7,
  VIII: 8,
  IX: 9,
  X: 10,
  XI: 11,
  XII: 12,
};

@Injectable()
export class KelasService {
  constructor(
    @InjectRepository(Kelas)
    private readonly kelasRepo: Repository<Kelas>,

    @InjectRepository(Sekolah)
    private readonly sekolahRepo: Repository<Sekolah>,

    @InjectRepository(Jurusan)
    private readonly jurusanRepo: Repository<Jurusan>,

    private readonly notifikasiService: NotifikasiService,
  ) {}

  private normalizeJenjang(value: any) {
    return String(value || '')
      .trim()
      .toUpperCase();
  }

  private normalizeTingkat(value: any) {
    return String(value || '')
      .trim()
      .toUpperCase();
  }

  private normalizeRombel(value: any) {
    return String(value || '')
      .trim()
      .toUpperCase();
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

  private getTingkatOrder(value: any) {
    return ROMAN_ORDER[String(value || '').toUpperCase()] || 0;
  }

  private isValidRombel(value: string) {
    const rombel = this.normalizeRombel(value);

    if (!rombel) return false;

    const isLetter = /^[A-Z]$/.test(rombel);
    const isNumber =
      /^[0-9]+$/.test(rombel) && Number(rombel) >= 1 && Number(rombel) <= 100;

    return isLetter || isNumber;
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

  private validateTingkatByJenjang(jenjang: string, tingkat: string) {
    const normalizedJenjang = this.normalizeJenjang(jenjang);
    const normalizedTingkat = this.normalizeTingkat(tingkat);

    const allowed =
      TINGKAT_BY_JENJANG[normalizedJenjang] || TINGKAT_BY_JENJANG.SD;

    if (!allowed.includes(normalizedTingkat)) {
      throw new BadRequestException(
        `Tingkat kelas tidak sesuai jenjang ${normalizedJenjang}.`,
      );
    }

    return normalizedTingkat;
  }

  private async resolveJurusanForKelas(
    sekolah: Sekolah,
    id_jurusan?: number | null,
  ) {
    const jenjang = this.normalizeJenjang(sekolah.jenjang);

    if (jenjang !== 'SMK') {
      return null;
    }

    const idJurusan = Number(id_jurusan);

    if (!idJurusan || Number.isNaN(idJurusan)) {
      throw new BadRequestException('Jurusan wajib dipilih untuk kelas SMK.');
    }

    const jurusan = await this.jurusanRepo.findOne({
      where: {
        id_jurusan: idJurusan,
        id_sekolah: sekolah.id_sekolah,
      },
    });

    if (!jurusan) {
      throw new NotFoundException(
        'Jurusan tidak ditemukan atau bukan milik sekolah ini.',
      );
    }

    if (!jurusan.status) {
      throw new BadRequestException('Jurusan yang dipilih sedang nonaktif.');
    }

    return jurusan;
  }

  private buildNamaKelas(params: {
    tingkat: string;
    rombel: string;
    jurusan?: Jurusan | null;
  }) {
    const tingkat = this.normalizeTingkat(params.tingkat);
    const rombel = this.normalizeRombel(params.rombel);
    const kodeJurusan = params.jurusan?.kode_jurusan
      ? this.normalizeRombel(params.jurusan.kode_jurusan)
      : '';

    return ['Kelas', tingkat, kodeJurusan, rombel].filter(Boolean).join(' ');
  }

  private async ensureUniqueNamaKelas(
    id_sekolah: number,
    nama_kelas: string,
    excludeId?: number,
  ) {
    const qb = this.kelasRepo
      .createQueryBuilder('k')
      .where('k.id_sekolah = :id_sekolah', { id_sekolah })
      .andWhere('LOWER(TRIM(k.nama_kelas)) = LOWER(TRIM(:nama_kelas))', {
        nama_kelas,
      });

    if (excludeId) {
      qb.andWhere('k.id_kelas != :excludeId', { excludeId });
    }

    const duplicate = await qb.getOne();

    if (duplicate) {
      throw new ConflictException('Nama kelas sudah terdaftar di sekolah ini.');
    }
  }

  private sortKelas(rows: Kelas[]) {
    return [...rows].sort((a, b) => {
      const tingkatCompare =
        this.getTingkatOrder(a.tingkat) - this.getTingkatOrder(b.tingkat);

      if (tingkatCompare !== 0) return tingkatCompare;

      const jurusanCompare = String(a.jurusan || '').localeCompare(
        String(b.jurusan || ''),
      );

      if (jurusanCompare !== 0) return jurusanCompare;

      return String(a.rombel || '').localeCompare(
        String(b.rombel || ''),
        'id',
        {
          numeric: true,
        },
      );
    });
  }

  async findBySekolah(id_sekolah: number) {
    const idSekolah = Number(id_sekolah);

    if (!idSekolah || Number.isNaN(idSekolah)) {
      throw new BadRequestException('ID sekolah tidak valid.');
    }

    const rows = await this.kelasRepo.find({
      where: { id_sekolah: idSekolah },
      relations: ['jurusan_data'],
    });

    return this.sortKelas(rows);
  }

  async findOne(id: number) {
    const kelas = await this.kelasRepo.findOne({
      where: { id_kelas: Number(id) },
      relations: ['sekolah', 'jurusan_data'],
    });

    if (!kelas) {
      throw new NotFoundException('Kelas tidak ditemukan.');
    }

    return kelas;
  }

  async create(dto: CreateKelasDto) {
    const sekolah = await this.ensureSekolah(Number(dto.id_sekolah));

    const tingkat = this.validateTingkatByJenjang(sekolah.jenjang, dto.tingkat);

    const rombel = this.normalizeRombel(dto.rombel);

    if (!this.isValidRombel(rombel)) {
      throw new BadRequestException(
        'Rombel wajib diisi dengan A-Z atau angka 1-100.',
      );
    }

    const jurusan = await this.resolveJurusanForKelas(sekolah, dto.id_jurusan);

    const namaKelas = this.buildNamaKelas({
      tingkat,
      rombel,
      jurusan,
    });

    await this.ensureUniqueNamaKelas(sekolah.id_sekolah, namaKelas);

    const kelas = await this.kelasRepo.save({
      id_sekolah: sekolah.id_sekolah,
      id_jurusan: jurusan?.id_jurusan || null,
      nama_kelas: namaKelas,
      tingkat,
      jurusan: jurusan?.kode_jurusan || '',
      rombel,
      status: this.parseStatus(dto.status),
    });

    await this.notifikasiService.notifyAdmins({
      judul: 'Kelas Baru Ditambahkan',
      pesan: `${sekolah.nama_sekolah} menambahkan kelas baru: ${kelas.nama_kelas}.`,
      tipe: 'KELAS',
      targetUrl: `/admin/sekolah/detail/${sekolah.id_sekolah}`,
      metadata: {
        action: 'CREATE_KELAS',
        id_sekolah: sekolah.id_sekolah,
        id_kelas: kelas.id_kelas,
        nama_kelas: kelas.nama_kelas,
      },
    });

    return kelas;
  }

  async update(id: number, dto: UpdateKelasDto) {
    const kelas = await this.findOne(id);

    const sekolah = await this.ensureSekolah(
      dto.id_sekolah !== undefined ? Number(dto.id_sekolah) : kelas.id_sekolah,
    );

    if (dto.status !== undefined) {
      kelas.status = this.parseStatus(dto.status);
    }

    const isStructureUpdate =
      dto.id_sekolah !== undefined ||
      dto.tingkat !== undefined ||
      dto.rombel !== undefined ||
      dto.id_jurusan !== undefined;

    if (isStructureUpdate) {
      const tingkat = this.validateTingkatByJenjang(
        sekolah.jenjang,
        dto.tingkat !== undefined ? dto.tingkat : kelas.tingkat,
      );

      const rombel = this.normalizeRombel(
        dto.rombel !== undefined ? dto.rombel : kelas.rombel,
      );

      if (!this.isValidRombel(rombel)) {
        throw new BadRequestException(
          'Rombel wajib diisi dengan A-Z atau angka 1-100.',
        );
      }

      const nextIdJurusan =
        dto.id_jurusan !== undefined
          ? Number(dto.id_jurusan)
          : kelas.id_jurusan;

      const jurusan = await this.resolveJurusanForKelas(sekolah, nextIdJurusan);

      const namaKelas = this.buildNamaKelas({
        tingkat,
        rombel,
        jurusan,
      });

      await this.ensureUniqueNamaKelas(sekolah.id_sekolah, namaKelas, id);

      kelas.id_sekolah = sekolah.id_sekolah;
      kelas.id_jurusan = jurusan?.id_jurusan || null;
      kelas.nama_kelas = namaKelas;
      kelas.tingkat = tingkat;
      kelas.jurusan = jurusan?.kode_jurusan || '';
      kelas.rombel = rombel;
    }

    const saved = await this.kelasRepo.save(kelas);

    await this.notifikasiService.notifyAdmins({
      judul: 'Data Kelas Diperbarui',
      pesan: `${sekolah.nama_sekolah} memperbarui data kelas: ${saved.nama_kelas}.`,
      tipe: 'KELAS',
      targetUrl: `/admin/sekolah/detail/${sekolah.id_sekolah}`,
      metadata: {
        action: 'UPDATE_KELAS',
        id_sekolah: sekolah.id_sekolah,
        id_kelas: saved.id_kelas,
        nama_kelas: saved.nama_kelas,
        status: saved.status,
      },
    });

    return saved;
  }

  async remove(id: number) {
    const kelas = await this.findOne(id);

    const idSekolah = kelas.id_sekolah;
    const namaKelas = kelas.nama_kelas;

    await this.kelasRepo.remove(kelas);

    const sekolah = await this.sekolahRepo.findOne({
      where: { id_sekolah: idSekolah },
    });

    await this.notifikasiService.notifyAdmins({
      judul: 'Kelas Dihapus',
      pesan: `${sekolah?.nama_sekolah || 'Sekolah'} menghapus kelas: ${namaKelas}.`,
      tipe: 'KELAS',
      targetUrl: `/admin/sekolah/detail/${idSekolah}`,
      metadata: {
        action: 'DELETE_KELAS',
        id_sekolah: idSekolah,
        nama_kelas: namaKelas,
      },
    });

    return {
      message: 'Kelas berhasil dihapus.',
    };
  }
}
