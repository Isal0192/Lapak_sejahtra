import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="min-h-screen bg-teal-50 flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-lg">
        <div className="w-20 h-20 bg-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-teal-900">SiPMuT Lapak Sejahtera</h1>
        <p className="text-lg text-teal-700">Aplikasi Manajemen Titip Barang (Konsinyasi) Multi-Tenant Terintegrasi.</p>
        
        <div className="pt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/login" className={cn(buttonVariants({ size: "lg" }), "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md")}>
            Masuk ke Dashboard
          </Link>
          <Link href="/register" className={cn(buttonVariants({ size: "lg", variant: "outline" }), "border-teal-300 text-teal-800 hover:bg-teal-100 shadow-sm")}>
            Daftar Sebagai Owner
          </Link>
        </div>
      </div>
    </div>
  );
}
