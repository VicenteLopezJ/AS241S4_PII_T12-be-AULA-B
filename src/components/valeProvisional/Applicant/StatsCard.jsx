import React from 'react';
import { TrendingUp, TrendingDown, Users, FileText, UserCheck, UserX } from 'lucide-react';
import '../../../styles/valeProvisional/Applicant/applicantStatsCard.css';

const ApplicantStatsCard = ({ 
  title, 
  value, 
  icon, 
  variant = "default", 
  loading = false,
  trend = null,
  subtitle = null,
  onClick 
}) => {
  // Iconos por defecto basados en el variant
  const getDefaultIcon = () => {
    switch (variant) {
      case 'primary':
        return <Users size={24} />;
      case 'success':
        return <UserCheck size={24} />;
      case 'warning':
        return <UserX size={24} />;
      case 'danger':
        return <FileText size={24} />;
      default:
        return <Users size={24} />;
    }
  };

  // Icono de tendencia
  const getTrendIcon = () => {
    if (trend === 'up') {
      return <TrendingUp size={16} />;
    } else if (trend === 'down') {
      return <TrendingDown size={16} />;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="applicant-stats-card applicant-stats-card--loading">
        <div className="applicant-stats-card__skeleton-icon"></div>
        <div className="applicant-stats-card__skeleton-content">
          <div className="applicant-stats-card__skeleton-value"></div>
          <div className="applicant-stats-card__skeleton-title"></div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`applicant-stats-card applicant-stats-card--${variant} ${onClick ? 'applicant-stats-card--clickable' : ''}`}
      onClick={onClick}
    >
      <div className="applicant-stats-card__content">
        <div className="applicant-stats-card__header">
          <div className="applicant-stats-card__icon-container">
            <div className="applicant-stats-card__icon">
              {icon || getDefaultIcon()}
            </div>
          </div>
          
          {trend && (
            <div className={`applicant-stats-card__trend applicant-stats-card__trend--${trend}`}>
              {getTrendIcon()}
            </div>
          )}
        </div>

        <div className="applicant-stats-card__main">
          <h3 className="applicant-stats-card__value">{value}</h3>
          {subtitle && (
            <span className="applicant-stats-card__subtitle">{subtitle}</span>
          )}
        </div>

        <p className="applicant-stats-card__title">{title}</p>
      </div>

      {/* Efecto de decoración */}
      <div className="applicant-stats-card__decoration"></div>
      
      {/* Efecto de hover */}
      <div className="applicant-stats-card__hover-effect"></div>
    </div>
  );
};

export default ApplicantStatsCard;