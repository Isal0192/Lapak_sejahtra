"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function approveProduk(produkId: string) {
  try {
    await prisma.produkTitipan.update({
      where: { id: produkId },
      data: { status_approval: "APPROVED" },
    });
    revalidatePath("/dashboard/penjual");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menyetujui produk" };
  }
}

export async function rejectProduk(produkId: string) {
  try {
    await prisma.produkTitipan.update({
      where: { id: produkId },
      data: { status_approval: "REJECTED" },
    });
    revalidatePath("/dashboard/penjual");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Gagal menolak produk" };
  }
}
