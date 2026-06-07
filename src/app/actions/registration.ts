"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function registerOwnerAndTenant(data: {
  namaOwner: string;
  nomerTlpOwner: string;
  alamatOwner: string;
  emailOwner: string;
  password?: string;
  namaWarung: string;
  alamatWarung: string;
}) {
  try {
    const owner = await prisma.owner.create({
      data: {
        nama: data.namaOwner,
        nomer_tlp: data.nomerTlpOwner,
        alamat: data.alamatOwner,
        email: data.emailOwner,
        password: data.password || "password123",
        isPaid: false,
        role: "OWNER",
      },
    });

    const tenant = await prisma.tenant.create({
      data: {
        id_owner: owner.id,
        nama_warung: data.namaWarung,
        alamat_warung: data.alamatWarung,
        status: "PENDING",
      },
    });

    return { success: true, ownerId: owner.id, tenantId: tenant.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mendaftar" };
  }
}

export async function payRegistration(ownerId: string) {
  try {
    const owner = await prisma.owner.findUnique({
      where: { id: ownerId },
      include: { tenants: true },
    });

    if (!owner) throw new Error("Owner tidak ditemukan");

    // Update Owner
    await prisma.owner.update({
      where: { id: ownerId },
      data: { isPaid: true },
    });

    // Update all their tenants to ACTIVE (usually just one on registration)
    await prisma.tenant.updateMany({
      where: { id_owner: ownerId },
      data: { status: "ACTIVE" },
    });

    revalidatePath("/dashboard");
    return { success: true, tenantId: owner.tenants[0]?.id };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memproses pembayaran" };
  }
}
