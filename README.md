# SiPMuT - Lapak Sejahtera

Aplikasi Manajemen Titip Barang (Konsinyasi) Multi-Tenant terintegrasi yang dirancang khusus untuk mempermudah ekosistem Warung, Kasir, dan Penitip Barang (Supplier).

---

## Alur Sistem (Flow Bisnis Konsinyasi)

Berikut adalah alur perjalanan sistemnya dari awal pendaftaran hingga transaksi harian:

### Tahap 1: Persiapan Warung (Oleh Owner)
1. **Daftar**: Anda (sebagai Owner) mendaftar di sistem.
2. **Buat Warung**: Anda menambahkan data warung (misal: "Warung Berkah 1"). Sistem akan meminta aktivasi pembayaran pendaftaran untuk mengaktifkan warung.
3. **Cetak QR & Buat Kasir**: Setelah warung aktif, Anda masuk ke Dashboard Owner. Di sini Anda:
   - Mencetak/Download QR Code khusus untuk "Warung Berkah 1" (QR ini nanti diprint dan ditempel di depan kasir).
   - Membuat 1 akun Kasir (username & password) yang akan diberikan ke karyawan yang menjaga warung tersebut.

### Tahap 2: Pengajuan Barang Pertama Kali (Oleh Penitip)
*(Skenario: Seorang Ibu bernama Siti datang ke Warung Berkah 1 membawa Keripik Singkong)*
1. **Scan QR**: Ibu Siti men-scan QR Code yang menempel di warung.
2. **Daftar Akun**: Karena baru pertama kali seumur hidup pakai aplikasi ini, Ibu Siti diminta membuat Akun (Nama: Siti, No WA: 08123, Password: xxx). **Catatan:** Akun ini bersifat global, Ibu Siti bisa pakai akun ini untuk nitip ke warung-warung lain kelak.
3. **Ajukan Produk**: Setelah masuk, aplikasi menyadari Ibu Siti belum punya barang yang dijual di "Warung Berkah 1". Ibu Siti menekan **+ Ajukan Produk Baru**.
   - Nama Produk: Keripik Singkong
   - Harga Setor (Ke Kasir): Rp 2.000
   - Harga Jual (Ke Pembeli): Rp 2.500
4. **Menunggu (Pending)**: Aplikasi Ibu Siti akan menampilkan status pengajuan "PENDING". Ibu Siti bilang ke Kasir, *"Mbak, saya sudah ngajuin keripik di aplikasi ya."*

### Tahap 3: Persetujuan (Oleh Kasir)
1. **Cek Dashboard**: Kasir yang sedang menjaga "Warung Berkah 1" membuka HP/Laptopnya dan login ke Dashboard Kasir.
2. **Terima Barang**: Di tab **Persetujuan Produk**, Kasir melihat ada pengajuan "Keripik Singkong dari Ibu Siti". Jika Kasir setuju, ia klik **Terima (Approve)**.

### Tahap 4: Rutinitas Titip Harian (Sangat Cepat!)
*(Skenario: Keesokan harinya, Ibu Siti datang lagi untuk menaruh barang).*
1. **Scan QR Lagi**: Ibu Siti men-scan QR Code warung.
2. **Login Cepat**: Ia memasukkan No WA dan Password-nya.
3. **Input Stok Saja**: Karena Keripiknya sudah di-approve kemarin, Ibu Siti **TIDAK PERLU** lagi menulis nama barang dan harga. Di layarnya langsung muncul opsi:
   - Pilih Produk: [ Keripik Singkong ]
   - Jumlah Titip Hari Ini: [ ketik angka, misal: 20 pcs ]
   - Klik **Kirim**.
4. **Notif WA**: Ibu Siti menekan tombol untuk otomatis mengirim chat WhatsApp ke Kasir yang isinya: *"Halo, saya Siti menitipkan Keripik Singkong 20 pcs hari ini."*

### Tahap 5: Pantauan Akhir Hari (Kasir & Owner)
1. **Kasir Mengecek Penjualan**: Di penghujung hari, Kasir membuka Dashboard-nya. Ia melihat list stok barang (termasuk 20 pcs Keripik tadi). Ia menghitung sisa keripik yang tidak laku di rak (misal sisa 5). Kasir mengupdate angka sisa menjadi 5. Sistem otomatis menghitung bahwa **15 pcs laku terjual** dan langsung memisahkan uang *(15 x Rp2000 = Rp30.000 hak Ibu Siti, dan Rp7.500 laba warung)*.
2. **Owner Memantau**: Owner yang sedang bersantai di rumah bisa membuka Dashboard Owner-nya untuk melihat total omset dan laba seluruh cabang warungnya secara *real-time*.

---

## Teknologi
- Framework: Next.js (App Router)
- UI Library: Tailwind CSS + shadcn/ui
- Database: Prisma ORM + SQLite / PostgreSQL
- Auth: Custom JWT Encryption
