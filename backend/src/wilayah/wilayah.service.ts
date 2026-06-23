/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Wilayah } from './entities/wilayah.entity';
import { CreateWilayahDto, UpdateWilayahDto } from './dto/wilayah.dto';
import INDONESIA_PROVINCES from '../data/indonesiaProvinces';

@Injectable()
export class WilayahService {
  constructor(
    @InjectRepository(Wilayah)
    private wilayahRepository: Repository<Wilayah>,
  ) {}

  private normalizeKlasifikasi(value?: string) {
    const raw = String(value || '').toLowerCase();

    if (
      raw.includes('independent') ||
      raw.includes('bukan') ||
      raw.includes('mandiri') ||
      raw.includes('non')
    ) {
      return 'Independent';
    }

    return 'Absolute';
  }

  private normalizeProvinceKeyword(value?: string) {
    return String(value || '')
      .toLowerCase()
      .replace(/provinsi/g, '')
      .replace(/d\.?\s*i\.?/g, 'di')
      .replace(/[^a-z0-9]/g, '')
      .trim();
  }

  private findProvinceReference(keyword?: string) {
    const normalizedKeyword = this.normalizeProvinceKeyword(keyword);

    if (!normalizedKeyword) return null;

    return (
      (INDONESIA_PROVINCES as any[]).find((province) => {
        const normalizedName = this.normalizeProvinceKeyword(province.name);
        const normalizedCode = this.normalizeProvinceKeyword(province.code);

        return (
          normalizedName === normalizedKeyword ||
          normalizedCode === normalizedKeyword ||
          normalizedName.includes(normalizedKeyword) ||
          normalizedKeyword.includes(normalizedName)
        );
      }) || null
    );
  }

  private countJenjang(wilayah: Wilayah, jenjang: 'SD' | 'SMP' | 'SMK') {
    if (!wilayah.sekolah || wilayah.sekolah.length === 0) return 0;

    return wilayah.sekolah.filter((sekolah) => {
      const raw = String(sekolah.jenjang || '')
        .trim()
        .toUpperCase();
      return raw === jenjang;
    }).length;
  }

  private enrichWilayahStats(wilayah: Wilayah) {
    const provinceRef = this.findProvinceReference(
      wilayah.nama_wilayah || wilayah.kode_wilayah,
    );

    wilayah.tipe_wilayah = this.normalizeKlasifikasi(wilayah.tipe_wilayah);
    wilayah.jenis_wilayah = wilayah.jenis_wilayah || 'PROVINSI';

    wilayah.kode_wilayah = wilayah.kode_wilayah || provinceRef?.code || null;
    wilayah.luas_wilayah =
      wilayah.luas_wilayah || provinceRef?.luasWilayah || null;
    wilayah.letak_geografis =
      wilayah.letak_geografis || provinceRef?.letakGeografis || null;
    wilayah.letak_astronomis =
      wilayah.letak_astronomis || provinceRef?.letakAstronomis || null;
    wilayah.bounds = wilayah.bounds || provinceRef?.bounds || null;

    wilayah.jumlah_sd = this.countJenjang(wilayah, 'SD');
    wilayah.jumlah_smp = this.countJenjang(wilayah, 'SMP');
    wilayah.jumlah_smk = this.countJenjang(wilayah, 'SMK');

    wilayah.jumlah_guru =
      wilayah.sekolah?.reduce(
        (acc, curr) => acc + (Number(curr.jumlah_guru) || 0),
        0,
      ) || 0;

    wilayah.jumlah_siswa =
      wilayah.sekolah?.reduce(
        (acc, curr) => acc + (Number(curr.jumlah_siswa) || 0),
        0,
      ) || 0;

    return wilayah;
  }

  getProvinceReferences() {
    return {
      status: true,
      data: (INDONESIA_PROVINCES as any[]).map((province) => ({
        kode_wilayah: province.code,
        nama_wilayah: province.name,
        region: province.region,
        ibu_kota: province.capital,
        latitude: province.latitude,
        longitude: province.longitude,
        bounds: province.bounds,
        luas_wilayah: province.luasWilayah,
        letak_geografis: province.letakGeografis || '',
        letak_astronomis: province.letakAstronomis || '',
        jumlah_kabupaten_kota: province.regencies?.length || 0,
      })),
    };
  }

