import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Tambahkan import untuk navigasi
import GridShape from "../../components/common/GridShape";
import { Link } from "react-router";
import ThemeTogglerTwo from "../../components/common/ThemeTogglerTwo";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    // Periksa apakah token ada di localStorage
    const token: string | null = localStorage.getItem('token');
    
    // Debugging: Log status token (hapus setelah testing)
    console.log('Token di AuthLayout:', token);

    // Jika token ada, redirect ke /dashboard
    if (token) {
      console.log('Token ada, redirect ke /dashboard');
      navigate('/', { replace: true });
    }
  }, [navigate]); // Dependensi navigate untuk menghindari warning

  return (
    <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
      <div className="relative flex flex-col justify-center w-full h-screen lg:flex-row dark:bg-gray-900 sm:p-0">
        {children}
        <div className="items-center hidden w-full h-full lg:w-1/2 bg-brand-950 dark:bg-white/5 lg:grid">
          <div className="relative flex items-center justify-center z-1">
            {/* <!-- ===== Common Grid Shape Start ===== --> */}
            <GridShape />
            <div className="flex flex-col items-center max-w-xs">
              <Link to="/" className="block mb-4">
                <img
                  width={231}
                  height={48}
                  src="/images/logo/auth-logo.svg"
                  alt="Logo"
                />
              </Link>
              <h1 className="text-center text-gray-400 dark:text-white/60">
                CATATAN ABSENSI
              </h1>
            </div>
          </div>
        </div>
        <div className="fixed z-50 hidden bottom-6 right-6 sm:block">
          <ThemeTogglerTwo />
        </div>
      </div>
    </div>
  );
}