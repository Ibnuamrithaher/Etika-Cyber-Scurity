# Brief: perkaya satu pertemuan dengan visualisasi interaktif

Konteks: bahan ajar Etika Hukum Cyber (Bisnis Digital). Dosen meminta tampilan LEBIH ATRAKTIF: setiap topik harus punya visualisasi jenis/contoh dan ANIMASI PROSES terjadinya, sehingga mahasiswa bisa membayangkan.

## Pustaka visual (sudah terpasang di semua file, JANGAN ubah)
Blok `[SHARED:CSS]`, `[SHARED:JS]`, `[SHARED:VIZ-CSS]`, `[SHARED:VIZ-JS]` dilarang diubah. Baca skema data di komentar `_src/viz.js` (tipe: flow, explorer, mock, timeline, spectrum, order). Contoh LENGKAP dan sudah diuji: `pertemuan-07.html` (cari `flowRansom`, `flowDdos`, `flowBreach`, `peta`, `urut` di blok `const PAGE`).

Tipe widget baru: elemen `<div class="w" data-widget="TIPE" id="ID"><span class="w-label">Label</span></div>`, data di `PAGE.ID`.
- `flow`: animasi paket bergerak antar aktor (ikon emoji) dengan perubahan status (safe/warn/danger/lock), keterangan langkah, chip hukum ⚖️, pencegahan 🛡️, risiko ⚠️. Untuk PROSES (serangan, alur transaksi, alur data, alur hukum, alur kerja sama antarnegara). 5–8 langkah, 4–8 aktor. Koordinat x,y dalam persen (stage rasio 2:1): jaga jarak antar aktor min. ±22 poin horizontal dan ±24 vertikal supaya label tak bertabrakan; manfaatkan `zones` untuk mengelompokkan (mis. "Negara A"). `set:{id:['danger','teks badge']}`, `from`/`to` boleh array.
- `explorer`: kisi kartu jenis/konsep → detail bertab (Apa itu, Cara kerja, Contoh, Dampak, Dasar hukum, Pencegahan) dan bisa menanam animasi lewat `flow:"kunciFlow"` (kunci = salah satu flow di PAGE).
- `mock`: simulasi layar (`kind`: chat, email, web, post) dengan bagian yang bisa diklik (`parts:[ "teks", {t:"teks mencurigakan", h:"idHotspot"} ]`) dan `hotspots:[{id,label,why,decoy?}]` (decoy = tampak janggal tapi wajar). Untuk mengenali tanda bahaya.
- `timeline`: garis waktu klik. `spectrum`: slider trade-off dengan beberapa `stops`. `order`: urutkan langkah (item dalam urutan BENAR; sistem mengacak).

## Tugas
1. Baca `pertemuan-07.html` (contoh) dan pertemuan target (mis. `pertemuan-NN.html`) sampai tuntas, termasuk catatan "Verifikasi dosen".
2. Tambahkan minimal 5 widget visual BARU yang relevan dengan topik: >=2 `flow` (proses utama topik, mis. alur terjadinya), >=1 `explorer` (peta jenis/konsep), dan >=2 dari mock/timeline/spectrum/order sesuai kecocokan. Letakkan di segmen yang tepat (ganti atau pindahkan posisi widget lama bila perlu, tapi pertahankan quiz, refleksi, dan sebagian besar aktivitas lama). Tambahkan sinyal ke dosen di `<div class="lecturer">` (cara memakai tiap visual, pertanyaan pemantik, perkiraan menit). Total 6 segmen tetap 100 menit; jika segmen jadi terlalu padat, atur ulang durasi dan chip/timer agar tetap 100.
3. Konten WAJIB akurat. Jangan mengarang pasal, tanggal, atau angka. Bila ragu tulis umum dan beri kata "verifikasi" di chip hukum. Topik sensitif (serangan siber): konsep saja, tanpa instruksi teknis menyerang. Skenario fiktif harus berlabel.
4. Aktor/ikon: pakai emoji yang tampil umum di Windows (hindari emoji sangat baru). Teks badge pendek (<=18 karakter). Judul langkah pendek. `short` untuk rel langkah.
5. VERIFIKASI VISUAL (wajib): untuk tiap `flow` dan `explorer`/`mock` baru jalankan dari folder induk:
   `node _src/shot.js pertemuan-NN.html ID "KODE JS KLIK" _src/cek-NN-x.png 900`
   (kode klik contoh flow: `for(let i=0;i<4;i++)w.querySelector('[data-a=nx]').click();`; variabel `w` adalah elemen widget). Lalu Read gambar PNG untuk memeriksa: tidak ada label bertumpuk, aktor tidak keluar stage, teks terbaca. Perbaiki koordinat jika perlu. Hapus PNG cek setelah selesai.
6. Validasi sintaks: ekstrak semua `<script>` dan jalankan `new Function(isi)`; pastikan setiap widget `data-widget` punya entri `PAGE[id]` (periksa dengan skrip) dan kunci flow yang dirujuk explorer ada. Pertahankan kuis dan widget lama berfungsi.
7. Jangan sunting file pertemuan lain, jangan sunting `_src/viz.*` atau `_src/build.js`. Jika butuh perubahan pustaka, tulis di laporan akhir, jangan ubah sendiri.
8. Laporan akhir maksimal 6 baris: daftar widget visual baru (id + tipe), total menit segmen, item perlu verifikasi dosen, masalah visual tersisa.
