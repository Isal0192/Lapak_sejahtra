"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTransaksiDanItem(data: {
  tenantId: string;
  penitipId: string;
  produkId: string;
  jumlahAwal: number;
}) {
  try {
    // Cari produk untuk mengecek validitas dan mengambil harga
    const produk = await prisma.produkTitipan.findUnique({
      where: { id: data.produkId },
      include: { penitip: true }
    });

    if (!produk || produk.status_approval !== "APPROVED") {
      return { success: false, error: "Produk tidak valid atau belum disetujui." };
    }

    // 1. Buat Transaksi
    const transaksi = await prisma.transaksiPenitipan.create({
      data: {
        id_tenant: data.tenantId,
        id_penitip: data.penitipId,
        status_transaksi: "Titip",
      },
    });

    // 2. Buat Item (Input Harian)
    await prisma.item.create({
      data: {
        id_transaksi: transaksi.id,
        id_produk: data.produkId,
        jumlah_awal: data.jumlahAwal,
        jumlah_sisa: data.jumlahAwal, 
      },
    });

    // 3. Buat URL WhatsApp
    const textWa = `Halo, saya ${produk.penitip.nama} telah menitipkan barang hari ini:
Item: ${produk.nama_produk}
Jumlah Titip: ${data.jumlahAwal} pcs

Mohon dicek di dashboard warung. Terima kasih!`;
    
    // Asumsi kita menggunakan nomor telepon tenant jika ada, namun kita butuh mengambil nomor tenant/owner.
    // Sementara kita return textWa agar frontend bisa menggunakan link `https://wa.me/?text=...` atau ambil nomor penjual
    
    const tenant = await prisma.tenant.findUnique({
      where: { id: data.tenantId },
      include: { owner: true }
    });
    
    // Nomor WA kasir/owner, misal ambil dari owner
    let nomorTujuan = tenant?.owner.nomer_tlp || "";
    // Hilangkan karakter non numerik, ganti 0 di awal dengan 62 (contoh format Indo)
    nomorTujuan = nomorTujuan.replace(/\D/g, "");
    if (nomorTujuan.startsWith("0")) {
      nomorTujuan = "62" + nomorTujuan.substring(1);
    }

    const waUrl = `https://wa.me/${nomorTujuan}?text=${encodeURIComponent(textWa)}`;

    revalidatePath("/dashboard");
    revalidatePath("/titip");

    return { success: true, waUrl };
  } catch (error: any) {
    console.error("Error createTransaksiDanItem:", error);
    return { success: false, error: error.message };
  }
}

export async function updateJumlahSisaItem(itemId: string, jumlahSisa: number) {
  try {
    await prisma.item.update({
      where: { id: itemId },
      data: { jumlah_sisa: jumlahSisa },
    });
    
    revalidatePath("/dashboard/penjual");
    return { success: true };
  } catch (error: any) {
    console.error("Error updateJumlahSisaItem:", error);
    return { success: false, error: error.message };
  }
}
