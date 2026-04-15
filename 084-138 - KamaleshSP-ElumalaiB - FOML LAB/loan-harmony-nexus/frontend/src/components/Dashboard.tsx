
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  if (!user || !user.currentRole) {
    return <Navigate to="/role-selection" replace />;
  }

  if (user.currentRole === 'lender') {
    return <Navigate to="/lender" replace />;
  } else if (user.currentRole === 'borrower') {
    return <Navigate to="/borrower" replace />;
  } else if (user.currentRole === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return null;
};

export default Dashboard;
