"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { payRegistration } from "@/app/actions/registration";

function PaymentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ownerId = searchParams.get("owner_id");

  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    if (!ownerId) {
      toast.error("ID Owner tidak valid.");
      return;
    }

    setIsProcessing(true);
    const res = await payRegistration(ownerId);
    setIsProcessing(false);

    if (res.success && res.tenantId) {
      toast.success("Pembayaran berhasil! Warung Anda kini aktif.");
      router.push(`/dashboard?tenant_id=${res.tenantId}`);
    } else {
      toast.error("Pembayaran gagal: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-teal-100 text-center">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Aktivasi Warung</CardTitle>
          <CardDescription className="text-teal-100">
            Selesaikan pembayaran pendaftaran
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-8 pb-4 space-y-6">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-teal-900">Total Tagihan</h3>
            <p className="text-3xl font-extrabold text-emerald-600">Rp 50.000</p>
            <p className="text-sm text-teal-700">Biaya aktivasi cabang warung seumur hidup.</p>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm text-gray-500 font-medium">Silakan transfer ke rekening berikut:</p>
            <div className="flex justify-between items-center bg-white p-3 rounded border border-gray-200">
              <div>
                <p className="font-bold text-teal-900">Bank BCA</p>
                <p className="text-lg font-mono text-gray-700">0123 4567 890</p>
                <p className="text-xs text-gray-500">a/n Lapak Sejahtera</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">*Sistem akan memverifikasi pembayaran Anda secara otomatis dalam hitungan detik setelah transfer berhasil.</p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-3 pb-6">
          <Button onClick={handlePayment} disabled={isProcessing} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg font-semibold shadow-md">
            {isProcessing ? "Memverifikasi..." : "Saya Sudah Transfer"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-teal-50 flex items-center justify-center">Loading...</div>}>
      <PaymentContent />
    </Suspense>
  );
}
