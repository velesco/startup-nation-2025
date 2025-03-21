import React from 'react';
import DashboardLayout from '../components/layouts/DashboardLayout';
import ClientList from '../components/ClientList';

const ClientListPage = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <ClientList />
      </div>
    </DashboardLayout>
  );
};

export default ClientListPage;
