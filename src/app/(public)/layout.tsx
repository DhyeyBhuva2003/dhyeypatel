import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      {/* pt-20 accounts for sticky navbar height */}
      <main className="flex-1 flex flex-col pt-16 bg-white dark:bg-zinc-950 transition-colors duration-300">
        {children}
      </main>
      <Footer />
    </div>
  );
}
