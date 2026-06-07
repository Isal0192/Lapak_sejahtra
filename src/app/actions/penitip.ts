"use server";

import prisma from "@/lib/prisma";

export async function getTenantStatus(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { is_open: true, nama_warung: true, jadwal_buka: true },
    });
    if (!tenant) return { error: "Warung tidak ditemukan" };
    return { data: tenant };
  } catch (error) {
    return { error: "Gagal memuat status warung" };
  }
}

export async function checkPenitipGlobal(phone: string, password?: string) {
  try {
    const penitip = await prisma.penitip.findUnique({
      where: { nomer_tlp: phone },
    });
    if (!penitip) return { exists: false };
    
    // Jika password disertakan, cek kecocokan (untuk login di form)
    if (password && penitip.password !== password) {
      return { exists: true, error: "Password salah!" };
    }

    return { exists: true, data: penitip };
  } catch (error: any) {
    return { error: error.message || "Gagal memeriksa data penitip" };
  }
}

export async function checkProdukDiWarung(penitipId: string, tenantId: string) {
  try {
    const produks = await prisma.produkTitipan.findMany({
      where: { id_penitip: penitipId, id_tenant: tenantId }
    });
    return { success: true, produks };
  } catch (error: any) {
    return { success: false, error: "Gagal mengambil data produk" };
  }
}

export async function registerPenitipGlobal(data: {
  nama: string;
  nomer_tlp: string;
  password?: string;
  alamat: string;
}) {
  try {
    const penitip = await prisma.penitip.create({
      data: {
        nama: data.nama,
        nomer_tlp: data.nomer_tlp,
        alamat: data.alamat,
        password: data.password || "penitip123",
        role: "PENITIP",
      },
    });
    return { success: true, data: penitip };
  } catch (error: any) {
    return { success: false, error: "Gagal mendaftar sebagai penitip. Nomor WA mungkin sudah terdaftar." };
  }
}

export async function ajukanProdukBaru(data: {
  id_penitip: string;
  id_tenant: string;
  nama_produk: string;
  harga_titip: number;
  harga_jual: number;
}) {
  try {
    const produk = await prisma.produkTitipan.create({
      data: {
        id_penitip: data.id_penitip,
        id_tenant: data.id_tenant,
        nama_produk: data.nama_produk,
        harga_titip: data.harga_titip,
        harga_jual: data.harga_jual,
        status_approval: "PENDING",
      }
    });
    return { success: true, produk };
  } catch (error: any) {
    return { success: false, error: "Gagal mengajukan produk." };
  }
}
