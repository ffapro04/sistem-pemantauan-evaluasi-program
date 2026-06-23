/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { Wilayah } from '../wilayah/entities/wilayah.entity';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { NotificationRecipientType } from '../notifikasi/entities/notifikasi.entity';

@Injectable()
export class UsersService {
  private readonly ROLE_KEPALA_DINAS_ID = 7;
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,

    @InjectRepository(Wilayah)
    private wilayahRepo: Repository<Wilayah>,

    private readonly notifikasiService: NotifikasiService,
  ) {}

  private normalizeStatus(value: any, defaultValue = true) {
    if (value === undefined || value === null || value === '') {
      return defaultValue;
    }

    return value === true || value === 'true' || value === 1 || value === '1';
  }

  private getAuthUserId(authUser: any): number {
    const id = Number(
      authUser?.id_user ||
        authUser?.userId ||
        authUser?.sub ||
        authUser?.id ||
        authUser?.user?.id_user ||
        authUser?.user?.userId ||
        0,
    );

    if (!Number.isFinite(id) || id <= 0) {
      throw new BadRequestException('Identitas user dari token tidak valid.');
    }

    return id;
  }

  private normalizeProfileText(value: any): string {
    return String(value || '').trim();
  }

  private getChangedProfileFields(before: User, data: any): string[] {
    const changedFields: string[] = [];

    if (data.nama !== undefined) {
      const nextNama = this.normalizeProfileText(data.nama);
      if (nextNama && nextNama !== before.nama) changedFields.push('nama');
    }

    if (data.email !== undefined) {
      const nextEmail = this.normalizeProfileText(data.email);
      if (nextEmail && nextEmail !== before.email) changedFields.push('email');
    }

    if (data.password !== undefined && String(data.password || '').trim()) {
      changedFields.push('password');
    }

    if (data.foto_profile !== undefined) {
      const nextFoto = data.foto_profile || null;
      if (nextFoto !== (before.foto_profile || null)) {
        changedFields.push('foto_profile');
      }
    }

    return [...new Set(changedFields)];
  }

  private getProfileFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      nama: 'nama',
      email: 'email',
      password: 'password',
      foto_profile: 'foto profil',
    };

    return labels[field] || field;
  }

  private async notifyAdminsProfileUpdated(
    user: User,
    changedFields: string[],
  ) {
    if (!changedFields.length) return;

    const admins = await this.userRepo
      .createQueryBuilder('admin')
      .leftJoin('admin.role', 'role')
      .where('role.id_role = :adminRoleId', { adminRoleId: 1 })
      .andWhere('admin.status = true')
      .getMany();

    if (!admins.length) return;

    const fieldLabels = changedFields
      .map((field) => this.getProfileFieldLabel(field))
      .join(', ');

    await this.notifikasiService.createMany(
      admins.map((admin) => ({
        recipientType: NotificationRecipientType.USER,
        recipientId: admin.id_user,
        legacyUserId: admin.id_user,
        judul: 'Perubahan Profil User',
        pesan: `${user.nama} memperbarui ${fieldLabels} pada profil akunnya.`,
        tipe: 'PROFILE_UPDATE',
        targetUrl: `/admin/users/detail/${user.id_user}`,
        metadata: {
          id_user: user.id_user,
          nama: user.nama,
          email: user.email,
          changed_fields: changedFields,
        },
      })),
    );
  }

  private parseArrayValue(value: any): any[] {
    if (Array.isArray(value)) return value;

    if (typeof value === 'string' && value.trim()) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    return [];
  }

  private normalizeKabupatenTugas(value: any) {
    return this.parseArrayValue(value)
      .filter((item) => item && (item.nama_kabupaten || item.nama_wilayah))
      .map((item, index) => {
        const kodeProvinsi = item.kode_provinsi || item.kode_wilayah || null;
        const namaProvinsi = item.nama_provinsi || item.provinsi || null;
        const namaKabupaten = item.nama_kabupaten || item.nama_wilayah || '';

        return {
          id_provinsi: item.id_provinsi ? Number(item.id_provinsi) : null,
          kode_provinsi: kodeProvinsi,
          nama_provinsi: namaProvinsi,
          id_kabupaten: item.id_kabupaten
            ? Number(item.id_kabupaten)
            : item.id_wilayah
              ? Number(item.id_wilayah)
              : null,
          id_wilayah: item.id_wilayah
            ? Number(item.id_wilayah)
            : item.id_kabupaten
              ? Number(item.id_kabupaten)
              : null,
          kode_kabupaten:
            item.kode_kabupaten ||
            `${kodeProvinsi || 'KAB'}-${String(index + 1).padStart(3, '0')}`,
          nama_kabupaten: namaKabupaten,
        };
      });
  }

  private getWilayahIdsFromData(data: any): number[] {
    const rawIds =
      data?.id_wilayahs !== undefined
        ? this.parseArrayValue(data.id_wilayahs)
        : data?.id_wilayah !== undefined &&
            data?.id_wilayah !== null &&
            data?.id_wilayah !== ''
          ? [data.id_wilayah]
          : [];

    return [
      ...new Set(
        rawIds
          .map((item) => Number(item))
          .filter((item) => Number.isFinite(item) && item > 0),
      ),
    ];
  }

  private hasWilayahAssignmentPayload(data: any): boolean {
    return data?.id_wilayah !== undefined || data?.id_wilayahs !== undefined;
  }

  private async buildKepalaDinasWilayahSnapshot(data: any) {
    const wilayahIds = this.getWilayahIdsFromData(data);

    if (wilayahIds.length === 0) {
      return [];
    }

    if (wilayahIds.length > 1) {
      throw new BadRequestException(
        'Satu Kepala Dinas hanya dapat memiliki satu provinsi.',
      );
    }

    const wilayah = await this.wilayahRepo.findOne({
      where: {
        id_wilayah: wilayahIds[0],
      },
    });

    if (!wilayah) {
      throw new NotFoundException(
        `Wilayah dengan ID ${wilayahIds[0]} tidak ditemukan.`,
      );
    }

    const jenisWilayah = String(
      wilayah.jenis_wilayah || wilayah.tipe_wilayah || '',
    ).toUpperCase();

    if (!jenisWilayah.includes('PROV')) {
      throw new BadRequestException(
        'Wilayah Kepala Dinas harus berupa provinsi.',
      );
    }

    return [
      {
        id_provinsi: wilayah.id_wilayah,
        id_wilayah: wilayah.id_wilayah,
        kode_provinsi: wilayah.kode_wilayah || null,
        nama_provinsi: wilayah.nama_wilayah,
        nama_wilayah: wilayah.nama_wilayah,
        nama_kabupaten: wilayah.nama_wilayah,
      },
    ];
  }

  private async syncWilayahAssignment(
    userId: number,
    data: any,
    roleId: number,
  ) {
    if (!this.hasWilayahAssignmentPayload(data)) {
      return;
    }

    /**
     * Khusus Kepala Dinas.
     *
     * Provinsi disimpan sebagai snapshot pada kabupaten_tugas,
     * sehingga tidak berebut m_wilayah.id_user dengan role lain.
     */
    if (Number(roleId) === this.ROLE_KEPALA_DINAS_ID) {
      const wilayahSnapshot = await this.buildKepalaDinasWilayahSnapshot(data);

      /**
       * Bersihkan relasi lama milik Kepala Dinas ini.
       * Tidak mengubah relasi user lain.
       */
      await this.wilayahRepo.query(
        `
      UPDATE "m_wilayah"
      SET "id_user" = NULL
      WHERE "id_user" = $1
    `,
        [userId],
      );

      /**
       * Simpan wilayah Kepala Dinas sebagai snapshot
       * agar tidak berebut dengan role lainnya.
       */
      await this.userRepo.query(
        `
    UPDATE public.m_users
    SET
      kabupaten_tugas = $1::jsonb,
      updated_at = NOW()
    WHERE id_user = $2
  `,
        [JSON.stringify(wilayahSnapshot), userId],
      );

      return;
    }

    /**
     * Role lain tetap memakai mekanisme lama.
     */
    const wilayahIds = this.getWilayahIdsFromData(data);

    await this.wilayahRepo.query(
      `
      UPDATE "m_wilayah"
      SET "id_user" = NULL
      WHERE "id_user" = $1
    `,
      [userId],
    );

    if (wilayahIds.length === 0) {
      return;
    }

    await this.wilayahRepo.query(
      `
      UPDATE "m_wilayah"
      SET "id_user" = $1
      WHERE "id_wilayah" = ANY($2::int[])
    `,
      [userId, wilayahIds],
    );
  }

  private async hydrateKepalaDinasWilayah(
    user: User | null,
  ): Promise<User | null> {
    if (!user) {
      return null;
    }

    const roleId = Number(user.role?.id_role || user.id_role || 0);

    // Role selain Kepala Dinas tidak disentuh.
    if (roleId !== this.ROLE_KEPALA_DINAS_ID) {
      return user;
    }

    const tugas = Array.isArray(user.kabupaten_tugas)
      ? user.kabupaten_tugas
      : [];

    const wilayahIds = [
      ...new Set(
        tugas
          .map((item: any) => item?.id_provinsi || item?.id_wilayah || null)
          .map((id: any) => Number(id))
          .filter((id: number) => Number.isFinite(id) && id > 0),
      ),
    ];

    if (wilayahIds.length === 0) {
      user.wilayah = [];
      return user;
    }

    user.wilayah = await this.wilayahRepo.find({
      where: {
        id_wilayah: In(wilayahIds),
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.userRepo.find({
      relations: ['role', 'sekolah', 'wilayah'],
      order: {
        id_user: 'DESC',
      },
    });

    const hydratedUsers = await Promise.all(
      users.map((user) => this.hydrateKepalaDinasWilayah(user)),
    );

    return hydratedUsers;
  }

  async findOne(id: number) {
    if (!id) {
      throw new BadRequestException('ID User wajib disertakan');
    }

    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.wilayah', 'wilayah')
      .leftJoinAndSelect('user.sekolah', 'sekolah')
      .addSelect('user.password')
      .where('user.id_user = :id', { id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User dengan ID #${id} tidak ditemukan`);
    }

    delete user.password;

    return this.hydrateKepalaDinasWilayah(user);
  }

  async getUsersByRole(roleName: string) {
    const users = await this.userRepo.find({
      where: {
        role: {
          nama_role: roleName,
        },
      },
      relations: ['role', 'wilayah', 'sekolah'],
      order: {
        nama: 'ASC',
      },
    });

    const hydratedUsers = await Promise.all(
      users.map((user) => this.hydrateKepalaDinasWilayah(user)),
    );

    return hydratedUsers;
  }

  async findByEmail(email: string) {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.wilayah', 'wilayah')
      .leftJoinAndSelect('user.sekolah', 'sekolah')
      .addSelect('user.password')
      .where('LOWER(TRIM(user.email)) = LOWER(TRIM(:email))', {
        email,
      })
      .getOne();

    if (!user) {
      return null;
    }

    return this.hydrateKepalaDinasWilayah(user);
  }

  async create(data: any) {
    const existing = await this.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    try {
      const newUser = this.userRepo.create({
        nama: data.nama,
        email: data.email,
        password: data.password,

        jabatan: data.jabatan || null,
        no_telp: data.no_telp || null,
        jenis: data.jenis || null,
        sub_jenis: data.sub_jenis || null,
        foto_profile: data.foto_profile || null,

        kabupaten_tugas: this.normalizeKabupatenTugas(data.kabupaten_tugas),

        status: this.normalizeStatus(data.status, true),

        role: data.id_role ? ({ id_role: Number(data.id_role) } as any) : null,

        sekolah: data.id_sekolah
          ? ({ id_sekolah: Number(data.id_sekolah) } as any)
          : null,
      });

      const savedUser = await this.userRepo.save(newUser);

      const roleId = Number(
        data.id_role || savedUser.role?.id_role || savedUser.id_role || 0,
      );

      await this.syncWilayahAssignment(savedUser.id_user, data, roleId);

      return this.findOne(savedUser.id_user);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('CREATE USER ERROR:', error);

      throw new InternalServerErrorException(
        error?.detail || error?.message || 'Gagal menyimpan user ke database.',
      );
    }
  }

  async updateOwnProfile(authUser: any, data: any) {
    const id = this.getAuthUserId(authUser);

    const user = await this.userRepo.findOne({
      where: { id_user: id },
      relations: ['role', 'sekolah', 'wilayah'],
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    const changedFields = this.getChangedProfileFields(user, data);

    if (!changedFields.length) {
      return this.findOne(id);
    }

    try {
      if (data.nama !== undefined) {
        const nama = this.normalizeProfileText(data.nama);

        if (!nama) {
          throw new BadRequestException('Nama tidak boleh kosong.');
        }

        user.nama = nama;
      }

      if (data.email !== undefined) {
        const email = this.normalizeProfileText(data.email).toLowerCase();

        if (!email) {
          throw new BadRequestException('Email tidak boleh kosong.');
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new BadRequestException('Format email tidak valid.');
        }

        if (email !== user.email) {
          const existingEmail = await this.findByEmail(email);

          if (existingEmail && Number(existingEmail.id_user) !== Number(id)) {
            throw new ConflictException('Email sudah digunakan oleh user lain');
          }
        }

        user.email = email;
      }

      if (data.password !== undefined && String(data.password || '').trim()) {
        const password = String(data.password).trim();

        if (password.length < 6) {
          throw new BadRequestException('Password minimal 6 karakter.');
        }

        user.password = password;
      }

      if (data.foto_profile !== undefined) {
        user.foto_profile = data.foto_profile || null;
      }

      const updatedUser = await this.userRepo.save(user);

      await this.notifyAdminsProfileUpdated(updatedUser, changedFields);

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('UPDATE OWN PROFILE ERROR:', error);

      throw new InternalServerErrorException(
        error?.detail || error?.message || 'Gagal memperbarui profil akun.',
      );
    }
  }

  async update(id: number, data: any) {
    const user = await this.userRepo.findOne({
      where: { id_user: id },
      relations: ['role', 'sekolah', 'wilayah'],
    });

    if (!user) {
      throw new NotFoundException('User tidak ditemukan');
    }

    try {
      const email = data.email ? String(data.email).trim() : undefined;

      if (email && email !== user.email) {
        const existingEmail = await this.findByEmail(email);

        if (existingEmail && Number(existingEmail.id_user) !== Number(id)) {
          throw new ConflictException('Email sudah digunakan oleh user lain');
        }
      }

      if (data.nama !== undefined) {
        user.nama = String(data.nama || '').trim();
      }

      if (email !== undefined) {
        user.email = email;
      }

      if (data.jabatan !== undefined) {
        user.jabatan = data.jabatan || null;
      }

      if (data.no_telp !== undefined) {
        user.no_telp = data.no_telp || null;
      }

      if (data.jenis !== undefined) {
        user.jenis = data.jenis || null;
      }

      if (data.sub_jenis !== undefined) {
        user.sub_jenis = data.sub_jenis || null;
      }

      if (data.foto_profile !== undefined) {
        user.foto_profile = data.foto_profile || null;
      }

      if (data.kabupaten_tugas !== undefined) {
        user.kabupaten_tugas = this.normalizeKabupatenTugas(
          data.kabupaten_tugas,
        );
      }

      if (data.status !== undefined) {
        user.status = this.normalizeStatus(data.status, user.status ?? true);
      }

      if (data.password && String(data.password).trim()) {
        user.password = String(data.password);
      }

      if (data.id_role !== undefined && data.id_role !== '') {
        const roleId = Number(data.id_role);

        if (Number.isNaN(roleId)) {
          throw new BadRequestException('ID Role tidak valid');
        }

        user.role = { id_role: roleId } as any;
      }

      if (data.id_sekolah !== undefined && data.id_sekolah !== '') {
        const sekolahId = Number(data.id_sekolah);

        if (Number.isNaN(sekolahId)) {
          throw new BadRequestException('ID Sekolah tidak valid');
        }

        user.sekolah = { id_sekolah: sekolahId } as any;
      }

      if (data.id_sekolah === null || data.id_sekolah === '') {
        user.sekolah = null;
      }

      const updatedUser = await this.userRepo.save(user);

      const roleId = Number(
        data.id_role !== undefined && data.id_role !== ''
          ? data.id_role
          : updatedUser.role?.id_role ||
              updatedUser.id_role ||
              user.role?.id_role ||
              user.id_role ||
              0,
      );

      await this.syncWilayahAssignment(id, data, roleId);

      return this.findOne(id);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('UPDATE USER ERROR:', error);

      throw new InternalServerErrorException(
        error?.detail || error?.message || 'Gagal memperbarui data user.',
      );
    }
  }

  async remove(id: number) {
    const user = await this.userRepo.findOne({
      where: { id_user: id },
    });

    if (!user) {
      throw new NotFoundException('User tidak ada');
    }

    await this.wilayahRepo.query(
      'UPDATE "m_wilayah" SET "id_user" = NULL WHERE "id_user" = $1',
      [id],
    );

    await this.userRepo.delete(id);

    return {
      success: true,
      message: 'User berhasil dihapus',
    };
  }

  async register(data: any) {
    const existing = await this.findByEmail(data.email);

    if (existing) {
      throw new ConflictException('Email sudah terdaftar');
    }

    try {
      const user = this.userRepo.create({
        nama: data.nama,
        email: data.email,
        password: data.password,

        jabatan: data.jabatan || null,
        no_telp: data.no_telp || null,
        jenis: data.jenis || null,
        sub_jenis: data.sub_jenis || null,

        status: this.normalizeStatus(data.status, true),

        role: data.id_role
          ? ({ id_role: Number(data.id_role) } as any)
          : ({ id_role: 5 } as any),

        sekolah: data.id_sekolah
          ? ({ id_sekolah: Number(data.id_sekolah) } as any)
          : null,
      });

      const savedUser = await this.userRepo.save(user);

      const roleId = Number(
        data.id_role || savedUser.role?.id_role || savedUser.id_role || 5,
      );

      await this.syncWilayahAssignment(savedUser.id_user, data, roleId);

      return this.findOne(savedUser.id_user);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      console.error('REGISTER USER ERROR:', error);

      throw new InternalServerErrorException(
        error?.detail || error?.message || 'Gagal registrasi user.',
      );
    }
  }
}
