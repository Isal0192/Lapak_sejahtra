"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleTenantStatus(tenantId: string, isOpen: boolean) {
  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { is_open: isOpen },
    });
    revalidatePath("/dashboard/owner");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengubah status toko" };
  }
}

export async function updateJadwalTenant(tenantId: string, jadwal: string) {
  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { jadwal_buka: jadwal },
    });
    revalidatePath("/dashboard/owner");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal mengubah jadwal" };
  }
}

export async function createPenjual(data: {
  id_tenant: string;
  nama: string;
  nomer_tlp: string;
}) {
  try {
    // Cek apakah nomor sudah dipakai penjual lain
    const existing = await prisma.penjual.findFirst({
      where: { nomer_tlp: data.nomer_tlp },
    });
    
    if (existing) {
      return { success: false, error: "Nomor WhatsApp sudah digunakan oleh kasir lain" };
    }

    await prisma.penjual.create({
      data: {
        id_tenant: data.id_tenant,
        nama: data.nama,
        nomer_tlp: data.nomer_tlp,
        password: "kasir" + data.nomer_tlp.slice(-4), // Default password kasir + 4 digit terakhir nomor
        status: "Aktif",
        role: "PENJUAL",
      },
    });

    revalidatePath("/dashboard/owner");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menambahkan kasir" };
  }
}
