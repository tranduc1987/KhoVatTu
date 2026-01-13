import { Navigate } from "react-router-dom";

// Redirect to home page with public layout
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
