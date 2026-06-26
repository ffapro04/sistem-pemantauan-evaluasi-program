/* eslint-disable prettier/prettier */
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DataSource } from 'typeorm';

async function bootstrap() {
  console.log('BOOT 1: sebelum NestFactory.create');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  console.log('BOOT 2: setelah NestFactory.create');

  const dataSource = app.get(DataSource);

  const [dbInfo] = await dataSource.query(`
    SELECT 
      current_database() AS database_name,
      current_schema() AS schema_name,
      inet_server_addr() AS server_address,
      inet_server_port() AS server_port
  `);

  const [dbCounts] = await dataSource.query(`
    SELECT
      (SELECT COUNT(*) FROM public.m_users) AS users,
      (SELECT COUNT(*) FROM public.m_wilayah) AS wilayah,
      (SELECT COUNT(*) FROM public.m_sekolah) AS sekolah,
      (SELECT COUNT(*) FROM public.m_vendor) AS vendor,
      (SELECT COUNT(*) FROM public.t_program) AS program,
      (SELECT COUNT(*) FROM public.t_assessment) AS assessment
  `);

  console.log('BOOT DB INFO:', dbInfo);
  console.log('BOOT DB COUNTS:', dbCounts);

  app.enableCors();

  console.log('BOOT 3: setelah enableCors');

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads/',
  });

  console.log('BOOT 4: setelah static assets');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  console.log('BOOT 5: sebelum listen 3000');

  await app.listen(3000);

  console.log('BOOT 6: Backend running on http://localhost:3000');
}

bootstrap().catch((error) => {
  console.error('BOOT ERROR:', error);
});
