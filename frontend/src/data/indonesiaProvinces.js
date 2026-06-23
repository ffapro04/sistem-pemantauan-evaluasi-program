// src/data/indonesiaProvinces.js

export const REGION_GROUPS = {
    SUMATERA: "Pulau Sumatera",
    JAWA: "Pulau Jawa",
    NUSA_TENGGARA_BALI: "Kepulauan Nusa Tenggara & Bali",
    KALIMANTAN: "Pulau Kalimantan",
    SULAWESI: "Pulau Sulawesi",
    MALUKU: "Kepulauan Maluku",
    PAPUA: "Pulau Papua",
};

export const INDONESIA_PROVINCES = [
    // =========================
    // PULAU SUMATERA
    // =========================
    {
        id: 1,
        code: "ACEH",
        region: REGION_GROUPS.SUMATERA,
        name: "Aceh",
        capital: "Banda Aceh",
        latitude: 4.695135,
        longitude: 96.749397,
        bounds: [[2.0, 95.0], [6.3, 98.5]],
        luasWilayah: "±56.835,02 km²",
        letakGeografis: "Terletak di ujung barat Pulau Sumatera...",
        letakAstronomis: "±2°-6° LU dan 95°-98° BT",
        regencies: [
            "Kab. Aceh Barat", "Kab. Aceh Barat Daya", "Kab. Aceh Besar", "Kab. Aceh Jaya",
            "Kab. Aceh Selatan", "Kab. Aceh Singkil", "Kab. Aceh Tamiang", "Kab. Aceh Tengah",
            "Kab. Aceh Tenggara", "Kab. Aceh Timur", "Kab. Aceh Utara", "Kab. Bener Meriah",
            "Kab. Bireuen", "Kab. Gayo Lues", "Kab. Nagan Raya", "Kab. Pidie",
            "Kab. Pidie Jaya", "Kab. Simeulue", "Kota Banda Aceh", "Kota Langsa",
            "Kota Lhokseumawe", "Kota Sabang", "Kota Subulussalam"
        ]
    },
    {
        id: 2,
        code: "SUMATERA_UTARA",
        region: REGION_GROUPS.SUMATERA,
        name: "Sumatera Utara",
        capital: "Medan",
        latitude: 2.1153547,
        longitude: 99.5450974,
        bounds: [[-0.8, 97.0], [4.4, 100.7]],
        luasWilayah: "±72.437,76 km²",
        regencies: [
            "Kab. Asahan", "Kab. Batu Bara", "Kab. Dairi", "Kab. Deli Serdang",
            "Kab. Humbang Hasundutan", "Kab. Karo", "Kab. Labuhanbatu", "Kab. Labuhanbatu Selatan",
            "Kab. Labuhanbatu Utara", "Kab. Langkat", "Kab. Mandailing Natal", "Kab. Nias",
            "Kab. Nias Barat", "Kab. Nias Selatan", "Kab. Nias Utara", "Kab. Padang Lawas",
            "Kab. Padang Lawas Utara", "Kab. Pakpak Bharat", "Kab. Samosir", "Kab. Serdang Bedagai",
            "Kab. Simalungun", "Kab. Tapanuli Selatan", "Kab. Tapanuli Tengah", "Kab. Tapanuli Utara",
            "Kab. Toba", "Kota Binjai", "Kota Gunungsitoli", "Kota Medan",
            "Kota Padangsidimpuan", "Kota Pematangsiantar", "Kota Sibolga", "Kota Tanjungbalai", "Kota Tebing Tinggi"
        ]
    },
    {
        id: 3,
        code: "SUMATERA_BARAT",
        region: REGION_GROUPS.SUMATERA,
        name: "Sumatera Barat",
        capital: "Padang",
        latitude: -0.7399397,
        longitude: 100.8000051,
        bounds: [[-3.6, 98.5], [1.0, 102.3]],
        luasWilayah: "±42.107,67 km²",
        regencies: [
            "Kab. Agam", "Kab. Dharmasraya", "Kab. Kepulauan Mentawai", "Kab. Lima Puluh Kota",
            "Kab. Padang Pariaman", "Kab. Pasaman", "Kab. Pasaman Barat", "Kab. Pesisir Selatan",
            "Kab. Sijunjung", "Kab. Solok", "Kab. Solok Selatan", "Kab. Tanah Datar",
            "Kota Bukittinggi", "Kota Padang", "Kota Padang Panjang", "Kota Pariaman",
            "Kota Payakumbuh", "Kota Sawahlunto", "Kota Solok"
        ]
    },
    {
        id: 4,
        code: "RIAU",
        region: REGION_GROUPS.SUMATERA,
        name: "Riau",
        capital: "Pekanbaru",
        latitude: 0.2933469,
        longitude: 101.7068294,
        bounds: [[-1.4, 100.0], [2.5, 104.0]],
        luasWilayah: "±89.900,78 km²",
        regencies: [
            "Kab. Bengkalis", "Kab. Indragiri Hilir", "Kab. Indragiri Hulu", "Kab. Kampar",
            "Kab. Kepulauan Meranti", "Kab. Kuantan Singingi", "Kab. Pelalawan", "Kab. Rokan Hilir",
            "Kab. Rokan Hulu", "Kab. Siak", "Kota Dumai", "Kota Pekanbaru"
        ]
    },
    {
        id: 5,
        code: "KEPULAUAN_RIAU",
        region: REGION_GROUPS.SUMATERA,
        name: "Kepulauan Riau",
        capital: "Tanjungpinang",
        latitude: 3.9456514,
        longitude: 108.1428669,
        bounds: [[-1.2, 103.0], [4.9, 109.7]],
        luasWilayah: "±8.170,38 km²",
        regencies: [
            "Kab. Bintan", "Kab. Karimun", "Kab. Kepulauan Anambas", "Kab. Lingga",
            "Kab. Natuna", "Kota Batam", "Kota Tanjungpinang"
        ]
    },
    {
        id: 6,
        code: "JAMBI",
        region: REGION_GROUPS.SUMATERA,
        name: "Jambi",
        capital: "Jambi",
        latitude: -1.4851831,
        longitude: 102.4380581,
        bounds: [[-3.0, 101.0], [0.0, 104.0]],
        luasWilayah: "±49.023,04 km²",
        regencies: [
            "Kab. Batanghari", "Kab. Bungo", "Kab. Kerinci", "Kab. Merangin",
            "Kab. Muaro Jambi", "Kab. Sarolangun", "Kab. Tanjung Jabung Barat", "Kab. Tanjung Jabung Timur",
            "Kab. Tebo", "Kota Jambi", "Kota Sungai Penuh"
        ]
    },
    {
        id: 7,
        code: "SUMATERA_SELATAN",
        region: REGION_GROUPS.SUMATERA,
        name: "Sumatera Selatan",
        capital: "Palembang",
        latitude: -3.3194374,
        longitude: 103.914399,
        bounds: [[-5.0, 102.0], [-1.6, 106.0]],
        luasWilayah: "±86.771,92 km²",
        regencies: [
            "Kab. Banyuasin", "Kab. Empat Lawang", "Kab. Lahat", "Kab. Muara Enim",
            "Kab. Musi Banyuasin", "Kab. Musi Rawas", "Kab. Musi Rawas Utara", "Kab. Ogan Ilir",
            "Kab. Ogan Komering Ilir", "Kab. Ogan Komering Ulu", "Kab. Ogan Komering Ulu Selatan", "Kab. Ogan Komering Ulu Timur",
            "Kab. Penukal Abab Lematang Ilir", "Kota Lubuklinggau", "Kota Pagar Alam", "Kota Palembang", "Kota Prabumulih"
        ]
    },
    {
        id: 8,
        code: "KEPULAUAN_BANGKA_BELITUNG",
        region: REGION_GROUPS.SUMATERA,
        name: "Kepulauan Bangka Belitung",
        capital: "Pangkalpinang",
        latitude: -2.7410513,
        longitude: 106.4405872,
        bounds: [[-3.7, 105.0], [-1.2, 108.5]],
        luasWilayah: "±16.670,23 km²",
        regencies: [
            "Kab. Bangka", "Kab. Bangka Barat", "Kab. Bangka Selatan", "Kab. Bangka Tengah",
            "Kab. Belitung", "Kab. Belitung Timur", "Kota Pangkalpinang"
        ]
    },
    {
        id: 9,
        code: "BENGKULU",
        region: REGION_GROUPS.SUMATERA,
        name: "Bengkulu",
        capital: "Bengkulu",
        latitude: -3.5778471,
        longitude: 102.3463875,
        bounds: [[-5.6, 101.0], [-2.3, 103.8]],
        luasWilayah: "±20.122,21 km²",
        regencies: [
            "Kab. Bengkulu Selatan", "Kab. Bengkulu Tengah", "Kab. Bengkulu Utara", "Kab. Kaur",
            "Kab. Kepahiang", "Kab. Lebong", "Kab. Mukomuko", "Kab. Rejang Lebong",
            "Kab. Seluma", "Kota Bengkulu"
        ]
    },
    {
        id: 10,
        code: "LAMPUNG",
        region: REGION_GROUPS.SUMATERA,
        name: "Lampung",
        capital: "Bandar Lampung",
        latitude: -4.5585849,
        longitude: 105.4068079,
        bounds: [[-6.0, 103.5], [-3.7, 106.2]],
        luasWilayah: "±33.570,76 km²",
        regencies: [
            "Kab. Lampung Barat", "Kab. Lampung Selatan", "Kab. Lampung Tengah", "Kab. Lampung Timur",
            "Kab. Lampung Utara", "Kab. Mesuji", "Kab. Pesawaran", "Kab. Pesisir Barat",
            "Kab. Pringsewu", "Kab. Tanggamus", "Kab. Tulang Bawang", "Kab. Tulang Bawang Barat",
            "Kab. Way Kanan", "Kota Bandar Lampung", "Kota Metro"
        ]
    },

    // =========================
    // PULAU JAWA
    // =========================
    {
        id: 11,
        code: "BANTEN",
        region: REGION_GROUPS.JAWA,
        name: "Banten",
        capital: "Serang",
        latitude: -6.4058172,
        longitude: 106.0640179,
        bounds: [[-7.2, 105.0], [-5.8, 107.0]],
        luasWilayah: "±9.662,92 km²",
        regencies: [
            "Kab. Lebak", "Kab. Pandeglang", "Kab. Serang", "Kab. Tangerang",
            "Kota Cilegon", "Kota Serang", "Kota Tangerang", "Kota Tangerang Selatan"
        ]
    },
    {
        id: 12,
        code: "DKI_JAKARTA",
        region: REGION_GROUPS.JAWA,
        name: "DKI Jakarta",
        capital: "Jakarta",
        latitude: -6.2087634,
        longitude: 106.845599,
        bounds: [[-6.4, 106.6], [-5.9, 107.1]],
        luasWilayah: "±661,53 km²",
        regencies: [
            "Kab. Administrasi Kepulauan Seribu", "Kota Administrasi Jakarta Barat",
            "Kota Administrasi Jakarta Central", "Kota Administrasi Jakarta Selatan",
            "Kota Administrasi Jakarta Timur", "Kota Administrasi Jakarta Utara"
        ]
    },
    {
        id: 13,
        code: "JAWA_BARAT",
        region: REGION_GROUPS.JAWA,
        name: "Jawa Barat",
        capital: "Bandung",
        latitude: -6.9174639,
        longitude: 107.6191228,
        bounds: [[-7.9, 106.0], [-5.8, 109.0]],
        luasWilayah: "±37.053,33 km²",
        regencies: [
            "Kab. Bandung", "Kab. Bandung Barat", "Kab. Bekasi", "Kab. Bogor",
            "Kab. Ciamis", "Kab. Cianjur", "Kab. Cirebon", "Kab. Garut",
            "Kab. Indramayu", "Kab. Karawang", "Kab. Kuningan", "Kab. Majalengka",
            "Kab. Pangandaran", "Kab. Purwakarta", "Kab. Subang", "Kab. Sukabumi",
            "Kab. Sumedang", "Kab. Tasikmalaya", "Kota Bandung", "Kota Banjar",
            "Kota Bekasi", "Kota Bogor", "Kota Cimahi", "Kota Cirebon",
            "Kota Depok", "Kota Sukabumi", "Kota Tasikmalaya"
        ]
    },
    {
        id: 14,
        code: "JAWA_TENGAH",
        region: REGION_GROUPS.JAWA,
        name: "Jawa Tengah",
        capital: "Semarang",
        latitude: -7.150975,
        longitude: 110.1402594,
        bounds: [[-8.3, 108.5], [-5.7, 111.8]],
        luasWilayah: "±34.347,43 km²",
        regencies: [
            "Kab. Banjarnegara", "Kab. Banyumas", "Kab. Batang", "Kab. Blora",
            "Kab. Boyolali", "Kab. Brebes", "Kab. Cilacap", "Kab. Demak",
            "Kab. Grobogan", "Kab. Jepara", "Kab. Karanganyar", "Kab. Kebumen",
            "Kab. Kendal", "Kab. Klaten", "Kab. Kudus", "Kab. Magelang",
            "Kab. Pati", "Kab. Pekalongan", "Kab. Pemalang", "Kab. Purbalingga",
            "Kab. Purworejo", "Kab. Rembang", "Kab. Semarang", "Kab. Sragen",
            "Kab. Sukoharjo", "Kab. Tegal", "Kab. Temanggung", "Kab. Wonogiri",
            "Kab. Wonosobo", "Kota Magelang", "Kota Pekalongan", "Kota Salatiga",
            "Kota Semarang", "Kota Surakarta", "Kota Tegal"
        ]
    },
    {
        id: 15,
        code: "DI_YOGYAKARTA",
        region: REGION_GROUPS.JAWA,
        name: "D.I. Yogyakarta",
        capital: "Yogyakarta",
        latitude: -7.8753849,
        longitude: 110.4262088,
        bounds: [[-8.3, 110.0], [-7.5, 110.9]],
        luasWilayah: "±3.172,06 km²",
        regencies: [
            "Kab. Bantul", "Kab. Gunungkidul", "Kab. Kulon Progo", "Kab. Sleman", "Kota Yogyakarta"
        ]
    },
    {
        id: 16,
        code: "JAWA_TIMUR",
        region: REGION_GROUPS.JAWA,
        name: "Jawa Timur",
        capital: "Surabaya",
        latitude: -7.5360639,
        longitude: 112.2384017,
        bounds: [[-8.8, 110.8], [-5.0, 116.0]],
        luasWilayah: "±48.055,88 km²",
        regencies: [
            "Kab. Bangkalan", "Kab. Banyuwangi", "Kab. Blitar", "Kab. Bojonegoro",
            "Kab. Bondowoso", "Kab. Gresik", "Kab. Jember", "Kab. Jombang",
            "Kab. Kediri", "Kab. Lamongan", "Kab. Lumajang", "Kab. Madiun",
            "Kab. Magetan", "Kab. Malang", "Kab. Mojokerto", "Kab. Nganjuk",
            "Kab. Ngawi", "Kab. Pacitan", "Kab. Pamekasan", "Kab. Pasuruan",
            "Kab. Ponorogo", "Kab. Probolinggo", "Kab. Sampang", "Kab. Sidoarjo",
            "Kab. Situbondo", "Kab. Sumenep", "Kab. Trenggalek", "Kab. Tuban",
            "Kab. Tulungagung", "Kota Batu", "Kota Blitar", "Kota Kediri",
            "Kota Madiun", "Kota Malang", "Kota Mojokerto", "Kota Pasuruan",
            "Kota Probolinggo", "Kota Surabaya"
        ]
    },

    // =========================
    // KEPULAUAN NUSA TENGGARA & BALI
    // =========================
    {
        id: 17,
        code: "BALI",
        region: REGION_GROUPS.NUSA_TENGGARA_BALI,
        name: "Bali",
        capital: "Denpasar",
        latitude: -8.4095178,
        longitude: 115.188916,
        bounds: [[-8.9, 114.4], [-8.0, 115.8]],
        luasWilayah: "±5.590,15 km²",
        regencies: [
            "Kab. Badung", "Kab. Bangli", "Kab. Buleleng", "Kab. Gianyar",
            "Kab. Jembrana", "Kab. Karangasem", "Kab. Klungkung", "Kab. Tabanal", "Kota Denpasar"
        ]
    },
    {
        id: 18,
        code: "NUSA_TENGGARA_BARAT",
        region: REGION_GROUPS.NUSA_TENGGARA_BALI,
        name: "Nusa Tenggara Barat",
        capital: "Mataram",
        latitude: -8.6529334,
        longitude: 117.3616476,
        bounds: [[-9.2, 115.8], [-8.0, 119.4]],
        luasWilayah: "±19.631,99 km²",
        regencies: [
            "Kab. Bima", "Kab. Dompu", "Kab. Lombok Barat", "Kab. Lombok Tengah",
            "Kab. Lombok Timur", "Kab. Lombok Utara", "Kab. Sumbawa", "Kab. Sumbawa Barat",
            "Kota Bima", "Kota Mataram"
        ]
    },
    {
        id: 19,
        code: "NUSA_TENGGARA_TIMUR",
        region: REGION_GROUPS.NUSA_TENGGARA_BALI,
        name: "Nusa Tenggara Timur",
        capital: "Kupang",
        latitude: -8.6573819,
        longitude: 121.0793705,
        bounds: [[-11.2, 118.7], [-8.0, 125.3]],
        luasWilayah: "±46.378,10 km²",
        regencies: [
            "Kab. Alor", "Kab. Belu", "Kab. Ende", "Kab. Flores Timur",
            "Kab. Kupang", "Kab. Lembata", "Kab. Malaka", "Kab. Manggarai",
            "Kab. Manggarai Barat", "Kab. Manggarai Timur", "Kab. Nagekeo", "Kab. Ngada",
            "Kab. Rote Ndao", "Kab. Sabu Raijua", "Kab. Sikka", "Kab. Sumba Barat",
            "Kab. Sumba Barat Daya", "Kab. Sumba Tengah", "Kab. Sumba Timur", "Kab. Timor Tengah Selatan",
            "Kab. Timor Tengah Utara", "Kota Kupang"
        ]
    },

    // =========================
    // PULAU KALIMANTAN
    // =========================
    {
        id: 20,
        code: "KALIMANTAN_BARAT",
        region: REGION_GROUPS.KALIMANTAN,
        name: "Kalimantan Barat",
        capital: "Pontianak",
        latitude: -0.2787808,
        longitude: 111.4752851,
        bounds: [[-3.2, 108.5], [2.2, 114.5]],
        luasWilayah: "±147.018,06 km²",
        regencies: [
            "Kab. Bengkayang", "Kab. Kapuas Hulu", "Kab. Kayong Utara", "Kab. Ketapang",
            "Kab. Kubu Raya", "Kab. Landak", "Kab. Melawi", "Kab. Mempawah",
            "Kab. Sambas", "Kab. Sanggau", "Kab. Sekadau", "Kab. Sintang",
            "Kota Pontianak", "Kota Singkawang"
        ]
    },
    {
        id: 21,
        code: "KALIMANTAN_TENGAH",
        region: REGION_GROUPS.KALIMANTAN,
        name: "Kalimantan Tengah",
        capital: "Palangkaraya",
        latitude: -1.6814878,
        longitude: 113.3823545,
        bounds: [[-4.2, 110.7], [0.8, 116.5]],
        luasWilayah: "±153.430,36 km²",
        regencies: [
            "Kab. Barito Selatan", "Kab. Barito Timur", "Kab. Barito Utara", "Kab. Gunung Mas",
            "Kab. Kapuas", "Kab. Katingan", "Kab. Kotawaringin Barat", "Kab. Kotawaringin Timur",
            "Kab. Lamandau", "Kab. Murung Raya", "Kab. Pulang Pisau", "Kab. Sukamara",
            "Kab. Seruyan", "Kota Palangka Raya"
        ]
    },
    {
        id: 22,
        code: "KALIMANTAN_SELATAN",
        region: REGION_GROUPS.KALIMANTAN,
        name: "Kalimantan Selatan",
        capital: "Banjarmasin",
        latitude: -3.0926415,
        longitude: 115.2837585,
        bounds: [[-4.7, 113.0], [-1.2, 117.3]],
        luasWilayah: "±37.125,43 km²",
        regencies: [
            "Kab. Balangan", "Kab. Banjar", "Kab. Barito Kuala", "Kab. Hulu Sungai Selatan",
            "Kab. Hulu Sungai Tengah", "Kab. Hulu Sungai Utara", "Kab. Kotabaru", "Kab. Tabalong",
            "Kab. Tanah Bumbu", "Kab. Tanah Laut", "Kab. Tapin", "Kota Banjarbaru", "Kota Banjarmasin"
        ]
    },
    {
        id: 23,
        code: "KALIMANTAN_TIMUR",
        region: REGION_GROUPS.KALIMANTAN,
        name: "Kalimantan Timur",
        capital: "Samarinda",
        latitude: 0.5386586,
        longitude: 116.419389,
        bounds: [[-2.5, 113.7], [2.4, 119.4]],
        luasWilayah: "±126.951,76 km²",
        regencies: [
            "Kab. Berau", "Kab. Kutai Barat", "Kab. Kutai Kartanegara", "Kab. Kutai Timur",
            "Kab. Mahakam Ulu", "Kab. Paser", "Kab. Penajam Paser Utara", "Kota Balikpapan",
            "Kota Bontang", "Kota Samarinda"
        ]
    },
    {
        id: 24,
        code: "KALIMANTAN_UTARA",
        region: REGION_GROUPS.KALIMANTAN,
        name: "Kalimantan Utara",
        capital: "Tanjung Selor",
        latitude: 3.0730929,
        longitude: 116.0413889,
        bounds: [[1.0, 114.5], [4.6, 118.3]],
        luasWilayah: "±69.900,89 km²",
        regencies: [
            "Kab. Bulungan", "Kab. Malinau", "Kab. Nunukan", "Kab. Tana Tidung", "Kota Tarakan"
        ]
    },

    // =========================
    // PULAU SULAWESI
    // =========================
    {
        id: 25,
        code: "SULAWESI_UTARA",
        region: REGION_GROUPS.SULAWESI,
        name: "Sulawesi Utara",
        capital: "Manado",
        latitude: 0.6246932,
        longitude: 123.9750018,
        bounds: [[0.0, 123.0], [5.8, 127.0]],
        luasWilayah: "±13.916,47 km²",
        regencies: [
            "Kab. Bolaang Mongondow", "Kab. Bolaang Mongondow Selatan", "Kab. Bolaang Mongondow Timur", "Kab. Bolaang Mongondow Utara",
            "Kab. Kepulauan Sangihe", "Kab. Kepulauan Siau Tagulandang Biaro", "Kab. Kepulauan Talaud", "Kab. Minahasa",
            "Kab. Minahasa Selatan", "Kab. Minahasa Tenggara", "Kab. Minahasa Utara", "Kota Bitung",
            "Kota Kotamobagu", "Kota Manado", "Kota Tomohon"
        ]
    },
    {
        id: 26,
        code: "GORONTALO",
        region: REGION_GROUPS.SULAWESI,
        name: "Gorontalo",
        capital: "Gorontalo",
        latitude: 0.6999372,
        longitude: 122.4467238,
        bounds: [[0.2, 121.0], [1.2, 123.6]],
        luasWilayah: "±11.899 km²",
        regencies: [
            "Kab. Boalemo", "Kab. Bone Bolango", "Kab. Gorontalo", "Kab. Gorontalo Utara",
            "Kab. Pohuwato", "Kota Gorontalo"
        ]
    },
    {
        id: 27,
        code: "SULAWESI_TENGAH",
        region: REGION_GROUPS.SULAWESI,
        name: "Sulawesi Tengah",
        capital: "Palu",
        latitude: -1.4300254,
        longitude: 121.4456179,
        bounds: [[-3.8, 119.0], [1.2, 124.6]],
        luasWilayah: "±61.496,98 km²",
        regencies: [
            "Kab. Banggai", "Kab. Banggai Kepulauan", "Kab. Banggai Laut", "Kab. Buol",
            "Kab. Donggala", "Kab. Morowali", "Kab. Morowali Utara", "Kab. Parigi Moutong",
            "Kab. Poso", "Kab. Sigi", "Kab. Tojo Una-Una", "Kab. Toli-Toli", "Kota Palu"
        ]
    },
    {
        id: 28,
        code: "SULAWESI_BARAT",
        region: REGION_GROUPS.SULAWESI,
        name: "Sulawesi Barat",
        capital: "Mamuju",
        latitude: -2.8441371,
        longitude: 119.2320784,
        bounds: [[-3.6, 118.5], [-1.0, 119.8]],
        luasWilayah: "±16.590,67 km²",
        regencies: [
            "Kab. Majene", "Kab. Mamasa", "Kab. Mamuju", "Kab. Mamuju Tengah",
            "Kab. Pasangkayu", "Kab. Polewali Mandar"
        ]
    },
    {
        id: 29,
        code: "SULAWESI_SELATAN",
        region: REGION_GROUPS.SULAWESI,
        name: "Sulawesi Selatan",
        capital: "Makassar",
        latitude: -3.6687994,
        longitude: 119.9740534,
        bounds: [[-7.7, 118.5], [-2.0, 122.5]],
        luasWilayah: "±45.323,98 km²",
        regencies: [
            "Kab. Bantaeng", "Kab. Barru", "Kab. Bone", "Kab. Bulukumba",
            "Kab. Enrekang", "Kab. Gowa", "Kab. Jeneponto", "Kab. Kepulauan Selayar",
            "Kab. Luwu", "Kab. Luwu Timur", "Kab. Luwu Utara", "Kab. Maros",
            "Kab. Pangkajene dan Kepulauan", "Kab. Pinrang", "Kab. Sidenreng Rappang", "Kab. Sinjai",
            "Kab. Soppeng", "Kab. Takalar", "Kab. Tana Toraja", "Kab. Toraja Utara",
            "Kab. Wajo", "Kota Makassar", "Kota Palopo", "Kota Parepare"
        ]
    },
    {
        id: 30,
        code: "SULAWESI_TENGGARA",
        region: REGION_GROUPS.SULAWESI,
        name: "Sulawesi Tenggara",
        capital: "Kendari",
        latitude: -4.14491,
        longitude: 122.174605,
        bounds: [[-6.5, 120.0], [-2.8, 124.8]],
        luasWilayah: "±36.139,30 km²",
        regencies: [
            "Kab. Bombana", "Kab. Buton", "Kab. Buton Selatan", "Kab. Buton Tengah",
            "Kab. Buton Utara", "Kab. Kolaka", "Kab. Kolaka Timur", "Kab. Kolaka Utara",
            "Kab. Konawe", "Kab. Konawe Kepulauan", "Kab. Konawe Selatan", "Kab. Konawe Utara",
            "Kab. Muna", "Kab. Muna Barat", "Kab. Wakatobi", "Kota Bau-Bau", "Kota Kendari"
        ]
    },

    // =========================
    // KEPULAUAN MALUKU
    // =========================
    {
        id: 31,
        code: "MALUKU_UTARA",
        region: REGION_GROUPS.MALUKU,
        name: "Maluku Utara",
        capital: "Sofifi",
        latitude: 1.5709993,
        longitude: 127.8087693,
        bounds: [[-2.0, 124.0], [3.9, 129.8]],
        luasWilayah: "±31.465,98 km²",
        regencies: [
            "Kab. Halmahera Barat", "Kab. Halmahera Tengah", "Kab. Halmahera Timur", "Kab. Halmahera Selatan",
            "Kab. Halmahera Utara", "Kab. Kepulauan Sula", "Kab. Pulau Morotai", "Kab. Pulau Taliabu",
            "Kota Ternate", "Kota Tidore Kepulauan"
        ]
    },
    {
        id: 32,
        code: "MALUKU",
        region: REGION_GROUPS.MALUKU,
        name: "Maluku",
        capital: "Ambon",
        latitude: -3.2384616,
        longitude: 130.1452734,
        bounds: [[-8.5, 124.5], [-2.0, 135.5]],
        luasWilayah: "±46.133,83 km²",
        regencies: [
            "Kab. Buru", "Kab. Buru Selatan", "Kab. Kepulauan Aru", "Kab. Kepulauan Tanimbar",
            "Kab. Maluku Barat Daya", "Kab. Maluku Tengah", "Kab. Maluku Tenggara", "Kab. Seram Bagian Barat",
            "Kab. Seram Bagian Timur", "Kota Ambon", "Kota Tual"
        ]
    },

    // =========================
    // PULAU PAPUA (Termasuk DOB Baru)
    // =========================
    {
        id: 33,
        code: "PAPUA_BARAT",
        region: REGION_GROUPS.PAPUA,
        name: "Papua Barat",
        capital: "Manokwari",
        latitude: -1.3361154,
        longitude: 133.1747162,
        bounds: [[-4.5, 130.0], [0.8, 135.5]],
        luasWilayah: "±60.308,59 km²",
        regencies: [
            "Kab. Fakfak", "Kab. Kaimana", "Kab. Manokwari", "Kab. Manokwari Selatan",
            "Kab. Pegunungan Arfak", "Kab. Teluk Bintuni", "Kab. Teluk Wondama"
        ]
    },
    {
        id: 34,
        code: "PAPUA",
        region: REGION_GROUPS.PAPUA,
        name: "Papua",
        capital: "Jayapura",
        latitude: -4.269928,
        longitude: 138.0803529,
        bounds: [[-6.5, 138.0], [-1.0, 141.2]],
        luasWilayah: "±81.383,32 km²",
        regencies: [
            "Kab. Biak Numfor", "Kab. Jayapura", "Kab. Keerom", "Kab. Kepulauan Yapen",
            "Kab. Mamberamo Raya", "Kab. Sarmi", "Kab. Supiori", "Kab. Waropen", "Kota Jayapura"
        ]
    },
    {
        id: 35,
        code: "PAPUA_SELATAN",
        region: REGION_GROUPS.PAPUA,
        name: "Papua Selatan",
        capital: "Merauke",
        latitude: -7.497522,
        longitude: 139.5965505,
        bounds: [[-9.5, 137.0], [-5.0, 141.2]],
        luasWilayah: "±117.858,97 km²",
        regencies: [
            "Kab. Asmat", "Kab. Boven Digoel", "Kab. Mappi", "Kab. Merauke"
        ]
    },
    {
        id: 36,
        code: "PAPUA_TENGAH",
        region: REGION_GROUPS.PAPUA,
        name: "Papua Tengah",
        capital: "Nabire",
        latitude: -3.5095462,
        longitude: 136.7478493,
        bounds: [[-5.5, 134.0], [-2.0, 138.5]],
        luasWilayah: "±61.079,59 km²",
        regencies: [
            "Kab. Deiyai", "Kab. Dogiyai", "Kab. Intan Jaya", "Kab. Mimika",
            "Kab. Nabire", "Kab. Paniai", "Kab. Puncak", "Kab. Puncak Jaya"
        ]
    },
    {
        id: 37,
        code: "PAPUA_PEGUNUNGAN",
        region: REGION_GROUPS.PAPUA,
        name: "Papua Pegunungan",
        capital: "Jayawijaya",
        latitude: -4.0004481,
        longitude: 138.7995122,
        bounds: [[-5.3, 137.5], [-2.5, 141.0]],
        luasWilayah: "±52.508,66 km²",
        regencies: [
            "Kab. Jayawijaya", "Kab. Lanny Jaya", "Kab. Mamberamo Tengah", "Kab. Nduga",
            "Kab. Pegunungan Bintang", "Kab. Tolikara", "Kab. Yahukimo", "Kab. Yalimo"
        ]
    },
    {
        id: 38,
        code: "PAPUA_BARAT_DAYA",
        region: REGION_GROUPS.PAPUA,
        name: "Papua Barat Daya",
        capital: "Sorong",
        latitude: -0.8761629,
        longitude: 131.255828,
        bounds: [[-2.5, 129.0], [0.6, 132.8]],
        luasWilayah: "±39.103,06 km²",
        regencies: [
            "Kab. Maybrat", "Kab. Raja Ampat", "Kab. Sorong", "Kab. Sorong Selatan",
            "Kab. Tambrauw", "Kota Sorong"
        ]
    },
];

