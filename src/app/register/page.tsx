"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { registerOwnerAndTenant } from "@/app/actions/registration";

const formSchema = z.object({
  namaOwner: z.string().min(2, "Nama terlalu pendek"),
  nomerTlpOwner: z.string().min(9, "Nomor telepon tidak valid"),
  alamatOwner: z.string().min(5, "Alamat terlalu pendek"),
  emailOwner: z.string().email("Email tidak valid"),
  password: z.string().min(6, "Password minimal 6 karakter"),
  namaWarung: z.string().min(3, "Nama warung terlalu pendek"),
  alamatWarung: z.string().min(5, "Alamat warung terlalu pendek"),
});

type FormValues = z.infer<typeof formSchema>;

export default function RegisterOwnerPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      namaOwner: "",
      nomerTlpOwner: "",
      alamatOwner: "",
      emailOwner: "",
      password: "",
      namaWarung: "",
      alamatWarung: "",
    },
  });

  const { register, handleSubmit, formState: { errors }, trigger } = form;

  const nextStep = async () => {
    let isValid = false;
    if (step === 1) {
      isValid = await trigger(["namaOwner", "nomerTlpOwner", "alamatOwner", "emailOwner", "password"]);
    }
    
    if (isValid) {
      setStep(2);
    }
  };

  const prevStep = () => {
    setStep(1);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    const res = await registerOwnerAndTenant(data);
    setIsSubmitting(false);

    if (res.success && res.ownerId) {
      toast.success("Pendaftaran berhasil! Lanjutkan ke pembayaran.");
      router.push(`/register/payment?owner_id=${res.ownerId}`);
    } else {
      toast.error("Gagal mendaftar: " + res.error);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-lg border-teal-100">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Pendaftaran Warung (Owner)</CardTitle>
          <CardDescription className="text-teal-100">
            {step === 1 && "Langkah 1: Informasi Data Diri Pemilik"}
            {step === 2 && "Langkah 2: Informasi Detail Warung"}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="namaOwner">Nama Lengkap</Label>
                  <Input id="namaOwner" placeholder="Cth: Budi Santoso" {...register("namaOwner")} className="border-teal-200 focus-visible:ring-emerald-500" />
                  {errors.namaOwner && <p className="text-red-500 text-sm">{errors.namaOwner.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nomerTlpOwner">Nomor WhatsApp</Label>
                  <Input id="nomerTlpOwner" placeholder="0812..." {...register("nomerTlpOwner")} className="border-teal-200 focus-visible:ring-emerald-500" />
                  {errors.nomerTlpOwner && <p className="text-red-500 text-sm">{errors.nomerTlpOwner.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailOwner">Alamat Email</Label>
                  <Input id="emailOwner" type="email" placeholder="budi@example.com" {...register("emailOwner")} className="border-teal-200 focus-visible:ring-emerald-500" />
                  {errors.emailOwner && <p className="text-red-500 text-sm">{errors.emailOwner.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password (Untuk Login)</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...register("password")} className="border-teal-200 focus-visible:ring-emerald-500" />
                  {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamatOwner">Alamat Rumah</Label>
                  <Input id="alamatOwner" placeholder="Alamat lengkap..." {...register("alamatOwner")} className="border-teal-200 focus-visible:ring-emerald-500" />
                  {errors.alamatOwner && <p className="text-red-500 text-sm">{errors.alamatOwner.message}</p>}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="namaWarung">Nama Warung</Label>
                  <Input id="namaWarung" placeholder="Cth: Warung Berkah" {...register("namaWarung")} className="border-teal-200 focus-visible:ring-emerald-500" />
                  {errors.namaWarung && <p className="text-red-500 text-sm">{errors.namaWarung.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alamatWarung">Alamat Warung</Label>
                  <Input id="alamatWarung" placeholder="Lokasi warung..." {...register("alamatWarung")} className="border-teal-200 focus-visible:ring-emerald-500" />
                  {errors.alamatWarung && <p className="text-red-500 text-sm">{errors.alamatWarung.message}</p>}
                </div>
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex justify-between border-t border-teal-100 pt-4">
          {step === 2 ? (
            <Button type="button" variant="outline" onClick={prevStep} className="border-teal-200 text-teal-700 hover:bg-teal-50">
              Kembali
            </Button>
          ) : (
            <div></div>
          )}
          
          {step === 1 ? (
            <Button type="button" onClick={nextStep} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Selanjutnya
            </Button>
          ) : (
            <Button type="button" onClick={handleSubmit(onSubmit)} disabled={isSubmitting} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Memproses..." : "Daftar Sekarang"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
