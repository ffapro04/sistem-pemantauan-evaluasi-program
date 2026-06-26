/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { AssessmentGuru } from '../assessment-guru/entities/assessment-guru.entity';
import { NotificationRecipientType } from '../notifikasi/entities/notifikasi.entity';
import { NotifikasiService } from '../notifikasi/notifikasi.service';
import { User } from '../users/user.entity';
import { Wilayah } from '../wilayah/entities/wilayah.entity';
import { CreateAdminAgendaDto } from './dto/create-admin-agenda.dto';
import { UpdateAdminAgendaStatusDto } from './dto/update-admin-agenda-status.dto';
import { UpdateAdminAgendaDto } from './dto/update-admin-agenda.dto';
import {
  AdminAgenda,
  AdminAgendaStatus,
  AdminAgendaVisibilityScope,
} from './entities/admin-agenda.entity';
import {
  AdminAgendaParticipant,
  AdminAgendaParticipantType,
} from './entities/admin-agenda-participant.entity';

export type AgendaAuthIdentity = {
  id: number;
  roleId: number;
  roleName: string;
  jenis?: string | null;
  subJenis?: string | null;
  idSekolah?: number | null;
  jenjang?: string | null;
  wilayahIds?: number[];
  recipientType:
    | AdminAgendaParticipantType.USER
    | AdminAgendaParticipantType.GURU_ASSESSMENT;
};

type ParticipantInput = {
  participant_type: AdminAgendaParticipantType;
  participant_id: number;
};

type RecipientDescriptor = {
  participantType:
    | AdminAgendaParticipantType.USER
    | AdminAgendaParticipantType.GURU_ASSESSMENT;
  participantId: number;
  name: string;
  email: string;
  roleName: string;
  roleId: number;
  jenis?: string | null;
};

type NotificationMode =
  | 'CREATED'
  | 'UPDATED'
  | 'STATUS'
  | 'REMOVED'
  | 'CANCELLED';

@Injectable()
export class AdminAgendaService {
  constructor(
    @InjectRepository(AdminAgenda)
    private readonly agendaRepository: Repository<AdminAgenda>,

    @InjectRepository(AdminAgendaParticipant)
    private readonly participantRepository: Repository<AdminAgendaParticipant>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(AssessmentGuru)
    private readonly guruRepository: Repository<AssessmentGuru>,

    @InjectRepository(Wilayah)
    private readonly wilayahRepository: Repository<Wilayah>,

    private readonly notifikasiService: NotifikasiService,
  ) {}

  private isAdmin(identity: AgendaAuthIdentity) {
    const role = String(identity?.roleName || '').toLowerCase();

    return (
      Number(identity?.roleId) === 1 ||
      role === 'admin' ||
      role.includes('administrator')
    );
  }

  private ensureAdmin(identity: AgendaAuthIdentity) {
    if (!this.isAdmin(identity)) {
      throw new ForbiddenException('Hanya Admin yang dapat mengelola COE');
    }
  }

  private cleanText(value: any) {
    const text = String(value ?? '').trim();
    return text || null;
  }

  private normalizeTime(value: any) {
    const text = this.cleanText(value);
    return text ? text.slice(0, 8) : null;
  }

  private normalizePilar(value: any) {
    const text = String(value || '')
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, '_');

    if (text.includes('KECAKAPAN')) return 'KECAKAPAN_HIDUP';
    if (text.includes('SENI')) return 'SENI_BUDAYA';
    if (text.includes('KARAKTER')) return 'KARAKTER';
    if (text.includes('AKADEMIK')) return 'AKADEMIK';