  async getKabupatenReferenceByWilayahId(id: number) {
    const wilayah = await this.wilayahRepository.findOne({
      where: { id_wilayah: id },
    });

    if (!wilayah) {
      throw new NotFoundException(`Wilayah #${id} tidak ditemukan`);
    }

    const province = this.findProvinceReference(
      wilayah.nama_wilayah || wilayah.kode_wilayah,
    );

    if (!province) {
      return {
        status: true,
        province: {
          id_wilayah: wilayah.id_wilayah,
          kode_wilayah: wilayah.kode_wilayah,
          nama_wilayah: wilayah.nama_wilayah,
        },
        data: [],
        message: 'Referensi kabupaten/kota tidak ditemukan',
      };
    }

    return {
      status: true,
      province: {
        id_wilayah: wilayah.id_wilayah,
        kode_wilayah: wilayah.kode_wilayah || province.code,
        nama_wilayah: wilayah.nama_wilayah,
        region: province.region,
        ibu_kota: province.capital,
      },
      data: (province.regencies || []).map((name, index) => ({
        kode_kabupaten: `${province.code}-${String(index + 1).padStart(
          3,
          '0',
        )}`,
        nama_kabupaten: name,
        nama_wilayah: name,
        jenis_wilayah: String(name).toLowerCase().startsWith('kota')
          ? 'KOTA'
          : 'KABUPATEN',
        is_reference: true,
        id_parent: wilayah.id_wilayah,
      })),
    };
  }

  async getKotaByProvinsi(id_provinsi: number) {
    return this.getKabupatenReferenceByWilayahId(id_provinsi);
  }

  async getWilayahTree(): Promise<any> {
    const provinsi = await this.wilayahRepository.find({
      where: { jenis_wilayah: 'PROVINSI', status: true },
      relations: ['user', 'sekolah'],
      order: { nama_wilayah: 'ASC' },
    });

    return provinsi.map((prov) => {
      const provinceRef = this.findProvinceReference(
        prov.nama_wilayah || prov.kode_wilayah,
      );

      const enriched = this.enrichWilayahStats(prov);

      return {
        id: enriched.id_wilayah,
        nama: enriched.nama_wilayah,
        kode_wilayah: enriched.kode_wilayah || provinceRef?.code,
        tipe_wilayah: this.normalizeKlasifikasi(enriched.tipe_wilayah),
        jenis_wilayah: 'PROVINSI',
        latitude: enriched.latitude ?? provinceRef?.latitude,
        longitude: enriched.longitude ?? provinceRef?.longitude,
        bounds: enriched.bounds ?? provinceRef?.bounds,
        luas_wilayah: enriched.luas_wilayah ?? provinceRef?.luasWilayah,
        letak_geografis:
          enriched.letak_geografis ?? provinceRef?.letakGeografis,
        letak_astronomis:
          enriched.letak_astronomis ?? provinceRef?.letakAstronomis,
        jumlah_sd: enriched.jumlah_sd,
        jumlah_smp: enriched.jumlah_smp,
        jumlah_smk: enriched.jumlah_smk,
        kota: (provinceRef?.regencies || []).map((name, index) => ({
          id: `${provinceRef?.code}-${String(index + 1).padStart(3, '0')}`,
          nama: name,
          jenis_wilayah: String(name).toLowerCase().startsWith('kota')
            ? 'KOTA'
            : 'KABUPATEN',
          is_reference: true,
        })),
      };
    });
  }

  async findAll(provinsi?: string) {
    const where: any = { jenis_wilayah: 'KABUPATEN' };

    if (provinsi && provinsi !== 'all') {
      const province = await this.wilayahRepository.findOne({
        where: { nama_wilayah: provinsi, jenis_wilayah: 'PROVINSI' },
      });

      if (province) {
        where.id_parent = province.id_wilayah;
      }
    }

    const data = await this.wilayahRepository.find({
      where,
      relations: ['parent', 'sekolah'],
      order: { nama_wilayah: 'ASC' },
    });

    return data.map((item) => this.enrichWilayahStats(item));
  }

  async findOne(id: number): Promise<Wilayah> {
    const wilayah = await this.wilayahRepository.findOne({
      where: { id_wilayah: id },
      relations: ['parent', 'children', 'user', 'sekolah'],
    });

    if (!wilayah) {
      throw new NotFoundException(`Wilayah #${id} tidak ditemukan`);
    }

    return this.enrichWilayahStats(wilayah);
  }

  async getProvinsi(): Promise<Wilayah[]> {
    const provinsi = await this.wilayahRepository.find({
      where: { jenis_wilayah: 'PROVINSI', status: true },
      relations: ['sekolah'],
      order: { nama_wilayah: 'ASC' },
    });

    return provinsi.map((item) => this.enrichWilayahStats(item));
  }

