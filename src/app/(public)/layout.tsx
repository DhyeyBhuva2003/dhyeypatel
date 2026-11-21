import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "sonner";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" richColors />
      <Navbar />
      {/* Adjusted top padding to clear floating navbar without excess gap */}
      <main className="flex-1 flex flex-col pt-14 sm:pt-16 bg-bg-main text-text-main transition-colors duration-250">
        {children}
      </main>
      <Footer />
    </div>
  );
}
