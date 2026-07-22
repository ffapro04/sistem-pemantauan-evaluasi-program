/* eslint-disable prettier/prettier */
import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import * as net from 'node:net';
import * as tls from 'node:tls';

type SmtpSocket = net.Socket | tls.TLSSocket;

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  private isEnabled() {
    return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS);
  }

  private getSmtpHost() {
    return process.env.SMTP_HOST || 'smtp.gmail.com';
  }

  private getSmtpPassword() {
    const password = process.env.SMTP_PASS || '';

    if (String(process.env.SMTP_PASS_KEEP_SPACES || '').toLowerCase() === 'true') {
      return password;
    }

    return password.replace(/\s+/g, '');
  }

  private encodeBase64(value: string) {
    return Buffer.from(value, 'utf8').toString('base64');
  }

  private escapeHeader(value: string) {
    return String(value || '').replace(/[\r\n]+/g, ' ').trim();
  }

  private buildMessage(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || '';
    const fromName = process.env.SMTP_FROM_NAME || 'Yayasan Pendidikan Astra Michael D. Ruslim';
    const boundary = `sme-${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const headers = [
      `From: "${this.escapeHeader(fromName)}" <${from}>`,
      `To: <${params.to}>`,
      `Subject: ${this.escapeHeader(params.subject)}`,
      'MIME-Version: 1.0',
      `Content-Type: multipart/alternative; boundary="${boundary}"`,
    ];

    const html = params.html || `<pre>${params.text}</pre>`;

    return [
      ...headers,
      '',
      `--${boundary}`,
      'Content-Type: text/plain; charset="UTF-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      params.text,
      '',
      `--${boundary}`,
      'Content-Type: text/html; charset="UTF-8"',
      'Content-Transfer-Encoding: 8bit',
      '',
      html,
      '',
      `--${boundary}--`,
      '',
    ].join('\r\n');
  }

  private connect(port: number, secure: boolean): Promise<SmtpSocket> {
    const host = this.getSmtpHost();

    return new Promise((resolve, reject) => {
      const socket = secure
        ? tls.connect({ host, port, servername: host })
        : net.connect({ host, port });

      socket.once('error', reject);
      socket.once('connect', () => resolve(socket));
    });
  }

  private readResponse(socket: SmtpSocket): Promise<string> {
    return new Promise((resolve, reject) => {
      let buffer = '';
      const onData = (chunk: Buffer) => {
        buffer += chunk.toString('utf8');
        const lines = buffer.split(/\r?\n/).filter(Boolean);
        const last = lines[lines.length - 1] || '';

        if (/^\d{3}\s/.test(last)) {
          socket.off('data', onData);
          socket.off('error', onError);
          resolve(buffer);
        }
      };
      const onError = (error: Error) => {
        socket.off('data', onData);
        reject(error);
      };

      socket.on('data', onData);
      socket.once('error', onError);
    });
  }

  private async command(socket: SmtpSocket, command: string, ok: number[]) {
    socket.write(`${command}\r\n`);
    const response = await this.readResponse(socket);
    const code = Number(response.slice(0, 3));

    if (!ok.includes(code)) {
      throw new Error(`SMTP command failed (${code}): ${response}`);
    }

    return response;
  }

  private async upgradeToTls(socket: SmtpSocket) {
    await this.command(socket, 'STARTTLS', [220]);

    return tls.connect({
      socket,
      servername: this.getSmtpHost(),
    });
  }

  async sendMail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
  }) {
    if (!this.isEnabled()) {
      throw new ServiceUnavailableException(
        'Email Gmail asli belum dikonfigurasi. Isi SMTP_USER dengan alamat Gmail pengirim dan SMTP_PASS dengan Google App Password di backend .env.',
      );
    }

    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
    const hostName = process.env.SMTP_HELO || 'localhost';
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || '';
    let socket: SmtpSocket | null = null;

    try {
      socket = await this.connect(port, secure);
      await this.readResponse(socket);
      await this.command(socket, `EHLO ${hostName}`, [250]);

      if (!secure && String(process.env.SMTP_STARTTLS || 'true').toLowerCase() !== 'false') {
        socket = await this.upgradeToTls(socket);
        await this.command(socket, `EHLO ${hostName}`, [250]);
      }

      const auth = this.encodeBase64(`\u0000${process.env.SMTP_USER}\u0000${this.getSmtpPassword()}`);
      await this.command(socket, `AUTH PLAIN ${auth}`, [235]);
      await this.command(socket, `MAIL FROM:<${from}>`, [250]);
      await this.command(socket, `RCPT TO:<${params.to}>`, [250, 251]);
      await this.command(socket, 'DATA', [354]);

      socket.write(`${this.buildMessage(params).replace(/\r?\n\./g, '\r\n..')}\r\n.\r\n`);
      await this.readResponse(socket);
      await this.command(socket, 'QUIT', [221]);

      return { success: true };
    } catch (error) {
      try {
        socket?.end();
      } catch {
        // noop
      }

      if (error instanceof ServiceUnavailableException) {
        throw error;
      }

      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `SMTP failed for host=${this.getSmtpHost()} port=${port} secure=${secure} user=${process.env.SMTP_USER || '-'}: ${message}`,
      );

      throw new ServiceUnavailableException(
        'Gagal mengirim OTP ke email. Periksa SMTP_USER, SMTP_PASS Google App Password, koneksi internet, dan izin SMTP Gmail.',
      );
    }
  }
}
