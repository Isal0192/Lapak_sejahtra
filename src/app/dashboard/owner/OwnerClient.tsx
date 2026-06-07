"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { logoutAction } from "@/app/actions/auth";
import { toggleTenantStatus, updateJadwalTenant, createPenjual } from "@/app/actions/owner";
import { useRouter } from "next/navigation";

export default function OwnerClient({ tenants, ownerId }: { tenants: any[], ownerId: string }) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("cabang");
  
  // States for modals/forms
  const [qrTenantId, setQrTenantId] = useState<string | null>(null);
  const [jadwalForm, setJadwalForm] = useState<{ id: string, jadwal: string } | null>(null);
  const [kasirForm, setKasirForm] = useState<{ id_tenant: string, nama: string, nomer_tlp: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  const handleToggleBuka = async (tenantId: string, currentStatus: boolean) => {
    const res = await toggleTenantStatus(tenantId, !currentStatus);
    if (res.success) {
      toast.success(`Warung berhasil ${!currentStatus ? 'dibuka' : 'ditutup'}!`);
    } else {
      toast.error(res.error);
    }
  };

  const handleUpdateJadwal = async () => {
    if (!jadwalForm) return;
    setIsSubmitting(true);
    const res = await updateJadwalTenant(jadwalForm.id, jadwalForm.jadwal);
    setIsSubmitting(false);
    if (res.success) {
      toast.success("Jadwal berhasil diperbarui!");
      setJadwalForm(null);
    } else {
      toast.error(res.error);
    }
  };

  const handleCreateKasir = async () => {
    if (!kasirForm) return;
    if (!kasirForm.nama || !kasirForm.nomer_tlp) {
      toast.error("Nama dan Nomor WA wajib diisi");
      return;
    }
    setIsSubmitting(true);
    const res = await createPenjual(kasirForm);
    setIsSubmitting(false);
    if (res.success) {
      toast.success("Akun Kasir berhasil dibuat! Password default adalah 'kasir' + 4 digit terakhir nomor WA.");
      setKasirForm(null);
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="space-y-6 relative">
      {/* Header Actions */}
      <div className="flex justify-between items-center border-b border-teal-200 pb-4">
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab("cabang")}
            className={`px-4 py-2 font-medium rounded-t-lg transition-colors ${activeTab === "cabang" ? "bg-emerald-600 text-white" : "text-teal-700 hover:bg-teal-50"}`}
          >
            Daftar Warung (Cabang)
          </button>
        </div>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {activeTab === "cabang" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map(tenant => (
            <Card key={tenant.id} className={`border-teal-100 shadow-md ${!tenant.is_open && 'opacity-75 bg-gray-50'}`}>
              <CardHeader className="pb-3 border-b border-teal-50">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl text-teal-900">{tenant.nama_warung}</CardTitle>
                    <CardDescription className="text-teal-600 truncate">{tenant.alamat_warung}</CardDescription>
                  </div>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${tenant.is_open ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                    {tenant.is_open ? 'BUKA' : 'TUTUP'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jadwal:</span>
                  <span className="font-medium text-teal-900">{tenant.jadwal_buka}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Jumlah Kasir:</span>
                  <span className="font-medium text-teal-900">{tenant.penjuals.length} Orang</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Produk Diajukan:</span>
                  <span className="font-medium text-teal-900">{tenant.stats.produks} Produk</span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50" onClick={() => handleToggleBuka(tenant.id, tenant.is_open)}>
                    {tenant.is_open ? 'Tutup Warung' : 'Buka Warung'}
                  </Button>
                  <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50" onClick={() => setJadwalForm({ id: tenant.id, jadwal: tenant.jadwal_buka })}>
                    Edit Jadwal
                  </Button>
                  <Button size="sm" variant="outline" className="border-teal-300 text-teal-700 hover:bg-teal-50" onClick={() => setKasirForm({ id_tenant: tenant.id, nama: "", nomer_tlp: "" })}>
                    + Akun Kasir
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setQrTenantId(tenant.id)}>
                    Tampil QR Code
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {/* Card Add Tenant */}
          <Card className="border-dashed border-2 border-teal-200 flex items-center justify-center bg-teal-50/30 hover:bg-teal-50 cursor-pointer min-h-[250px]" onClick={() => router.push(`/register?owner_id=${ownerId}`)}>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              </div>
              <h3 className="font-semibold text-teal-800">Tambah Cabang Warung</h3>
              <p className="text-sm text-teal-600 px-4">Daftarkan warung baru di bawah kepemilikan Anda.</p>
            </div>
          </Card>
        </div>
      )}

      {/* MODAL QR CODE */}
      {qrTenantId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle className="text-center">QR Code Penitip</CardTitle>
              <CardDescription className="text-center">Cetak dan tempel di depan warung Anda.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <QRCodeSVG 
                value={`${window.location.origin}/titip?tenant_id=${qrTenantId}`} 
                size={250} 
                level="H" 
                includeMargin={true}
              />
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant="outline" onClick={() => setQrTenantId(null)}>Tutup</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* MODAL EDIT JADWAL */}
      {jadwalForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Edit Jadwal Buka</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Jadwal Buka & Jam</Label>
                <Input value={jadwalForm.jadwal} onChange={(e) => setJadwalForm({...jadwalForm, jadwal: e.target.value})} placeholder="Senin - Jumat, 08:00 - 20:00" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setJadwalForm(null)}>Batal</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleUpdateJadwal} disabled={isSubmitting}>Simpan</Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* MODAL TAMBAH KASIR */}
      {kasirForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-sm">
            <CardHeader>
              <CardTitle>Buat Akun Kasir (Penjual)</CardTitle>
              <CardDescription>Akun untuk staf warung Anda</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nama Kasir</Label>
                <Input value={kasirForm.nama} onChange={(e) => setKasirForm({...kasirForm, nama: e.target.value})} placeholder="Siti" />
              </div>
              <div className="space-y-2">
                <Label>Nomor WhatsApp (Untuk Login)</Label>
                <Input value={kasirForm.nomer_tlp} onChange={(e) => setKasirForm({...kasirForm, nomer_tlp: e.target.value})} placeholder="0812..." />
                <p className="text-xs text-gray-500">Password otomatis dibuat: "kasir" + 4 digit terakhir nomor WA.</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setKasirForm(null)}>Batal</Button>
              <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCreateKasir} disabled={isSubmitting}>Buat Akun</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
