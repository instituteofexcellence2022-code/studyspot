import React from 'react';
import { useParams, Navigate } from 'react-router-dom';

import LibraryDetails from '../../components/library/LibraryDetails';

const LibraryDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  if (!id) {
    return <Navigate to="/libraries" replace />;
  }

  return <LibraryDetails libraryId={id} />;
};

export default LibraryDetailsPage;