  async create(dto: CreateWilayahDto): Promise<Wilayah> {
    const provinceRef = this.findProvinceReference(
      dto.nama_wilayah || dto.kode_wilayah,
    );

    const namaWilayah = String(
      provinceRef?.name || dto.nama_wilayah || '',
    ).trim();

    if (!namaWilayah) {
      throw new BadRequestException('Nama wilayah wajib diisi');
    }

    const isDuplicate = await this.checkDuplicateName(namaWilayah);

    if (isDuplicate) {
      throw new BadRequestException('Nama wilayah sudah terdaftar');
    }

    const klasifikasi = this.normalizeKlasifikasi(
      dto.tipe_wilayah || dto.keterangan || dto.jenis_wilayah,
    );

    const wilayah = this.wilayahRepository.create({
      kode_wilayah: dto.kode_wilayah || provinceRef?.code || null,
      nama_wilayah: namaWilayah,
      tipe_wilayah: klasifikasi,
      jenis_wilayah: 'PROVINSI',

      deskripsi: dto.deskripsi || '',
      alamat_lengkap: dto.alamat_lengkap || '',
      status: dto.status ?? true,
      tahun_awal_binaan: dto.tahun_awal_binaan || null,
      id_parent: null,

      latitude: dto.latitude ?? provinceRef?.latitude ?? null,
      longitude: dto.longitude ?? provinceRef?.longitude ?? null,

      luas_wilayah: dto.luas_wilayah || provinceRef?.luasWilayah || '',
      letak_geografis: dto.letak_geografis || provinceRef?.letakGeografis || '',
      letak_astronomis:
        dto.letak_astronomis || provinceRef?.letakAstronomis || '',
      bounds: dto.bounds || provinceRef?.bounds || null,

      jumlah_sd: 0,
      jumlah_smp: 0,
      jumlah_smk: 0,
      jumlah_guru: 0,
      jumlah_siswa: 0,
    });

    return this.wilayahRepository.save(wilayah);
  }

  async update(id: number, dto: UpdateWilayahDto): Promise<Wilayah> {
    const existing = await this.wilayahRepository.findOne({
      where: { id_wilayah: id },
    });

    if (!existing) {
      throw new NotFoundException(`Wilayah #${id} tidak ditemukan`);
    }

    // Pakai nama dari dto kalau ada, kalau tidak pakai existing
    // Jangan paksa override dengan provinceRef.name
    const nextNamaWilayah = String(
      dto.nama_wilayah || existing.nama_wilayah,
    ).trim();

    const isDuplicate = await this.checkDuplicateName(nextNamaWilayah, id);

    if (isDuplicate) {
      throw new BadRequestException('Nama wilayah sudah digunakan data lain');
    }

    // provinceRef hanya untuk mengisi field tambahan (kode, bounds, dll)
    // bukan untuk override nama
    const provinceRef = this.findProvinceReference(
      dto.kode_wilayah || existing.kode_wilayah || nextNamaWilayah,
    );

    const klasifikasi = this.normalizeKlasifikasi(
      dto.tipe_wilayah ||
        dto.keterangan ||
        dto.jenis_wilayah ||
        existing.tipe_wilayah,
    );

    const updatePayload: Partial<Wilayah> = {
      kode_wilayah:
        dto.kode_wilayah ?? provinceRef?.code ?? existing.kode_wilayah,
      nama_wilayah: nextNamaWilayah,
      tipe_wilayah: klasifikasi,
      jenis_wilayah: existing.jenis_wilayah,
      deskripsi: dto.deskripsi ?? existing.deskripsi,
      alamat_lengkap: dto.alamat_lengkap ?? existing.alamat_lengkap,
      status: dto.status ?? existing.status,
      tahun_awal_binaan: dto.tahun_awal_binaan ?? existing.tahun_awal_binaan,
      id_parent: existing.id_parent,
      latitude: dto.latitude ?? provinceRef?.latitude ?? existing.latitude,
      longitude: dto.longitude ?? provinceRef?.longitude ?? existing.longitude,
      luas_wilayah:
        dto.luas_wilayah ?? provinceRef?.luasWilayah ?? existing.luas_wilayah,
      letak_geografis:
        dto.letak_geografis ??
        provinceRef?.letakGeografis ??
        existing.letak_geografis,
      letak_astronomis:
        dto.letak_astronomis ??
        provinceRef?.letakAstronomis ??
        existing.letak_astronomis,
      bounds: dto.bounds ?? provinceRef?.bounds ?? existing.bounds,
    };

    await this.wilayahRepository.update(id, updatePayload);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);

    await this.wilayahRepository.update({ id_wilayah: id }, { status: false });
  }

  async checkDuplicateName(nama: string, excludeId?: number): Promise<boolean> {
    const decodedName = decodeURIComponent(nama || '').trim();

    if (!decodedName) return false;

    const query = this.wilayahRepository
      .createQueryBuilder('wilayah')
      .where('LOWER(TRIM(wilayah.nama_wilayah)) = LOWER(TRIM(:nama))', {
        nama: decodedName,
      });

    if (excludeId) {
      query.andWhere('wilayah.id_wilayah != :excludeId', { excludeId });
    }

    const count = await query.getCount();

    return count > 0;
  }
}
