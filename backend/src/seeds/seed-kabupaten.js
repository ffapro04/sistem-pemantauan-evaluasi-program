/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable prettier/prettier */
console.log('🚀 Skrip mulai berjalan...');

const { DataSource } = require('typeorm');

const dataSource = new DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'ypamdr17',
    database: 'sistem_monitoring_evaluasi_program',
});

async function seedKabupaten() {
    console.log('📡 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Connected!\n');

    console.log('📂 Loading provinces data from frontend...');
    const data = await import('../../../frontend/src/data/indonesiaProvinces.js');
    const INDONESIA_PROVINCES = data.INDONESIA_PROVINCES;
    console.log(`✅ Loaded ${INDONESIA_PROVINCES.length} provinces\n`);

    const provinces = await dataSource.query(
        `SELECT id_wilayah, nama_wilayah, kode_wilayah, tipe_wilayah 
         FROM m_wilayah WHERE jenis_wilayah = 'PROVINSI'`
    );

    console.log(`📊 Found ${provinces.length} provinces in database\n`);

    const provinceMap = new Map();
    provinces.forEach(p => {
        provinceMap.set(p.nama_wilayah, p);
        provinceMap.set(p.kode_wilayah, p);
    });

    let totalInserted = 0;

    for (const province of INDONESIA_PROVINCES) {
        const dbProvince = provinceMap.get(province.name) || provinceMap.get(province.code);

        if (!dbProvince) {
            console.log(`⚠️ Province "${province.name}" not found, skip...`);
            continue;
        }

        const regencies = province.regencies || [];
        console.log(`\n📌 Processing: ${province.name} (${regencies.length} regencies)`);

        let insertedCount = 0;

        for (let i = 0; i < regencies.length; i++) {
            const kabName = regencies[i];
            const kodeKabupaten = `${dbProvince.kode_wilayah}-${String(i + 1).padStart(3, '0')}`;

            const existing = await dataSource.query(
                `SELECT id_wilayah FROM m_wilayah 
                 WHERE nama_wilayah = $1 AND id_parent = $2 AND jenis_wilayah = 'KABUPATEN'`,
                [kabName, dbProvince.id_wilayah]
            );

            if (existing.length === 0) {
                await dataSource.query(
                    `INSERT INTO m_wilayah 
                     (nama_wilayah, kode_wilayah, jenis_wilayah, tipe_wilayah, status, id_parent, created_at, updated_at) 
                     VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
                    [kabName, kodeKabupaten, 'KABUPATEN', dbProvince.tipe_wilayah || 'Absolute', true, dbProvince.id_wilayah]
                );
                totalInserted++;
                insertedCount++;
                process.stdout.write(`\r   ✅ Inserted: ${insertedCount}/${regencies.length} - ${kabName.substring(0, 35)}`);
            }
        }
        console.log(`\n   📊 Inserted ${insertedCount} new regencies`);
    }

    console.log(`\n\n🎉 DONE! Total inserted: ${totalInserted} regencies`);
    await dataSource.destroy();
}

seedKabupaten().catch(err => {
    console.error('❌ Error:', err);
});