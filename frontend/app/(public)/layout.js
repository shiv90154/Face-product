import Header from "@/components/Header";
import Footer from "@/components/footer";

export default function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main className="grow">{children}</main>
      <Footer />
    </>
  );
}