import { ReactNode, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiFetch, clearAuthToken, getAuthToken, setUnauthorizedHandler } from "@/lib/apiClient";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const redirectToLogin = () => {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`, { replace: true });
    };

    const token = getAuthToken();
    if (!token) {
      redirectToLogin();
      setIsChecking(false);
      return;
    }

    setUnauthorizedHandler(() => redirectToLogin);

    const verify = async () => {
      try {
        await apiFetch("/auth/me");
      } catch (error) {
        clearAuthToken();
        redirectToLogin();
      } finally {
        setIsChecking(false);
      }
    };

    verify();

    return () => setUnauthorizedHandler(() => {});
  }, [location.pathname, location.search, navigate]);

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30 text-muted-foreground">
        Dang kiem tra phien dang nhap...
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
