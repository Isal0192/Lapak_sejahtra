import { getDashboardAnalytics } from "@/app/actions/analytics";
import PenjualClient from "./PenjualClient";
import { Suspense } from "react";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function PenjualDashboardPage() {
  const session = await getSession();
  
  if (!session || session.role !== "PENJUAL" || !session.tenantId) {
    redirect("/login");
  }

  const tenantId = session.tenantId;

  const result = await getDashboardAnalytics(tenantId);

  if (!result.success || !result.data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 max-w-md text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600">{result.error || "Gagal memuat data analitik."}</p>
        </div>
      </div>
    );
  }

  const produks = await prisma.produkTitipan.findMany({
    where: { id_tenant: tenantId },
    include: { penitip: true },
    orderBy: { status_approval: 'asc' }, // PENDING first
  });

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-teal-900">Dashboard Penjual (Kasir)</h1>
          <p className="text-gray-500">Pantau performa dan setujui pendaftaran produk titipan di warung ini.</p>
        </div>

        <Suspense fallback={<div className="h-40 flex items-center justify-center text-teal-600">Memuat data...</div>}>
          <PenjualClient initialData={result.data} produks={produks} />
        </Suspense>
      </div>
    </div>
  );
}