    return null;
  }

  private normalizeActivityType(value: any) {
    const text = String(value || '')
      .trim()
      .toUpperCase()
      .replace(/[-\s]+/g, '_');

    if (text.includes('OUT')) return 'OUTDOOR';
    if (text.includes('DAR') || text.includes('ONLINE') || text.includes('VIA')) {
      return 'DARING';
    }
    if (text.includes('IN')) return 'INDOOR';

    return null;
  }

  private normalizeTextList(value: any) {
    const rows = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(',')
        : [];

    return [
      ...new Set(
        rows
          .map((item) => String(item || '').trim().toUpperCase())
          .filter(Boolean),
      ),
    ];
  }

  private normalizeNumberList(value: any) {
    const rows = Array.isArray(value)
      ? value
      : typeof value === 'string'
        ? value.split(',')
        : [];

    return [
      ...new Set(
        rows.map((item) => Number(item || 0)).filter((item) => item > 0),
      ),
    ];
  }

  private getAllowedPillars(identity: AgendaAuthIdentity) {
    const roleId = Number(identity?.roleId || 0);
    const jenis = String(identity?.jenis || '').toLowerCase();

    if (roleId === 3) {
      return jenis.includes('non')
        ? ['SENI_BUDAYA', 'KECAKAPAN_HIDUP']
        : ['AKADEMIK', 'KARAKTER'];
    }

    return ['AKADEMIK', 'KARAKTER', 'SENI_BUDAYA', 'KECAKAPAN_HIDUP'];
  }

  private getAllowedJenjang(identity: AgendaAuthIdentity) {
    const roleId = Number(identity?.roleId || 0);
    const subJenis = String(identity?.subJenis || '').toUpperCase();
    const jenjang = String(identity?.jenjang || '').toUpperCase();

    if (roleId === 3) {
      if (subJenis.includes('SMK')) return ['SMK'];
      if (subJenis.includes('SD') && subJenis.includes('SMP')) return ['SD', 'SMP'];
      if (subJenis.includes('SMP')) return ['SMP'];
      if (subJenis.includes('SD')) return ['SD'];
    }

    if ([5, 8, 9, 10].includes(roleId) && jenjang) {
      return [jenjang];
    }

    return ['SD', 'SMP', 'SMK'];
  }

  private async getAccessibleWilayahIds(identity: AgendaAuthIdentity) {
    const baseIds = this.normalizeNumberList(identity?.wilayahIds || []);

    if (Number(identity?.roleId || 0) !== 7 || !baseIds.length) {
      return baseIds;
    }

    const childRows = await this.wilayahRepository.find({
      where: { id_parent: In(baseIds) as any },
    });

    return [
      ...new Set([
        ...baseIds,
        ...childRows.map((item) => Number(item.id_wilayah)).filter(Boolean),
      ]),
    ];
  }

  private agendaMatchesIdentity(
    agenda: AdminAgenda,
    identity: AgendaAuthIdentity,
    accessibleWilayahIds?: number[],
  ) {
    if (this.isAdmin(identity) || Number(identity?.roleId) === 2) return true;

    const pilar = this.normalizePilar((agenda as any).pilar);
    const allowedPillars = this.getAllowedPillars(identity);
    if (pilar && !allowedPillars.includes(pilar)) return false;

    const agendaJenjangs = this.normalizeTextList((agenda as any).jenjang_targets);
    const allowedJenjangs = this.getAllowedJenjang(identity);
    if (
      agendaJenjangs.length &&
      !agendaJenjangs.some((item) => allowedJenjangs.includes(item))
    ) {
      return false;
    }

    const agendaWilayahIds = this.normalizeNumberList((agenda as any).wilayah_targets);
    const userWilayahIds = this.normalizeNumberList(
      accessibleWilayahIds || identity?.wilayahIds || [],
    );
    if (
      [4, 7].includes(Number(identity?.roleId || 0)) &&
      agendaWilayahIds.length &&
      !agendaWilayahIds.some((item) => userWilayahIds.includes(item))
    ) {
      return false;
    }

    return true;
  }

  private participantKey(type: AdminAgendaParticipantType, id: number) {
    return `${type}:${Number(id)}`;
  }

  private buildAgendaPath(recipient: RecipientDescriptor, agendaId?: number) {
    const query = agendaId ? `?agenda=${agendaId}` : '';

    if (
      recipient.participantType === AdminAgendaParticipantType.GURU_ASSESSMENT
    ) {
      return `/sekolah/agenda${query}`;
    }

    switch (recipient.roleId) {
      case 1:
        return `/admin/agenda${query}`;
      case 2:
        return `/pengurus/agenda${query}`;
      case 3: {
        const isNonAkademik = String(recipient.jenis || '')
          .toLowerCase()
          .includes('non');

        return `/ho/penjadwalan/${
          isNonAkademik ? 'non-akademik' : 'akademik'
        }${query}`;
      }
      case 4:
        return `/ao/agenda${query}`;
      case 5:
      case 8:
      case 9:
        return `/sekolah/agenda${query}`;
      case 6:
      return `/vendor/agenda${query}`;
      case 10:
        return `/kepala-sekolah/dashboard${query}`;
      default:
        return `/`;
    }
  }

  private async resolveRecipients(
    participants: ParticipantInput[] = [],
  ): Promise<RecipientDescriptor[]> {
    const uniqueParticipants = new Map<string, ParticipantInput>();

    for (const participant of participants) {
      const type = participant?.participant_type;
      const id = Number(participant?.participant_id || 0);

      if (
        !id ||
        ![
          AdminAgendaParticipantType.USER,
          AdminAgendaParticipantType.GURU_ASSESSMENT,
        ].includes(type as any)
      ) {
        throw new BadRequestException(
          'Participant agenda harus berupa USER atau GURU_ASSESSMENT',
        );
      }

      uniqueParticipants.set(this.participantKey(type, id), {
        participant_type: type,
        participant_id: id,
      });
    }

    const participantRows = [...uniqueParticipants.values()];

    const userIds = participantRows
      .filter(
        (participant) =>
          participant.participant_type === AdminAgendaParticipantType.USER,
      )
      .map((participant) => participant.participant_id);

    const guruIds = participantRows
      .filter(
        (participant) =>
          participant.participant_type ===
          AdminAgendaParticipantType.GURU_ASSESSMENT,
      )
      .map((participant) => participant.participant_id);

    const [users, gurus] = await Promise.all([
      userIds.length
        ? this.userRepository.find({
            where: { id_user: In(userIds) },
            relations: ['role', 'sekolah'],
          })
        : [],
      guruIds.length
        ? this.guruRepository.find({
            where: { id_guru_assessment: In(guruIds) },
          })
        : [],
    ]);

    const userMap = new Map<number, User>(
      users.map((user): [number, User] => [Number(user.id_user), user]),
    );

    const guruMap = new Map<number, AssessmentGuru>(
      gurus.map((guru): [number, AssessmentGuru] => [
        Number(guru.id_guru_assessment),
        guru,
      ]),
    );

    const recipients: RecipientDescriptor[] = [];

    for (const participant of participantRows) {
      if (participant.participant_type === AdminAgendaParticipantType.USER) {
        const user: any = userMap.get(participant.participant_id);

        if (!user || user.status === false) {
          throw new BadRequestException(
            `User #${participant.participant_id} tidak aktif atau tidak ditemukan`,
          );
        }

        const roleId = Number(user.id_role || user.role?.id_role || 0);

        if (roleId === 7) {
          throw new BadRequestException(
            'Kepala Dinas tidak dapat dipilih sebagai peserta COE',
          );
        }

        recipients.push({
          participantType: AdminAgendaParticipantType.USER,
          participantId: Number(user.id_user),
          name: user.nama || 'User',
          email: user.email || '',
          roleName: user.role?.nama_role || user.jabatan || 'User',
          roleId,
          jenis: user.jenis || null,
        });

        continue;
      }

      const guru: any = guruMap.get(participant.participant_id);

      if (!guru || guru.is_active === false) {
        throw new BadRequestException(
          `Guru Assessment #${participant.participant_id} tidak aktif atau tidak ditemukan`,
        );
      }

      recipients.push({
        participantType: AdminAgendaParticipantType.GURU_ASSESSMENT,
        participantId: Number(guru.id_guru_assessment),
        name: guru.nama_guru || 'Guru Assessment',
        email: guru.email_guru || guru.email || '',
        roleName: 'Guru Assessment',
        roleId: 8,
      });
    }

    return recipients;
  }

  private async saveParticipants(
    agendaId: number,
    recipients: RecipientDescriptor[],
    manager: EntityManager,
  ) {
    if (!recipients.length) return [];

    const repository = manager.getRepository(AdminAgendaParticipant);

    const rows = recipients.map((recipient) =>
      repository.create({
        id_agenda: agendaId,
        participant_type: recipient.participantType,
        participant_id: recipient.participantId,
        participant_name_snapshot: recipient.name,
        participant_email_snapshot: recipient.email || null,
        role_name_snapshot: recipient.roleName,
      }),
    );

    return repository.save(rows);
  }

  private async notifyRecipients(
    recipients: RecipientDescriptor[],
    agenda: AdminAgenda,
    mode: NotificationMode,
    manager?: EntityManager,
  ) {
    if (!recipients.length) return [];

    const titleMap: Record<NotificationMode, string> = {
      CREATED: 'Anda ditambahkan ke COE baru',
      UPDATED: 'COE diperbarui oleh Admin',
      STATUS: 'Status COE diperbarui',
      REMOVED: 'Anda dikeluarkan dari peserta COE',
      CANCELLED: 'COE dibatalkan',
    };

    const rows = recipients.map((recipient) => {
      let message = `COE “${agenda.title}” dijadwalkan pada ${agenda.agenda_date}`;

      if (agenda.start_time) {
        message += ` pukul ${String(agenda.start_time).slice(0, 5)}`;
      }

      message += '.';

      if (mode === 'STATUS') {
        message = `Status COE “${agenda.title}” berubah menjadi ${agenda.status}.`;
      }

      if (mode === 'REMOVED') {
        message = `Anda tidak lagi terdaftar sebagai peserta COE “${agenda.title}”.`;
      }

      if (mode === 'CANCELLED') {
        message = `COE “${agenda.title}” telah dibatalkan atau dihapus oleh Admin.`;
      }

      const hasAgendaLink = !['REMOVED', 'CANCELLED'].includes(mode);

      return {
        recipientType:
          recipient.participantType ===
          AdminAgendaParticipantType.GURU_ASSESSMENT
            ? NotificationRecipientType.GURU_ASSESSMENT
            : NotificationRecipientType.USER,
        recipientId: recipient.participantId,
        legacyUserId:
          recipient.participantType === AdminAgendaParticipantType.USER
            ? recipient.participantId
            : null,
        judul: titleMap[mode],
        pesan: message,
        tipe: mode === 'STATUS' ? 'AGENDA_STATUS' : 'AGENDA',
        targetUrl: this.buildAgendaPath(
          recipient,
          hasAgendaLink ? agenda.id_agenda : undefined,
        ),
        idAgenda: hasAgendaLink ? agenda.id_agenda : null,
        metadata: {
          agenda_id: agenda.id_agenda,
          agenda_status: agenda.status,
          mode,
        },
      };
    });

    return this.notifikasiService.createMany(rows, manager);
  }

  async getMentionOptions(identity: AgendaAuthIdentity) {
    this.ensureAdmin(identity);

    const [users, gurus] = await Promise.all([
      this.userRepository.find({
        relations: ['role', 'sekolah'],
        order: { nama: 'ASC' },
      }),
      this.guruRepository.find({
        order: { nama_guru: 'ASC' },
      }),
    ]);

    const userOptions = users
      .filter((user: any) => user.status !== false)
      .filter(
        (user: any) => Number(user.id_role || user.role?.id_role || 0) !== 7,
      )
      .map((user: any) => ({
        key: `${AdminAgendaParticipantType.USER}:${user.id_user}`,
        participant_type: AdminAgendaParticipantType.USER,
        participant_id: Number(user.id_user),
        name: user.nama || 'User',
        email: user.email || '',
        role_label: user.role?.nama_role || user.jabatan || 'User',
        meta: user.sekolah?.nama_sekolah || user.jenis || user.sub_jenis || '',
      }));

    const guruOptions = gurus
      .filter((guru: any) => guru.is_active !== false)
      .map((guru: any) => ({
        key: `${AdminAgendaParticipantType.GURU_ASSESSMENT}:${guru.id_guru_assessment}`,
        participant_type: AdminAgendaParticipantType.GURU_ASSESSMENT,
        participant_id: Number(guru.id_guru_assessment),
        name: guru.nama_guru || 'Guru Assessment',
        email: guru.email_guru || guru.email || '',
        role_label: 'Guru Assessment',
        meta: guru.mata_pelajaran || guru.jenis_guru || '',
      }));

    return [...userOptions, ...guruOptions].sort((a, b) =>
      String(a.name).localeCompare(String(b.name), 'id'),
    );
  }

  async findAll(identity: AgendaAuthIdentity) {
    const query = this.agendaRepository
      .createQueryBuilder('agenda')
      .leftJoinAndSelect('agenda.participants', 'participant')
      .orderBy('agenda.agenda_date', 'ASC')
      .addOrderBy('agenda.start_time', 'ASC')
      .addOrderBy('agenda.created_at', 'DESC');

    const rows = await query.getMany();

    if (this.isAdmin(identity)) return rows;

    const accessibleWilayahIds = await this.getAccessibleWilayahIds(identity);

    return rows.filter((agenda) => {
      const mentioned = (agenda.participants || []).some(
        (participant) =>
          participant.participant_type === identity.recipientType &&
          Number(participant.participant_id) === Number(identity.id),
      );

      return (
        mentioned ||
        this.agendaMatchesIdentity(agenda, identity, accessibleWilayahIds)
      );
    });
  }

  async findOne(id: number, identity: AgendaAuthIdentity) {
    const agenda = await this.agendaRepository.findOne({
      where: { id_agenda: id },
      relations: ['participants'],
    });

    if (!agenda) {
      throw new NotFoundException('Agenda tidak ditemukan');
    }

    if (!this.isAdmin(identity)) {
      const allowed = (agenda.participants || []).some(
        (participant) =>
          participant.participant_type === identity.recipientType &&
          Number(participant.participant_id) === Number(identity.id),
      );

      if (!allowed) {
        throw new ForbiddenException('Agenda tidak ditujukan kepada akun ini');
      }
    }

    return agenda;
  }

  async create(dto: CreateAdminAgendaDto, identity: AgendaAuthIdentity) {
    this.ensureAdmin(identity);

    const recipients = await this.resolveRecipients(dto.participants || []);

    if (!recipients.length) {
      throw new BadRequestException('Minimal satu peserta wajib dipilih');
    }

    return this.agendaRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(AdminAgenda);

      const agenda = repository.create({
        title: String(dto.title).trim(),
        description: this.cleanText(dto.description),
        agenda_date: dto.agenda_date,
        start_time: this.normalizeTime(dto.start_time),
        end_time: this.normalizeTime(dto.end_time),
          location: this.cleanText(dto.location),
          pilar: this.normalizePilar(dto.pilar),
          activity_type: this.normalizeActivityType(dto.activity_type),
          meeting_link: this.cleanText(dto.meeting_link),
          jenjang_targets: this.normalizeTextList(dto.jenjang_targets),
          wilayah_targets: this.normalizeNumberList(dto.wilayah_targets),
          status: dto.status || AdminAgendaStatus.SCHEDULED,
        visibility_scope: AdminAgendaVisibilityScope.TARGETED,
        status_note: this.cleanText(dto.status_note),
        created_by: identity.id,
      });

      const savedAgenda = await repository.save(agenda);

      await this.saveParticipants(savedAgenda.id_agenda, recipients, manager);

      await this.notifyRecipients(recipients, savedAgenda, 'CREATED', manager);

      return repository.findOne({
        where: { id_agenda: savedAgenda.id_agenda },
        relations: ['participants'],
      });
    });
  }

  async update(
    id: number,
    dto: UpdateAdminAgendaDto,
    identity: AgendaAuthIdentity,
  ) {
    this.ensureAdmin(identity);

    const currentAgenda = await this.findOne(id, identity);

    const oldRecipients = await this.resolveRecipients(
      (currentAgenda.participants || []).map((participant) => ({
        participant_type: participant.participant_type,
        participant_id: participant.participant_id,
      })),
    );

    const newRecipients = dto.participants
      ? await this.resolveRecipients(dto.participants)
      : oldRecipients;

    if (!newRecipients.length) {
      throw new BadRequestException('Minimal satu peserta wajib dipilih');
    }

    const newRecipientMap = new Map(
      newRecipients.map((recipient) => [
        this.participantKey(recipient.participantType, recipient.participantId),
        recipient,
      ]),
    );

    const removedRecipients = oldRecipients.filter(
      (recipient) =>
        !newRecipientMap.has(
          this.participantKey(
            recipient.participantType,
            recipient.participantId,
          ),
        ),
    );

    const scheduleChanged =
      (dto.agenda_date !== undefined &&
        dto.agenda_date !== currentAgenda.agenda_date) ||
      (dto.start_time !== undefined &&
        this.normalizeTime(dto.start_time) !==
          this.normalizeTime(currentAgenda.start_time)) ||
      (dto.end_time !== undefined &&
        this.normalizeTime(dto.end_time) !==
          this.normalizeTime(currentAgenda.end_time));

    return this.agendaRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(AdminAgenda);
      const agenda = await repository.findOneBy({ id_agenda: id });

      if (!agenda) {
        throw new NotFoundException('Agenda tidak ditemukan');
      }

      if (dto.title !== undefined) {
        agenda.title = String(dto.title).trim();
      }

      if (dto.description !== undefined) {
        agenda.description = this.cleanText(dto.description);
      }

      if (dto.agenda_date !== undefined) {
        agenda.agenda_date = dto.agenda_date;
      }

      if (dto.start_time !== undefined) {
        agenda.start_time = this.normalizeTime(dto.start_time);
      }

      if (dto.end_time !== undefined) {
        agenda.end_time = this.normalizeTime(dto.end_time);
      }

      if (dto.location !== undefined) {
        agenda.location = this.cleanText(dto.location);
      }

      if (dto.pilar !== undefined) {
        agenda.pilar = this.normalizePilar(dto.pilar);
      }

      if (dto.activity_type !== undefined) {
        agenda.activity_type = this.normalizeActivityType(dto.activity_type);
      }

      if (dto.meeting_link !== undefined) {
        agenda.meeting_link = this.cleanText(dto.meeting_link);
      }

      if (dto.jenjang_targets !== undefined) {
        agenda.jenjang_targets = this.normalizeTextList(dto.jenjang_targets);
      }

      if (dto.wilayah_targets !== undefined) {
        agenda.wilayah_targets = this.normalizeNumberList(dto.wilayah_targets);
      }

      if (dto.status_note !== undefined) {
        agenda.status_note = this.cleanText(dto.status_note);
      }

      agenda.visibility_scope = AdminAgendaVisibilityScope.TARGETED;

      if (dto.status) {
        agenda.status = dto.status;
      } else if (scheduleChanged) {
        agenda.status = AdminAgendaStatus.RESCHEDULED;
      }

      const savedAgenda = await repository.save(agenda);

      if (dto.participants) {
        await manager
          .getRepository(AdminAgendaParticipant)
          .delete({ id_agenda: id });

        await this.saveParticipants(id, newRecipients, manager);
      }

      await this.notifyRecipients(
        newRecipients,
        savedAgenda,
        'UPDATED',
        manager,
      );

      await this.notifyRecipients(
        removedRecipients,
        savedAgenda,
        'REMOVED',
        manager,
      );

      return repository.findOne({
        where: { id_agenda: id },
        relations: ['participants'],
      });
    });
  }

  async updateStatus(
    id: number,
    dto: UpdateAdminAgendaStatusDto,
    identity: AgendaAuthIdentity,
  ) {
    this.ensureAdmin(identity);

    const currentAgenda = await this.findOne(id, identity);

    const recipients = await this.resolveRecipients(
      (currentAgenda.participants || []).map((participant) => ({
        participant_type: participant.participant_type,
        participant_id: participant.participant_id,
      })),
    );

    return this.agendaRepository.manager.transaction(async (manager) => {
      const repository = manager.getRepository(AdminAgenda);
      const agenda = await repository.findOneBy({ id_agenda: id });

      if (!agenda) {
        throw new NotFoundException('Agenda tidak ditemukan');
      }

      agenda.status = dto.status;

      if (dto.status_note !== undefined) {
        agenda.status_note = this.cleanText(dto.status_note);
      }

      const savedAgenda = await repository.save(agenda);

      await this.notifyRecipients(recipients, savedAgenda, 'STATUS', manager);

      return repository.findOne({
        where: { id_agenda: id },
        relations: ['participants'],
      });
    });
  }

  async remove(id: number, identity: AgendaAuthIdentity) {
    this.ensureAdmin(identity);

    const agenda = await this.findOne(id, identity);

    const recipients = await this.resolveRecipients(
      (agenda.participants || []).map((participant) => ({
        participant_type: participant.participant_type,
        participant_id: participant.participant_id,
      })),
    );

    return this.agendaRepository.manager.transaction(async (manager) => {
      await this.notifyRecipients(recipients, agenda, 'CANCELLED', manager);

      await manager.getRepository(AdminAgenda).delete({ id_agenda: id });

      return {
        message: 'COE berhasil dihapus dan peserta telah diberi notifikasi',
        id_agenda: id,
      };
    });
  }
}
