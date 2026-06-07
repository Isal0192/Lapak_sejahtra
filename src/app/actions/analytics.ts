"use server";

import prisma from "@/lib/prisma";

export async function getDashboardAnalytics(tenantId: string) {
  try {
    // Ambil semua transaksi milik tenant ini
    const transaksis = await prisma.transaksiPenitipan.findMany({
      where: { id_tenant: tenantId },
      include: {
        items: { include: { produk: true } },
      },
    });

    let pendapatanKotor = 0;
    let keuntunganBersih = 0;
    let uangPenitip = 0;
    
    // Siapkan daftar stok untuk ditampilkan di tabel
    const itemsList: Array<{
      id: string;
      nama_item: string;
      harga_titip: number;
      harga_jual: number;
      jumlah_awal: number;
      jumlah_sisa: number;
      terjual: number;
      penitip_nama: string;
      tanggal: Date;
    }> = [];

    // Jika butuh join penitip nama, mari ambil ulang dengan relasi penitip
    const transaksisWithPenitip = await prisma.transaksiPenitipan.findMany({
      where: { id_tenant: tenantId },
      include: {
        items: { include: { produk: true } },
        penitip: true,
      },
      orderBy: { tanggal: 'desc' }
    });

    for (const trx of transaksisWithPenitip) {
      for (const item of trx.items) {
        const terjual = item.jumlah_awal - item.jumlah_sisa;
        
        // Kalkulasi uang
        const itemPendapatanKotor = terjual * item.produk.harga_jual;
        const itemUangPenitip = terjual * item.produk.harga_titip;
        const itemKeuntunganBersih = itemPendapatanKotor - itemUangPenitip;

        pendapatanKotor += itemPendapatanKotor;
        uangPenitip += itemUangPenitip;
        keuntunganBersih += itemKeuntunganBersih;

        itemsList.push({
          id: item.id,
          nama_item: item.produk.nama_produk,
          harga_titip: item.produk.harga_titip,
          harga_jual: item.produk.harga_jual,
          jumlah_awal: item.jumlah_awal,
          jumlah_sisa: item.jumlah_sisa,
          terjual,
          penitip_nama: trx.penitip.nama,
          tanggal: trx.tanggal
        });
      }
    }

    return {
      success: true,
      data: {
        pendapatanKotor,
        keuntunganBersih,
        uangPenitip,
        itemsList
      }
    };
  } catch (error: any) {
    console.error("Error getDashboardAnalytics:", error);
    return { success: false, error: error.message };
  }
}
