import React, { useState, useEffect } from 'react';
import { 
  FileText, Users, Building, Folder, 
  BarChart3, RefreshCw, ArrowRight,
  TrendingUp, Clock, CheckCircle
} from 'lucide-react';
import { VoucherService } from '../../services/valeProvisional/voucherApi';
import { applicantService } from '../../services/valeProvisional/applicantApi';
import { AreaService } from '../../services/valeProvisional/areaApi';
import { CostCenterService } from '../../services/valeProvisional/costCenterApi';
import { AreaSignatureService } from '../../services/valeProvisional/areaSignatureApi';
import { DocumentService } from '../../services/valeProvisional/documentApi';
import { useNavigate } from 'react-router-dom';
import '../../styles/valeProvisional/dashboard/App.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    vouchers: { total: 0, pending: 0, approved: 0, rejected: 0 },
    applicants: { total: 0, active: 0, inactive: 0 },
    areas: { total: 0, active: 0, inactive: 0 },
    costCenters: { total: 0, active: 0, inactive: 0 },
    signatures: { total: 0, active: 0, inactive: 0 },
    documents: { total: 0, active: 0, inactive: 0 }
  });
  const [recentVouchers, setRecentVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar estadísticas del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [
        vouchersRes, applicantsRes, areasRes, 
        costCentersRes, signaturesRes, documentsRes
      ] = await Promise.all([
        VoucherService.getAll(),
        applicantService.getAll(),
        AreaService.getAll(),
        CostCenterService.getAll(),
        AreaSignatureService.getAll(),
        DocumentService.getAll()
      ]);

      // Procesar estadísticas
      const vouchersData = vouchersRes.data?.data || [];
      const voucherStats = {
        total: vouchersData.length,
        pending: vouchersData.filter(v => (v.STATUS || v.status) === 'P').length,
        approved: vouchersData.filter(v => (v.STATUS || v.status) === 'A').length,
        rejected: vouchersData.filter(v => (v.STATUS || v.status) === 'R').length
      };

      const processData = (data, dataKey = 'data') => {
        const items = data.data?.[dataKey] || data.data || data || [];
        return {
          total: items.length,
          active: items.filter(item => item.STATUS === 'A').length,
          inactive: items.filter(item => item.STATUS === 'I').length
        };
      };

      setStats({
        vouchers: voucherStats,
        applicants: processData(applicantsRes),
        areas: processData(areasRes),
        costCenters: processData(costCentersRes),
        signatures: processData(signaturesRes),
        documents: processData(documentsRes)
      });

      setRecentVouchers(vouchersData.slice(0, 5));

    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <RefreshCw className="loading-spinner" size={32} />
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header del Dashboard */}
      <div className="dashboard-header">
        <div className="dashboard-title">
          <h1>Dashboard Principal</h1>
          <p>Resumen general del sistema de vales provisionales</p>
        </div>
        <button onClick={loadDashboardData} className="refresh-btn">
          <RefreshCw size={18} />
          Actualizar
        </button>
      </div>

      {/* Tarjetas de Estadísticas Rápidas */}
      <div className="stats-grid">
        <StatCard
          icon={<FileText size={24} />}
          title="Total Vales"
          value={stats.vouchers.total}
          color="#3B82F6"
          onClick={() => navigate('/vales')}
        />
        <StatCard
          icon={<Clock size={24} />}
          title="Vales Pendientes"
          value={stats.vouchers.pending}
          color="#F59E0B"
          onClick={() => navigate('/vales')}
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          title="Vales Aprobados"
          value={stats.vouchers.approved}
          color="#10B981"
          onClick={() => navigate('/vales')}
        />
        <StatCard
          icon={<Users size={24} />}
          title="Solicitantes"
          value={stats.applicants.total}
          color="#8B5CF6"
          onClick={() => navigate('/solicitantes')}
        />
      </div>

      {/* Sección de Módulos Rápidos */}
      <div className="quick-access-section">
        <h2 className="section-title">Acceso Rápido</h2>
        <div className="quick-access-grid">
          <QuickAccessCard
            icon={<FileText size={32} />}
            title="Gestión de Vales"
            description="Crear, editar y administrar vales provisionales"
            color="#3B82F6"
            onClick={() => navigate('/vales')}
          />
          <QuickAccessCard
            icon={<Folder size={32} />}
            title="Documentos"
            description="Gestionar documentos de justificación"
            color="#10B981"
            onClick={() => navigate('/documentos')}
          />
          <QuickAccessCard
            icon={<Users size={32} />}
            title="Solicitantes"
            description="Administrar usuarios solicitantes"
            color="#8B5CF6"
            onClick={() => navigate('/solicitantes')}
          />
          <QuickAccessCard
            icon={<Building size={32} />}
            title="Módulos Admin"
            description="Configuración del sistema"
            color="#F59E0B"
            onClick={() => navigate('/administracion')}
          />
        </div>
      </div>

      {/* Vales Recientes */}
      <div className="recent-section">
        <div className="section-header">
          <h2 className="section-title">Vales Recientes</h2>
          <button 
            onClick={() => navigate('/vales')}
            className="view-all-btn"
          >
            Ver todos <ArrowRight size={16} />
          </button>
        </div>
        <div className="recent-vouchers">
          {recentVouchers.length > 0 ? (
            recentVouchers.map(voucher => (
              <RecentVoucherCard key={voucher.ID_VOUCHER} voucher={voucher} />
            ))
          ) : (
            <div className="empty-state">
              <FileText size={48} />
              <p>No hay vales recientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Componentes auxiliares (los mismos que tenías)
const StatCard = ({ icon, title, value, color, onClick }) => (
  <div className="stat-card" onClick={onClick} style={{ borderLeftColor: color }}>
    <div className="stat-icon" style={{ color }}>
      {icon}
    </div>
    <div className="stat-content">
      <h3 className="stat-value">{value}</h3>
      <p className="stat-title">{title}</p>
    </div>
  </div>
);

const QuickAccessCard = ({ icon, title, description, color, onClick }) => (
  <div className="quick-access-card" onClick={onClick}>
    <div className="quick-access-icon" style={{ backgroundColor: color }}>
      {icon}
    </div>
    <div className="quick-access-content">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
    <ArrowRight size={20} className="quick-access-arrow" />
  </div>
);

const RecentVoucherCard = ({ voucher }) => (
  <div className="recent-voucher-card">
    <div className="voucher-header">
      <span className="voucher-code">#{voucher.CORRELATIVE || voucher.correlative}</span>
      <span className={`status-badge status-${voucher.STATUS || voucher.status}`}>
        {getStatusLabel(voucher.STATUS || voucher.status)}
      </span>
    </div>
    <p className="voucher-activity">{voucher.ACTIVITY_TO_PERFORM || voucher.activityToPerform}</p>
    <div className="voucher-footer">
      <span className="voucher-amount">
        S/ {(voucher.AMOUNT || voucher.amount || 0).toLocaleString()}
      </span>
      <span className="voucher-date">
        {new Date(voucher.REQUEST_DATE || voucher.requestDate).toLocaleDateString()}
      </span>
    </div>
  </div>
);

const getStatusLabel = (status) => {
  const statusMap = {
    'P': 'Pendiente',
    'A': 'Aprobado',
    'R': 'Rechazado',
    'J': 'Justificado',
    'C': 'Completado'
  };
  return statusMap[status] || status;
};

export default DashboardPage;