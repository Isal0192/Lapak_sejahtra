"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createTransaksiDanItem } from "@/app/actions/transaksi";
import { checkPenitipGlobal, registerPenitipGlobal, getTenantStatus, checkProdukDiWarung, ajukanProdukBaru } from "@/app/actions/penitip";
import { cn } from "@/lib/utils";

const phoneSchema = z.object({
  nomerTlp: z.string().min(9, "Nomor WA tidak valid"),
});

const loginSchema = z.object({
  nomerTlp: z.string().min(9, "Nomor WA tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

const registerSchema = z.object({
  nama: z.string().min(2, "Nama terlalu pendek"),
  nomerTlp: z.string().min(9, "Nomor telepon tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  alamat: z.string().min(5, "Alamat terlalu pendek"),
});

const ajukanProdukSchema = z.object({
  nama_produk: z.string().min(2, "Nama produk terlalu pendek"),
  harga_titip: z.coerce.number().min(100, "Harga setor minimal 100"),
  harga_jual: z.coerce.number().min(100, "Harga jual minimal 100"),
});

const inputTitipSchema = z.object({
  produkId: z.string().min(1, "Pilih produk"),
  jumlahAwal: z.coerce.number().min(1, "Minimal titip 1"),
});

export default function TitipPage() {
  const searchParams = useSearchParams();
  const tenantId = searchParams.get("tenantId") || searchParams.get("tenant_id");

  const [tenantInfo, setTenantInfo] = useState<any>(null);
  const [penitipData, setPenitipData] = useState<any>(null);
  const [produks, setProduks] = useState<any[]>([]);
  
  // States: LOADING -> CLOSED | IDENTIFY -> LOGIN | REGISTER -> CHECK_PRODUK -> AJUKAN_PRODUK | DASHBOARD_PENITIP -> SUCCESS
  const [flowState, setFlowState] = useState("LOADING");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waUrl, setWaUrl] = useState("");

  useEffect(() => {
    if (tenantId) {
      getTenantStatus(tenantId).then(res => {
        if (res.data) {
          setTenantInfo(res.data);
          if (res.data.is_open) {
            setFlowState("IDENTIFY");
          } else {
            setFlowState("CLOSED");
          }
        } else {
          toast.error(res.error || "Warung tidak ditemukan");
          setFlowState("NO_TENANT");
        }
      });
    } else {
      setFlowState("NO_TENANT");
    }
  }, [tenantId]);

  const phoneForm = useForm({ resolver: zodResolver(phoneSchema), defaultValues: { nomerTlp: "" } });
  const loginForm = useForm({ resolver: zodResolver(loginSchema), defaultValues: { nomerTlp: "", password: "" } });
  const registerForm = useForm({ resolver: zodResolver(registerSchema), defaultValues: { nama: "", nomerTlp: "", password: "", alamat: "" } });
  const ajukanForm = useForm({ resolver: zodResolver(ajukanProdukSchema), defaultValues: { nama_produk: "", harga_titip: 0, harga_jual: 0 } });
  const inputForm = useForm({ resolver: zodResolver(inputTitipSchema), defaultValues: { produkId: "", jumlahAwal: 0 } });

  const onIdentifySubmit = async (data: any) => {
    setIsSubmitting(true);
    const res = await checkPenitipGlobal(data.nomerTlp);
    setIsSubmitting(false);

    if (res.exists) {
      loginForm.setValue("nomerTlp", data.nomerTlp);
      setFlowState("LOGIN");
    } else {
      registerForm.setValue("nomerTlp", data.nomerTlp);
      setFlowState("REGISTER");
    }
  };

  const onLoginSubmit = async (data: any) => {
    setIsSubmitting(true);
    const res = await checkPenitipGlobal(data.nomerTlp, data.password);
    if (res.exists && res.data) {
      setPenitipData(res.data);
      loadProduks(res.data.id);
    } else {
      setIsSubmitting(false);
      toast.error(res.error || "Gagal login");
    }
  };

  const onRegisterSubmit = async (data: any) => {
    setIsSubmitting(true);
    const res = await registerPenitipGlobal(data);
    if (res.success && res.data) {
      setPenitipData(res.data);
      loadProduks(res.data.id);
    } else {
      setIsSubmitting(false);
      toast.error(res.error);
    }
  };

  const loadProduks = async (idPenitip: string) => {
    setFlowState("CHECK_PRODUK");
    const res = await checkProdukDiWarung(idPenitip, tenantId!);
    setIsSubmitting(false);
    
    if (res.success) {
      setProduks(res.produks || []);
      setFlowState("DASHBOARD_PENITIP");
    } else {
      toast.error("Gagal memuat produk");
    }
  };

  const onAjukanSubmit = async (data: any) => {
    setIsSubmitting(true);
    const res = await ajukanProdukBaru({
      ...data,
      id_penitip: penitipData.id,
      id_tenant: tenantId!
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Produk berhasil diajukan!");
      loadProduks(penitipData.id); // Reload
    } else {
      toast.error(res.error);
    }
  };

  const onInputSubmit = async (data: any) => {
    setIsSubmitting(true);
    const res = await createTransaksiDanItem({
      tenantId: tenantId!,
      penitipId: penitipData.id,
      produkId: data.produkId,
      jumlahAwal: data.jumlahAwal,
    });
    setIsSubmitting(false);

    if (res.success) {
      setWaUrl(res.waUrl!);
      setFlowState("SUCCESS");
    } else {
      toast.error(res.error);
    }
  };

  if (flowState === "NO_TENANT") {
    return <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">QR Code tidak valid.</div>;
  }

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-emerald-600 rounded-b-[50%] opacity-20 transform -translate-y-20"></div>

      <Card className="w-full max-w-lg shadow-lg border-teal-100 z-10">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Titip Barang</CardTitle>
          <CardDescription className="text-teal-100">
            {tenantInfo?.nama_warung ? `di ${tenantInfo.nama_warung}` : ""}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6">
          {flowState === "LOADING" && <div className="text-center py-6 text-teal-600">Loading...</div>}

          {flowState === "CLOSED" && (
            <div className="text-center py-6 space-y-4">
              <h3 className="text-xl font-bold text-red-900">Warung Sedang Tutup</h3>
              <p className="text-red-700">Mohon maaf, <strong>{tenantInfo?.nama_warung}</strong> saat ini sedang tutup/libur.</p>
              <p className="text-sm text-red-500">Jadwal Buka: {tenantInfo?.jadwal_buka}</p>
            </div>
          )}

          {flowState === "IDENTIFY" && (
            <form onSubmit={phoneForm.handleSubmit(onIdentifySubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nomor WhatsApp Anda</Label>
                <Input placeholder="0812..." {...phoneForm.register("nomerTlp")} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Lanjut</Button>
            </form>
          )}

          {flowState === "LOGIN" && (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <div className="bg-teal-50 p-3 rounded text-sm text-teal-800 mb-4">
                Nomor Anda sudah terdaftar. Silakan masukkan password untuk login.
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" {...loginForm.register("password")} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white">Login</Button>
            </form>
          )}

          {flowState === "REGISTER" && (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
              <div className="bg-teal-50 p-3 rounded text-sm text-teal-800 mb-4">
                Pendaftaran Akun Penitip Baru (Hanya 1x seumur hidup)
              </div>
              <div className="space-y-2">
                <Label>Nama Lengkap</Label>
                <Input {...registerForm.register("nama")} />
              </div>
              <div className="space-y-2">
                <Label>Buat Password</Label>
                <Input type="password" {...registerForm.register("password")} />
              </div>
              <div className="space-y-2">
                <Label>Alamat</Label>
                <Input {...registerForm.register("alamat")} />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white">Daftar</Button>
            </form>
          )}

          {flowState === "CHECK_PRODUK" && <div className="text-center py-6 text-teal-600">Memeriksa Katalog Produk...</div>}

          {flowState === "DASHBOARD_PENITIP" && (
            <div className="space-y-6">
              <div className="bg-teal-50 p-4 rounded-lg border border-teal-100">
                <h3 className="font-semibold text-teal-900 mb-2">Daftar Produk Anda di {tenantInfo?.nama_warung}</h3>
                {produks.length === 0 ? (
                  <p className="text-sm text-gray-500">Belum ada produk yang diajukan.</p>
                ) : (
                  <ul className="space-y-2">
                    {produks.map(p => (
                      <li key={p.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm text-sm">
                        <span>{p.nama_produk}</span>
                        <span className={cn("text-xs px-2 py-1 rounded-full", 
                          p.status_approval === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                          p.status_approval === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                        )}>{p.status_approval}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Form Input Harian if there are approved products */}
              {produks.some(p => p.status_approval === "APPROVED") && (
                <Card className="border-emerald-200">
                  <CardHeader className="bg-emerald-50 pb-4">
                    <CardTitle className="text-lg">Input Titipan Hari Ini</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4">
                    <form onSubmit={inputForm.handleSubmit(onInputSubmit)} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Pilih Produk</Label>
                        <select {...inputForm.register("produkId")} className="flex h-10 w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400">
                          <option value="">-- Pilih Produk --</option>
                          {produks.filter(p => p.status_approval === "APPROVED").map(p => (
                            <option key={p.id} value={p.id}>{p.nama_produk}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label>Jumlah Titip (Pcs)</Label>
                        <Input type="number" {...inputForm.register("jumlahAwal")} />
                      </div>
                      <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white">Input Barang</Button>
                    </form>
                  </CardContent>
                </Card>
              )}

              <div className="text-center pt-2">
                <Button variant="outline" onClick={() => setFlowState("AJUKAN_PRODUK")} className="w-full border-dashed border-2 border-teal-300 text-teal-700">
                  + Ajukan Produk Baru ke Warung Ini
                </Button>
              </div>
            </div>
          )}

          {flowState === "AJUKAN_PRODUK" && (
            <form onSubmit={ajukanForm.handleSubmit(onAjukanSubmit)} className="space-y-4">
              <h3 className="font-semibold text-teal-900 mb-2">Ajukan Produk Baru</h3>
              <div className="space-y-2">
                <Label>Nama Produk</Label>
                <Input {...ajukanForm.register("nama_produk")} />
              </div>
              <div className="space-y-2">
                <Label>Harga Setor (Harga Titip)</Label>
                <Input type="number" {...ajukanForm.register("harga_titip")} />
              </div>
              <div className="space-y-2">
                <Label>Harga Jual (Di Warung)</Label>
                <Input type="number" {...ajukanForm.register("harga_jual")} />
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setFlowState("DASHBOARD_PENITIP")} className="w-full">Batal</Button>
                <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white">Ajukan</Button>
              </div>
            </form>
          )}

          {flowState === "SUCCESS" && (
            <div className="text-center py-6 space-y-4 animate-in zoom-in">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <h3 className="text-xl font-bold text-emerald-900">Input Titipan Berhasil!</h3>
              <p className="text-emerald-700 mb-6">Barang Anda telah tercatat di sistem warung hari ini.</p>
              
              <a href={waUrl} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center rounded-md bg-[#25D366] px-4 py-2 text-sm font-medium text-white hover:bg-[#20bd5a]">
                Kirim Notif WhatsApp ke Kasir
              </a>
              <Button variant="outline" className="w-full mt-2" onClick={() => { inputForm.reset(); setFlowState("DASHBOARD_PENITIP"); }}>
                Kembali
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
