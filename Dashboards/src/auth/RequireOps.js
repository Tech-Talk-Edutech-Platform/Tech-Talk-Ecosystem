import { Navigate } from 'react-router-dom';

const RequireOps = ({ user, children }) => {
  if (!user || user.role !== 'ops') {
    return <Navigate to="/unauthorized" />;
  }
  return children;
};

export default RequireOps;
