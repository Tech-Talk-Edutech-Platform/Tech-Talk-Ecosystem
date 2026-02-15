import { Navigate } from 'react-router-dom';

const RequireOwner = ({ user, children }) => {
  if (!user || user.role !== 'owner') {
    return <Navigate to="/unauthorized" />;
  }
  return children;
};

export default RequireOwner;
