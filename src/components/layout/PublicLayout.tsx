import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import PublicSidebar from "./PublicSidebar";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="flex gap-6">
          <PublicSidebar />
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PublicLayout;
