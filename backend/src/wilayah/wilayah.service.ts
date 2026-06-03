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

  async getKotaByProvinsi(id_provinsi: number): Promise<Wilayah[]> {
    return this.wilayahRepository.find({
      where: { id_parent: id_provinsi, status: true },
      relations: ['user'],
      order: { nama_wilayah: 'ASC' },
    });
  }

  async getWilayahTree(): Promise<any> {
    const provinsi = await this.wilayahRepository.find({
      where: { jenis_wilayah: 'PROVINSI', status: true },
      relations: ['children', 'children.user', 'children.sekolah'],
      order: { nama_wilayah: 'ASC' },
    });

    return provinsi.map((prov) => ({
      id: prov.id_wilayah,
      nama: prov.nama_wilayah,
      kode_wilayah: prov.kode_wilayah,
      tipe_wilayah: this.normalizeKlasifikasi(prov.tipe_wilayah),
      jenis_wilayah: prov.jenis_wilayah,
      latitude: prov.latitude,
      longitude: prov.longitude,
      bounds: prov.bounds,
      luas_wilayah: prov.luas_wilayah,
      letak_geografis: prov.letak_geografis,
      letak_astronomis: prov.letak_astronomis,
      kota: prov.children
        .filter((k) => k.status)
        .map((k) => ({
          id: k.id_wilayah,
          nama: k.nama_wilayah,
          ao_name: k.user?.nama || 'Belum Ada AO',
          tahun_awal_binaan: k.tahun_awal_binaan,
          jumlah_sd: k.sekolah?.filter((s) => s.jenjang === 'SD').length || 0,
          jumlah_smp: k.sekolah?.filter((s) => s.jenjang === 'SMP').length || 0,
          jumlah_smk: k.sekolah?.filter((s) => s.jenjang === 'SMK').length || 0,
        })),
    }));
  }

  async findAll(): Promise<Wilayah[]> {
    const wilayah = await this.wilayahRepository.find({
      relations: ['parent', 'user', 'sekolah'],
      order: { id_wilayah: 'DESC' },
    });

    return wilayah.map((item) => this.enrichWilayahStats(item));
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
    const namaWilayah = dto.nama_wilayah?.trim();

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
      kode_wilayah: dto.kode_wilayah,
      nama_wilayah: namaWilayah,
      tipe_wilayah: klasifikasi,
      jenis_wilayah: 'PROVINSI',
      deskripsi: dto.deskripsi || '',
      alamat_lengkap: dto.alamat_lengkap || '',
      status: dto.status ?? true,
      tahun_awal_binaan: dto.tahun_awal_binaan,
      id_parent: dto.id_parent,

      latitude: dto.latitude,
      longitude: dto.longitude,

      luas_wilayah: dto.luas_wilayah,
      letak_geografis: dto.letak_geografis,
      letak_astronomis: dto.letak_astronomis,
      bounds: dto.bounds,

      // Tidak boleh input manual dari Create Wilayah.
      // Nilai real dihitung dari tabel sekolah.
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

    const klasifikasi = this.normalizeKlasifikasi(
      dto.tipe_wilayah ||
        dto.keterangan ||
        dto.jenis_wilayah ||
        existing.tipe_wilayah,
    );

    const updatePayload: Partial<Wilayah> = {
      kode_wilayah: dto.kode_wilayah ?? existing.kode_wilayah,
      nama_wilayah: dto.nama_wilayah?.trim() || existing.nama_wilayah,
      tipe_wilayah: klasifikasi,
      jenis_wilayah: dto.jenis_wilayah || existing.jenis_wilayah || 'PROVINSI',
      deskripsi: dto.deskripsi ?? existing.deskripsi,
      alamat_lengkap: dto.alamat_lengkap ?? existing.alamat_lengkap,
      status: dto.status ?? existing.status,
      tahun_awal_binaan: dto.tahun_awal_binaan ?? existing.tahun_awal_binaan,
      id_parent: dto.id_parent ?? existing.id_parent,

      latitude: dto.latitude ?? existing.latitude,
      longitude: dto.longitude ?? existing.longitude,

      luas_wilayah: dto.luas_wilayah ?? existing.luas_wilayah,
      letak_geografis: dto.letak_geografis ?? existing.letak_geografis,
      letak_astronomis: dto.letak_astronomis ?? existing.letak_astronomis,
      bounds: dto.bounds ?? existing.bounds,
    };

    await this.wilayahRepository.update(id, updatePayload);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.wilayahRepository.update({ id_wilayah: id }, { status: false });
  }

  async checkDuplicateName(nama: string): Promise<boolean> {
    const decodedName = decodeURIComponent(nama).trim();

    const count = await this.wilayahRepository.count({
      where: { nama_wilayah: decodedName },
    });

    return count > 0;
  }
}
