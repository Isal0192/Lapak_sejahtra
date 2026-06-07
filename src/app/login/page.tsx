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
import { loginAction } from "@/app/actions/auth";
import Link from "next/link";

const loginSchema = z.object({
  nomerTlp: z.string().min(5, "Nomor WhatsApp wajib diisi"),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { nomerTlp: "", password: "" },
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    const res = await loginAction(data.nomerTlp, data.password);
    setIsSubmitting(false);

    if (res.success) {
      toast.success("Login berhasil!");
      router.push("/dashboard"); // Middleware akan handle redirect ke /owner atau /penjual
    } else {
      toast.error(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-teal-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm shadow-lg border-teal-100">
        <CardHeader className="bg-emerald-600 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">Login Dashboard</CardTitle>
          <CardDescription className="text-teal-100">
            Masuk sebagai Owner, Kasir, atau Penitip
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nomerTlp">Nomor WhatsApp</Label>
              <Input id="nomerTlp" placeholder="0812..." {...form.register("nomerTlp")} className="border-teal-200" />
              {form.formState.errors.nomerTlp && <p className="text-red-500 text-sm">{form.formState.errors.nomerTlp.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" {...form.register("password")} className="border-teal-200" />
              {form.formState.errors.password && <p className="text-red-500 text-sm">{form.formState.errors.password.message as string}</p>}
            </div>
            <Button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
              {isSubmitting ? "Memproses..." : "Masuk"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-teal-100 pt-4">
          <Link href="/" className="text-sm text-teal-600 hover:underline">
            Kembali ke Beranda
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