// Helper Functions & Select Options Mapping
const normalizeProvinceKeyword = (value = "") =>
    String(value)
        .toLowerCase()
        .replace(/provinsi/g, "")
        .replace(/d\.?\s*i\.?/g, "di")
        .replace(/[^a-z0-9]/g, "")
        .trim();

export const PROVINCE_OPTIONS = INDONESIA_PROVINCES.map((province) => ({
    value: province.name,
    label: `${province.name.toUpperCase()} (${province.capital})`,
    code: province.code,
    region: province.region,
    capital: province.capital,
    latitude: province.latitude,
    longitude: province.longitude,
    bounds: province.bounds,
    luasWilayah: province.luasWilayah,
    letakGeografis: province.letakGeografis || "",
    letakAstronomis: province.letakAstronomis || "",
    regencies: province.regencies || [],
}));

export const PROVINCE_GROUPED_OPTIONS = Object.values(REGION_GROUPS).map(
    (region) => ({
        label: region,
        options: INDONESIA_PROVINCES.filter(
            (province) => province.region === region,
        ).map((province) => ({
            value: province.name,
            label: `${province.name.toUpperCase()} (${province.capital})`,
            code: province.code,
            region: province.region,
            capital: province.capital,
        })),
    }),
);

export const findProvinceByName = (keyword) => {
    const normalizedKeyword = normalizeProvinceKeyword(keyword);

    if (!normalizedKeyword) return null;

    return (
        INDONESIA_PROVINCES.find((province) => {
            const normalizedName = normalizeProvinceKeyword(province.name);
            const normalizedCode = normalizeProvinceKeyword(province.code);

            return (
                normalizedName === normalizedKeyword ||
                normalizedCode === normalizedKeyword ||
                normalizedName.includes(normalizedKeyword) ||
                normalizedKeyword.includes(normalizedName)
            );
        }) || null
    );
};

export const findProvinceByCode = (code) => {
    const normalizedCode = normalizeProvinceKeyword(code);

    if (!normalizedCode) return null;

    return (
        INDONESIA_PROVINCES.find(
            (province) => normalizeProvinceKeyword(province.code) === normalizedCode,
        ) || null
    );
};

export const getProvinceRegencies = (keyword) => {
    const province = findProvinceByName(keyword) || findProvinceByCode(keyword);

    return province?.regencies || [];
};

export const getProvincePayload = (provinceName) => {
    const province = findProvinceByName(provinceName);

    if (!province) return null;

    return {
        kode_wilayah: province.code,
        nama_wilayah: province.name,
        nama_provinsi: province.name,
        kode_provinsi: province.code,
        pulau_wilayah: province.region,
        region: province.region,
        ibu_kota: province.capital,
        latitude: province.latitude,
        longitude: province.longitude,
        bounds: province.bounds,
        luas_wilayah: province.luasWilayah,
        letak_geografis: province.letakGeografis || "",
        letak_astronomis: province.letakAstronomis || "",
        daftar_kabupaten: province.regencies || [],
    };
};

export default INDONESIA_PROVINCES;
