import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import OwnerClient from "./OwnerClient";

export default async function OwnerDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== "OWNER") {
    redirect("/login");
  }

  const owner = await prisma.owner.findUnique({
    where: { id: session.id },
    include: {
      tenants: {
        include: {
          penjuals: true,
          _count: {
            select: { transaksis: true, produks: true }
          }
        }
      }
    }
  });

  if (!owner) {
    redirect("/login");
  }

  // Convert Date and complex objects to plain objects/strings for Client Component
  const serializedTenants = owner.tenants.map(t => ({
    id: t.id,
    nama_warung: t.nama_warung,
    alamat_warung: t.alamat_warung,
    status: t.status,
    is_open: t.is_open,
    jadwal_buka: t.jadwal_buka,
    penjuals: t.penjuals.map(p => ({
      id: p.id,
      nama: p.nama,
      nomer_tlp: p.nomer_tlp,
      status: p.status
    })),
    stats: {
      transaksis: t._count.transaksis,
      produks: t._count.produks
    }
  }));

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-teal-900">Dashboard Owner</h1>
          <p className="text-gray-500">Selamat datang, {owner.nama}. Kelola cabang warung dan kasir Anda.</p>
        </div>

        <OwnerClient tenants={serializedTenants} ownerId={owner.id} />
      </div>
    </div>
  );
}
