import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

import TenantDetails from '../../components/admin/TenantDetails';

const AdminTenantDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/admin/tenants" replace />;
  }

  return <TenantDetails tenantId={id} />;
};

export default AdminTenantDetailsPage;
