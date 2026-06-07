"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateJumlahSisaItem } from "@/app/actions/transaksi";
import { approveProduk, rejectProduk } from "@/app/actions/approval";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/actions/auth";
import { useRouter } from "next/navigation";

type AnalyticsData = {
  pendapatanKotor: number;
  keuntunganBersih: number;
  uangPenitip: number;
  itemsList: Array<{
    id: string;
    nama_item: string;
    harga_titip: number;
    harga_jual: number;
    jumlah_awal: number;
    jumlah_sisa: number;
    terjual: number;
    penitip_nama: string;
    tanggal: Date;
  }>;
};

type ProdukData = {
  id: string;
  nama_produk: string;
  harga_titip: number;
  harga_jual: number;
  status_approval: string;
  penitip: {
    nama: string;
    nomer_tlp: string;
  }
};

export default function PenjualClient({ initialData, produks }: { initialData: AnalyticsData, produks: ProdukData[] }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState("ringkasan");
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editSisa, setEditSisa] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  const startEdit = (id: string, sisa: number) => {
    setEditingItemId(id);
    setEditSisa(sisa);
  };

  const handleUpdate = async (id: string, jumlahAwal: number) => {
    if (editSisa < 0 || editSisa > jumlahAwal) {
      toast.error("Jumlah sisa tidak valid!");
      return;
    }

    setIsUpdating(true);
    const res = await updateJumlahSisaItem(id, editSisa);
    setIsUpdating(false);

    if (res.success) {
      toast.success("Sisa barang berhasil diupdate!");
      setEditingItemId(null);
      // Untuk full update angka dashboard, ideally kita re-fetch.
      // Server action sudah memanggil revalidatePath("/dashboard")
      // Karena ini adalah client component dan kita mau state terupdate instant sebelum refresh Next.js:
      // (Bisa juga biarkan Next.js yang merefresh karena ada revalidatePath)
      window.location.reload(); 
    } else {
      toast.error("Gagal update sisa barang");
    }
  };

  const handleApprove = async (id: string) => {
    const res = await approveProduk(id);
    if (res.success) {
      toast.success("Berhasil menerima produk titipan!");
      window.location.reload();
    } else toast.error("Gagal: " + res.error);
  };

  const handleReject = async (id: string) => {
    const res = await rejectProduk(id);
    if (res.success) {
      toast.success("Berhasil menolak produk titipan.");
      window.location.reload();
    } else toast.error("Gagal: " + res.error);
  };

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <div className="space-y-6">
      {/* Custom Tabs Header */}
      <div className="flex justify-between items-center border-b border-teal-200 pb-2">
        <div className="flex space-x-2">
          <button 
            onClick={() => setActiveTab("ringkasan")}
            className={cn("px-4 py-2 font-medium rounded-t-lg transition-colors", activeTab === "ringkasan" ? "bg-emerald-600 text-white" : "text-teal-700 hover:bg-teal-50")}
          >
            Ringkasan & Stok
          </button>
          <button 
            onClick={() => setActiveTab("persetujuan")}
            className={cn("px-4 py-2 font-medium rounded-t-lg transition-colors flex items-center gap-2", activeTab === "persetujuan" ? "bg-emerald-600 text-white" : "text-teal-700 hover:bg-teal-50")}
          >
            Persetujuan Produk
            {produks.filter(p => p.status_approval === "PENDING").length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                {produks.filter(p => p.status_approval === "PENDING").length}
              </span>
            )}
          </button>
        </div>
        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={handleLogout}>
          Logout
        </Button>
      </div>

      {activeTab === "ringkasan" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card className="border-teal-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Uang Kasir (Kotor)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">Rp {data.pendapatanKotor.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
        
        <Card className="border-teal-100 shadow-sm bg-emerald-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-700">Laba Bersih Warung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">Rp {data.keuntunganBersih.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>

        <Card className="border-teal-100 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-teal-700">Hak Penitip</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-900">Rp {data.uangPenitip.toLocaleString('id-ID')}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-teal-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl text-teal-900">Stok Barang Masuk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-teal-50/50">
                <TableRow>
                  <TableHead>Tgl Masuk</TableHead>
                  <TableHead>Penitip</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Harga Jual</TableHead>
                  <TableHead>Awal</TableHead>
                  <TableHead>Terjual</TableHead>
                  <TableHead>Sisa</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.itemsList.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-teal-600">Belum ada data barang.</TableCell>
                  </TableRow>
                ) : (
                  data.itemsList.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{new Date(item.tanggal).toLocaleDateString('id-ID')}</TableCell>
                      <TableCell className="font-medium">{item.penitip_nama}</TableCell>
                      <TableCell>{item.nama_item}</TableCell>
                      <TableCell>Rp {item.harga_jual.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{item.jumlah_awal}</TableCell>
                      <TableCell className="text-emerald-600 font-semibold">{item.terjual}</TableCell>
                      <TableCell>
                        {editingItemId === item.id ? (
                          <Input 
                            type="number" 
                            className="w-20 h-8" 
                            value={editSisa} 
                            onChange={(e) => setEditSisa(parseInt(e.target.value) || 0)} 
                            min={0} 
                            max={item.jumlah_awal}
                          />
                        ) : (
                          <span className="font-semibold">{item.jumlah_sisa}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editingItemId === item.id ? (
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingItemId(null)} disabled={isUpdating}>Batal</Button>
                            <Button size="sm" onClick={() => handleUpdate(item.id, item.jumlah_awal)} disabled={isUpdating} className="bg-emerald-600 text-white hover:bg-emerald-700">Simpan</Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="ghost" className="text-teal-700 hover:text-teal-900 hover:bg-teal-50" onClick={() => startEdit(item.id, item.jumlah_sisa)}>Update Sisa</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
        </div>
      )}

      {activeTab === "persetujuan" && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <Card className="border-teal-100 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-teal-900">Daftar Pengajuan Produk Baru</CardTitle>
            </CardHeader>
            <CardContent>
              {produks.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                  Belum ada pengajuan produk baru dari penitip.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-teal-50">
                      <TableRow>
                        <TableHead>Nama Penitip</TableHead>
                        <TableHead>No. WA</TableHead>
                        <TableHead>Produk</TableHead>
                        <TableHead>Harga Setor</TableHead>
                        <TableHead>Harga Jual</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Aksi</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {produks.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="font-medium">{p.penitip.nama}</TableCell>
                          <TableCell>{p.penitip.nomer_tlp}</TableCell>
                          <TableCell>{p.nama_produk}</TableCell>
                          <TableCell>Rp {p.harga_titip.toLocaleString('id-ID')}</TableCell>
                          <TableCell>Rp {p.harga_jual.toLocaleString('id-ID')}</TableCell>
                          <TableCell>
                            <span className={cn("px-2 py-1 rounded-full text-xs font-medium", 
                              p.status_approval === "PENDING" ? "bg-yellow-100 text-yellow-700" :
                              p.status_approval === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                              "bg-red-100 text-red-700"
                            )}>
                              {p.status_approval}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-2">
                            {p.status_approval === "PENDING" && (
                              <>
                                <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleReject(p.id)}>Tolak</Button>
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleApprove(p.id)}>Terima</Button>
                              </>
                            )}
                            {p.status_approval === "REJECTED" && (
                              <Button size="sm" variant="outline" className="border-emerald-200 text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprove(p.id)}>Ubah ke Terima</Button>
                            )}
                            {p.status_approval === "APPROVED" && (
                              <Button size="sm" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleReject(p.id)}>Batalkan (Tolak)</Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
