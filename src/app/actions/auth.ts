"use server";

import prisma from "@/lib/prisma";
import { createSession, destroySession } from "@/lib/auth";

export async function loginAction(nomerTlp: string, password: string) {
  try {
    // 1. Cek di tabel Owner
    const owner = await prisma.owner.findFirst({
      where: { nomer_tlp: nomerTlp, password: password },
    });

    if (owner) {
      await createSession({
        id: owner.id,
        role: "OWNER",
      });
      return { success: true, role: "OWNER" };
    }

    // 2. Cek di tabel Penjual
    const penjual = await prisma.penjual.findFirst({
      where: { nomer_tlp: nomerTlp, password: password },
    });

    if (penjual) {
      await createSession({
        id: penjual.id,
        role: "PENJUAL",
        tenantId: penjual.id_tenant,
      });
      return { success: true, role: "PENJUAL" };
    }

    // 3. Cek di tabel Penitip
    const penitip = await prisma.penitip.findFirst({
      where: { nomer_tlp: nomerTlp, password: password },
    });

    if (penitip) {
      await createSession({
        id: penitip.id,
        role: "PENITIP",
      });
      return { success: true, role: "PENITIP" };
    }

    return { success: false, error: "Nomor WhatsApp atau Password salah!" };
  } catch (error: any) {
    return { success: false, error: "Terjadi kesalahan sistem." };
  }
}

export async function logoutAction() {
  await destroySession();
  return { success: true };
}
