import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import PageShell from './PageShell.jsx';
import { StatsCards, SearchBar, CompaniesTable } from './components/index.jsx';
import CompanyFormModal from './empresas/components/CompanyFormModal.jsx';

const LaboratorioPage = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { pathname } = useLocation();

  const handleNew = () => setModalVisible(true);
  const handleSaved = () => setRefreshKey(k => k + 1);

  // Determine title/subtitle to keep consistency with other module pages
  let title = 'Laboratorio';
  let subtitle = 'Recepción de muestras';
  if (pathname.includes('/empresas') || pathname.endsWith('/empresas')) {
    title = 'Empresas';
    subtitle = 'Listado de empresas';
  }

  return (
    <PageShell title={title} subtitle={subtitle}>
      <div className="p-2 md:p-6 w-full">
        <div className="w-full">
          <StatsCards />
          <SearchBar onNew={handleNew} />
          <CompaniesTable refreshKey={refreshKey} />
          <CompanyFormModal visible={modalVisible} onClose={() => setModalVisible(false)} onSaved={() => { setModalVisible(false); handleSaved(); }} />
        </div>
      </div>
    </PageShell>
  );
};

export default LaboratorioPage;