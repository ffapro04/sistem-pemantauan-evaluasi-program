/* eslint-disable prettier/prettier */
import { Controller, Get, Param, Req, Res } from '@nestjs/common';

@Controller('uploads')
export class UploadsController {
  @Get(':folder/dummy/:filename')
  previewDummyFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() response: any,
  ) {
    return this.sendFallbackPreview(response, folder, filename, true);
  }

  @Get(':folder/:filename')
  previewMissingFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() response: any,
  ) {
    return this.sendFallbackPreview(response, folder, filename, false);
  }

  @Get('*')
  previewAnyMissingUpload(@Req() request: any, @Res() response: any) {
    const uploadPath = String(request?.path || request?.url || '')
      .replace(/^\/?uploads\/?/i, '')
      .split(/[?#]/)[0];
    const parts = uploadPath.split('/').filter(Boolean);
    const folder = parts[0] || 'dokumen';
    const filename = parts[parts.length - 1] || 'preview-dokumen.pdf';

    return this.sendFallbackPreview(
      response,
      folder,
      filename,
      parts.some((part) => part.toLowerCase() === 'dummy'),
    );
  }

  private sendFallbackPreview(
    response: any,
    folder: string,
    filename: string,
    isDummy: boolean,
  ) {
    const safeFolder = this.cleanText(folder || 'dokumen');
    const safeFilename = this.cleanText(filename || 'preview-dokumen.pdf');
    const pdf = this.createPreviewPdf([
      'PREVIEW DOKUMEN',
      '',
      `Nama file : ${safeFilename}`,
      `Folder    : ${safeFolder}`,
      '',
      isDummy
        ? 'Dokumen ini berasal dari data dummy pengujian.'
        : 'File asli tidak ditemukan pada penyimpanan lokal server.',
      'Preview fallback ini mencegah halaman menampilkan JSON 404 ketika data demo membuka dokumen.',
      '',
      'Catatan:',
      '- Upload real yang tersimpan di Google Drive tetap dibuka langsung melalui link Google Drive.',
      '- Jika file produksi belum muncul, pastikan akun penyimpanan dokumen sudah tertaut dan upload berhasil.',
    ]);

    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `inline; filename="${this.toPdfFilename(safeFilename)}"`,
    );
    response.setHeader('Cache-Control', 'no-store');
    response.setHeader('Content-Length', pdf.length);

    return response.send(pdf);
  }

  private cleanText(value: string) {
    try {
      return decodeURIComponent(String(value || ''))
        .replace(/[\\/:*?"<>|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    } catch {
      return String(value || '')
        .replace(/[\\/:*?"<>|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }
  }

  private toPdfFilename(value: string) {
    const base = this.cleanText(value).replace(/\.[^.]+$/, '') || 'preview-dokumen';
    return `${base}.pdf`;
  }

  private escapePdfText(value: string) {
    return String(value || '')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  private createPreviewPdf(lines: string[]) {
    const contentLines = [
      'BT',
      '/F1 18 Tf',
      '72 760 Td',
      `( ${this.escapePdfText(lines[0] || 'PREVIEW DOKUMEN')} ) Tj`,
      '/F1 11 Tf',
      '0 -28 Td',
      ...lines.slice(1).flatMap((line) => [
        `( ${this.escapePdfText(line)} ) Tj`,
        '0 -18 Td',
      ]),
      'ET',
    ];

    const content = contentLines.join('\n');
    const objects = [
      '1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n',
      '2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n',
      '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n',
      '4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n',
      `5 0 obj\n<< /Length ${Buffer.byteLength(content, 'utf8')} >>\nstream\n${content}\nendstream\nendobj\n`,
    ];

    let pdf = '%PDF-1.4\n';
    const offsets = [0];

    objects.forEach((object) => {
      offsets.push(Buffer.byteLength(pdf, 'utf8'));
      pdf += object;
    });

    const xrefOffset = Buffer.byteLength(pdf, 'utf8');
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += '0000000000 65535 f \n';
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

    return Buffer.from(pdf, 'utf8');
  }
}
