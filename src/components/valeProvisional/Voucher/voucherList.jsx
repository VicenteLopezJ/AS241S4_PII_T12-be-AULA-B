import React, { useState, useEffect } from "react";
import {
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Plus,
  Calendar,
  Loader,
  X,
  User,
  DollarSign,
  Building,
  Activity,
  Calendar as CalendarIcon,
} from "lucide-react";
import { VoucherService } from "../../../services/valeProvisional/voucherApi";
import VoucherForm from "../../valeProvisional/Voucher/voucherForm";
import "../../../styles/valeProvisional/voucher/voucherList.css";
import { CostCenterService } from "../../../services/valeProvisional/costCenterApi";
import { applicantService } from "../../../services/valeProvisional/applicantApi";
import { AreaSignatureService } from "../../../services/valeProvisional/areaSignatureApi";
import { generateVoucherPDF } from '../../../services/valeProvisional/voucherPdfGenerator';
import * as XLSX from 'xlsx';

const VoucherList = ({
  onEdit,
  onView,
  onCreate,
  initialFilter,
  onNavigate,
}) => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(null);

  // Nuevo estado para las estadísticas
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Estados para modales
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  // Estados para filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(initialFilter || "");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadVouchers();
  }, [statusFilter]);

  const loadVouchers = async () => {
    try {
      setLoading(true);
      const response = await VoucherService.getAll();
      const vouchersData = response.data?.data || [];

      let filteredData = vouchersData;
      if (statusFilter) {
        filteredData = vouchersData.filter(
          (voucher) => (voucher.STATUS || voucher.status) === statusFilter
        );
      }

      setVouchers(filteredData);

      // 🔥 CORRECCIÓN: Función mejorada para calcular estadísticas
      const calculateStats = (data) => {
        let total = 0;
        let pending = 0;
        let approved = 0;
        let rejected = 0;

        data.forEach((voucher) => {
          total++;

          // 🔥 MÚLTIPLES FORMAS DE OBTENER EL ESTADO
          const status = (
            voucher.STATUS ||
            voucher.status ||
            voucher.estado ||
            ""
          ).toUpperCase();

          console.log(
            `📊 Voucher ${voucher.ID_VOUCHER || voucher.idVoucher}:`,
            {
              STATUS: voucher.STATUS,
              status: voucher.status,
              estado: voucher.estado,
              finalStatus: status,
            }
          );

          switch (status) {
            case "P":
            case "PENDIENTE":
              pending++;
              break;
            case "A":
            case "APROBADO":
            case "APPROVED":
              approved++;
              break;
            case "R":
            case "RECHAZADO":
            case "REJECTED":
              rejected++;
              break;
            default:
              // Si no tiene estado definido, lo contamos como pendiente
              pending++;
              break;
          }
        });

        return { total, pending, approved, rejected };
      };

      const newStats = calculateStats(vouchersData);

      console.log("📈 Estadísticas calculadas:", newStats);
      console.log("📋 Total de vouchers:", vouchersData.length);
      console.log(
        "🔍 Ejemplo de primer voucher:",
        vouchersData[0]
          ? {
              id: vouchersData[0].ID_VOUCHER || vouchersData[0].idVoucher,
              status: vouchersData[0].STATUS,
              statusMin: vouchersData[0].status,
              allKeys: Object.keys(vouchersData[0]),
            }
          : "No hay vouchers"
      );

      setStats(newStats);
      setError("");
    } catch (error) {
      console.error("Error:", error);
      setError("Error al cargar los vales");
    } finally {
      setLoading(false);
    }
  };

  // ===== FUNCIONES DE EXPORTACIÓN EXCEL =====
  const exportToExcel = () => {
    try {
      console.log('📊 Generando Excel...');

      // Preparar datos para Excel
      const excelData = vouchers.map((voucher) => ({
        'CORRELATIVO': voucher.CORRELATIVE || voucher.correlative || 'N/A',
        'SOLICITANTE': getApplicantName(voucher),
        'ACTIVIDAD': voucher.ACTIVITY_TO_PERFORM || voucher.activityToPerform || 'N/A',
        'MONTO (S/.)': voucher.AMOUNT || voucher.amount || 0,
        'CENTRO COSTO': getCostCenterName(voucher),
        'FECHA SOLICITUD': formatDate(voucher.REQUEST_DATE || voucher.requestDate),
        'FECHA ENTREGA': formatDate(voucher.DELIVERY_DATE || voucher.deliveryDate) || 'No especificada',
        'FECHA JUSTIFICACIÓN': formatDate(voucher.JUSTIFICATION_DATE || voucher.justificationDate) || 'No especificada',
        'ESTADO': getStatusInfo(voucher.STATUS || voucher.status).label,
        'EMAIL': getEmail(voucher),
        'CELULAR': getPhone(voucher),
        'N° DOCUMENTO': getIdentificationNumber(voucher),
        'ÁREA': getAreaSignatureName(voucher)
      }));

      // Crear libro de Excel
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 15 }, // CORRELATIVO
        { wch: 25 }, // SOLICITANTE
        { wch: 40 }, // ACTIVIDAD
        { wch: 12 }, // MONTO
        { wch: 25 }, // CENTRO COSTO
        { wch: 15 }, // FECHA SOLICITUD
        { wch: 15 }, // FECHA ENTREGA
        { wch: 15 }, // FECHA JUSTIFICACIÓN
        { wch: 12 }, // ESTADO
        { wch: 25 }, // EMAIL
        { wch: 15 }, // CELULAR
        { wch: 15 }, // N° DOCUMENTO
        { wch: 20 }  // ÁREA
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Vales Provisionales');

      // Generar archivo y descargar
      const fileName = `vales_provisionales_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Excel generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  };

  const exportFilteredToExcel = () => {
    try {
      const dataToExport = filteredVouchers.length > 0 ? filteredVouchers : vouchers;
      
      console.log(`📊 Exportando ${dataToExport.length} vouchers a Excel...`);

      const excelData = dataToExport.map((voucher) => ({
        'CORRELATIVO': voucher.CORRELATIVE || voucher.correlative || 'N/A',
        'SOLICITANTE': getApplicantName(voucher),
        'ACTIVIDAD': voucher.ACTIVITY_TO_PERFORM || voucher.activityToPerform || 'N/A',
        'MONTO (S/.)': voucher.AMOUNT || voucher.amount || 0,
        'CENTRO COSTO': getCostCenterName(voucher),
        'FECHA SOLICITUD': formatDate(voucher.REQUEST_DATE || voucher.requestDate),
        'FECHA ENTREGA': formatDate(voucher.DELIVERY_DATE || voucher.deliveryDate) || 'No especificada',
        'FECHA JUSTIFICACIÓN': formatDate(voucher.JUSTIFICATION_DATE || voucher.justificationDate) || 'No especificada',
        'ESTADO': getStatusInfo(voucher.STATUS || voucher.status).label,
        'EMAIL': getEmail(voucher),
        'CELULAR': getPhone(voucher),
        'N° DOCUMENTO': getIdentificationNumber(voucher),
        'ÁREA': getAreaSignatureName(voucher)
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(excelData);

      // Ajustar anchos de columnas
      const colWidths = [
        { wch: 15 }, { wch: 25 }, { wch: 40 }, { wch: 12 },
        { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
        { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Vales Provisionales');

      const fileName = `vales_filtrados_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, fileName);

      console.log('✅ Excel con filtros generado exitosamente');
    } catch (error) {
      console.error('❌ Error generando Excel:', error);
      alert('Error al generar el archivo Excel');
    }
  };

  // Función para obtener el nombre de la firma del área
  const getAreaSignatureName = (voucher) => {
    if (!voucher) return "N/A";

    // Si viene información de la firma en el voucher
    if (voucher.areaSignature) {
      const managerName =
        voucher.areaSignature.manager_name ||
        voucher.areaSignature.MANAGER_NAME ||
        "";
      const managerLastname =
        voucher.areaSignature.manager_lastname ||
        voucher.areaSignature.MANAGER_LASTNAME ||
        "";
      return `${managerName} ${managerLastname}`.trim() || "N/A";
    }

    // Si viene el área
    if (voucher.area) {
      return voucher.area;
    }

    // Buscar en datos originales si existe
    if (voucher._originalData?.area) {
      return voucher._originalData.area;
    }

    return "N/A";
  };

  // ===== MANEJO DE MODALES =====
  const openDetailsModal = (voucher) => {
    setSelectedVoucher(voucher);
    setShowDetailsModal(true);
  };

  const openDeleteModal = (voucher) => {
    setSelectedVoucher(voucher);
    setShowDeleteModal(true);
  };

  const openApproveModal = (voucher) => {
    setSelectedVoucher(voucher);
    setShowApproveModal(true);
  };

  const openRejectModal = (voucher) => {
    setSelectedVoucher(voucher);
    setRejectReason("");
    setShowRejectModal(true);
  };

  const openEditModal = async (voucher) => {
    try {
      console.log("🔄 Abriendo modal de edición para:", voucher);

      const voucherId = voucher.ID_VOUCHER || voucher.idVoucher;
      console.log("📋 Obteniendo datos completos del voucher ID:", voucherId);

      const response = await VoucherService.getById(voucherId);
      const fullVoucherData = response.data?.data;

      console.log("🎯 Datos completos obtenidos:", fullVoucherData);

      if (fullVoucherData) {
        // 🔥 SOLUCIÓN: Mapear los nombres a IDs usando las opciones disponibles
        const mappedData = await mapVoucherDataToFormFormat(fullVoucherData);

        setSelectedVoucher(mappedData);
        setShowEditModal(true);
      } else {
        alert("Error: No se pudieron cargar los datos completos del vale");
      }
    } catch (error) {
      console.error("❌ Error cargando datos del voucher:", error);
      alert("Error al cargar los datos del vale para editar");
    }
  };

  // 🔥 NUEVA FUNCIÓN: Mapear datos del voucher al formato que espera el formulario
  const mapVoucherDataToFormFormat = async (voucherData) => {
    try {
      console.log("🔄 Mapeando datos del voucher al formato del formulario...");

      // Cargar las opciones disponibles
      const [costCentersRes, applicantsRes, areaSignaturesRes] =
        await Promise.all([
          CostCenterService.getAll(),
          applicantService.getAll(),
          AreaSignatureService.getAll(),
        ]);

      const costCenters =
        costCentersRes.data?.data || costCentersRes.data || [];
      const applicants = applicantsRes.data?.data || applicantsRes.data || [];
      const areaSignatures =
        areaSignaturesRes.data?.data || areaSignaturesRes.data || [];

      console.log("📊 Opciones disponibles:", {
        costCenters: costCenters.length,
        applicants: applicants.length,
        areaSignatures: areaSignatures.length,
      });

      // Buscar IDs basados en los nombres del voucher
      const findCostCenterId = (costCenterName) => {
        if (!costCenterName) return "";
        const found = costCenters.find(
          (center) =>
            center.cost_center_name === costCenterName ||
            center.COST_CENTER_NAME === costCenterName ||
            center.description === costCenterName
        );
        console.log(
          "🔍 Buscando costCenter:",
          costCenterName,
          "Encontrado:",
          found
        );
        return found ? found.id_cost_center || found.ID_COST_CENTER : "";
      };

      const findApplicantId = (applicantData) => {
        if (!applicantData) return "";

        const applicantFullName = `${applicantData.firstName || ""} ${
          applicantData.lastName || ""
        }`.trim();
        const found = applicants.find((applicant) => {
          const appFullName = `${
            applicant.first_name || applicant.FIRST_NAME || ""
          } ${applicant.last_name || applicant.LAST_NAME || ""}`.trim();
          return (
            appFullName === applicantFullName ||
            applicant.id_applicant === applicantData.idApplicant ||
            applicant.ID_APPLICANT === applicantData.idApplicant
          );
        });
        console.log(
          "🔍 Buscando applicant:",
          applicantFullName,
          "Encontrado:",
          found
        );
        return found ? found.id_applicant || found.ID_APPLICANT : "";
      };

      const findAreaSignatureId = (areaName, voucherData) => {
        console.log("🔍 Buscando areaSignature para área:", areaName);

        try {
          // Estrategia 1: Buscar por ID_AREA del solicitante si está disponible
          if (voucherData.applicant && applicants.length > 0) {
            const applicantId = voucherData.applicant.idApplicant;
            const foundApplicant = applicants.find(
              (app) =>
                app.ID_APPLICANT === applicantId ||
                app.id_applicant === applicantId
            );

            if (foundApplicant && foundApplicant.AREA_ID) {
              const foundSignature = areaSignatures.find(
                (sig) => sig.ID_AREA === foundApplicant.AREA_ID
              );
              if (foundSignature) {
                console.log(
                  "✅ Encontrado por AREA_ID:",
                  foundApplicant.AREA_ID
                );
                return foundSignature.ID_SIGNATURE;
              }
            }
          }

          // Estrategia 2: Usar primera firma disponible
          if (areaSignatures.length > 0) {
            const firstSignature = areaSignatures[0];
            console.log("✅ Usando primera firma disponible");
            return firstSignature.ID_SIGNATURE;
          }
        } catch (error) {
          console.error("❌ Error en findAreaSignatureId:", error);
          // Fallback seguro
          if (areaSignatures.length > 0) {
            return areaSignatures[0].ID_SIGNATURE;
          }
        }

        return "";
      };

      // Crear el objeto mapeado
      const mappedData = {
        // Información básica
        idVoucher: voucherData.idVoucher,
        amount: voucherData.amount,
        activityToPerform: voucherData.activityToPerform,

        // IDs mapeados
        costCenterId: findCostCenterId(voucherData.costCenter),
        applicantId: findApplicantId(voucherData.applicant),
        areaSignaturesId: findAreaSignatureId(voucherData.area, voucherData),

        // Fechas
        requestDate: voucherData.requestDate,
        deliveryDate: voucherData.deliveryDate,
        justificationDate: voucherData.justificationDate,

        // Mantener datos originales para debug
        _originalData: voucherData,
      };

      console.log("✅ Datos mapeados para formulario:", mappedData);
      return mappedData;
    } catch (error) {
      console.error("❌ Error mapeando datos:", error);
      return voucherData; // Si hay error, devolver datos originales
    }
  };

  const closeAllModals = () => {
    setShowDetailsModal(false);
    setShowDeleteModal(false);
    setShowApproveModal(false);
    setShowRejectModal(false);
    setShowEditModal(false);
    setSelectedVoucher(null);
    setRejectReason("");
  };

  const handleSaveVoucher = async (savedVoucher) => {
    try {
      console.log("✅ Vale guardado exitosamente:", savedVoucher);
      alert(
        selectedVoucher
          ? "Vale actualizado exitosamente"
          : "Vale creado exitosamente"
      );
      closeAllModals();
      await loadVouchers();
    } catch (error) {
      console.error("Error en handleSaveVoucher:", error);
      alert("Error al procesar el vale");
    }
  };

  // Función para obtener información del estado
  const getStatusInfo = (status) => {
    const statusMap = {
      P: { label: "Pendiente", color: "#F59E0B", bgColor: "#fef3c7" },
      A: { label: "Aprobado", color: "#10B981", bgColor: "#d1fae5" },
      R: { label: "Rechazado", color: "#EF4444", bgColor: "#fee2e2" },
      J: { label: "Justificado", color: "#8B5CF6", bgColor: "#e0e7ff" },
      C: { label: "Completado", color: "#3B82F6", bgColor: "#dbeafe" },
    };
    return (
      statusMap[status] || {
        label: status,
        color: "#6B7280",
        bgColor: "#f3f4f6",
      }
    );
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("es-ES");
  };

  // Formatear monto - CAMBIO DE USD A PEN
  const formatAmount = (amount) => {
    if (!amount) return "S/ 0.00";
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
    }).format(amount);
  };

  // ===== MANEJO DE ACCIONES =====
  const handleDelete = async () => {
    if (!selectedVoucher) return;

    try {
      setProcessing({ id: selectedVoucher.ID_VOUCHER, action: "delete" });
      await VoucherService.delete(selectedVoucher.ID_VOUCHER);
      await loadVouchers();
      closeAllModals();
      alert("Vale eliminado exitosamente");
    } catch (error) {
      console.error("Error eliminando:", error);
      alert("Error al eliminar el vale");
    } finally {
      setProcessing(null);
    }
  };

  const handleApprove = async () => {
    if (!selectedVoucher) return;

    try {
      const voucherId = selectedVoucher.ID_VOUCHER || selectedVoucher.idVoucher;

      console.log("🔄 Intentando aprobar vale ID:", voucherId);
      console.log("📋 Voucher completo:", selectedVoucher);

      if (!voucherId || voucherId === "undefined") {
        alert("Error: No se pudo obtener el ID del vale");
        return;
      }

      setProcessing({ id: voucherId, action: "approve" });

      await VoucherService.approveVoucher(voucherId);
      await loadVouchers();
      closeAllModals();
      alert("Vale aprobado exitosamente");
    } catch (error) {
      console.error("Error aprobando:", error);
      alert(
        "Error al aprobar el vale: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setProcessing(null);
    }
  };

  const handleDownloadVoucher = async (voucher) => {
    try {
      console.log("📄 Generando PDF para vale:", voucher.ID_VOUCHER);
      
      // Mostrar indicador de carga
      setProcessing({ id: voucher.ID_VOUCHER, action: "download" });
      
      // Generar PDF
      const pdfBlob = await generateVoucherPDF(voucher);
      
      // Crear URL para descarga
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `vale-${voucher.CORRELATIVE || voucher.correlative}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Liberar memoria
      setTimeout(() => URL.revokeObjectURL(pdfUrl), 100);
      
      console.log("✅ PDF generado y descargado exitosamente");
      
    } catch (error) {
      console.error("❌ Error generando PDF:", error);
      alert("Error al generar el PDF del vale");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async () => {
    if (!selectedVoucher || !rejectReason) {
      alert("Por favor ingrese un motivo de rechazo");
      return;
    }

    try {
      const voucherId = selectedVoucher.ID_VOUCHER || selectedVoucher.idVoucher;

      console.log("🔄 Intentando rechazar vale ID:", voucherId);
      console.log("📋 Voucher completo:", selectedVoucher);

      if (!voucherId || voucherId === "undefined") {
        alert("Error: No se pudo obtener el ID del vale");
        return;
      }

      setProcessing({ id: voucherId, action: "reject" });

      await VoucherService.rejectVoucher(voucherId);
      await loadVouchers();
      closeAllModals();
      alert("Vale rechazado exitosamente");
    } catch (error) {
      console.error("Error rechazando:", error);
      alert(
        "Error al rechazar el vale: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setProcessing(null);
    }
  };

  // Helper para verificar si una acción está en progreso
  const isProcessing = (voucherId, action = null) => {
    if (!processing) return false;
    if (action) {
      return processing.id === voucherId && processing.action === action;
    }
    return processing.id === voucherId;
  };

  // Filtrar vales basado en búsqueda
  const filteredVouchers = vouchers.filter((voucher) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const correlative = (
        voucher.CORRELATIVE ||
        voucher.correlative ||
        ""
      ).toLowerCase();
      const activity = (
        voucher.ACTIVITY_TO_PERFORM ||
        voucher.activityToPerform ||
        ""
      ).toLowerCase();
      const applicantName = (
        voucher.applicant?.APPLICANT_NAME || ""
      ).toLowerCase();

      return (
        correlative.includes(searchLower) ||
        activity.includes(searchLower) ||
        applicantName.includes(searchLower)
      );
    }
    return true;
  });

  const getApplicantName = (voucher) => {
    if (!voucher) return "N/A";

    // ✅ Múltiples formas de obtener el nombre
    if (voucher.applicant) {
      // camelCase (como viene del backend)
      const firstName =
        voucher.applicant.firstName || voucher.applicant.first_name || "";

      const lastName =
        voucher.applicant.lastName || voucher.applicant.last_name || "";

      const fullName = `${firstName} ${lastName}`.trim();

      if (fullName) return fullName;
    }

    // ✅ Si no hay objeto applicant, buscar directamente en el voucher
    const directFirstName = voucher.FIRST_NAME || voucher.firstName || "";
    const directLastName = voucher.LAST_NAME || voucher.lastName || "";
    const directFullName = `${directFirstName} ${directLastName}`.trim();

    if (directFullName) return directFullName;

    // ✅ Último recurso
    return "N/A";
  };

  // Obtener nombre del centro de costo
  const getCostCenterName = (voucher) => {
    if (!voucher) return "N/A";

    console.log("🔍 Buscando centro de costo:", {
      costCenter: voucher.costCenter,
      area: voucher.area,
      todosLosCampos: Object.keys(voucher),
    });

    // ✅ El centro de costo viene como STRING en el campo 'costCenter'
    if (voucher.costCenter && typeof voucher.costCenter === "string") {
      return voucher.costCenter;
    }

    // ✅ O podría venir en el campo 'area'
    if (voucher.area && typeof voucher.area === "string") {
      return voucher.area;
    }

    // ✅ Buscar en otros campos posibles
    const possibleFields = [
      "costCenter",
      "area",
      "COST_CENTER_NAME",
      "costCenterName",
      "cost_center_name",
      "AREA_NAME",
    ];

    for (let field of possibleFields) {
      if (voucher[field] && typeof voucher[field] === "string") {
        console.log(`✅ Campo encontrado: ${field} = ${voucher[field]}`);
        return voucher[field];
      }
    }

    console.log("❌ No se encontró centro de costo en ningún campo");
    return "N/A";
  };

  const getIdentificationNumber = (voucher) => {
    if (!voucher) return "N/A";
    
    if (voucher.applicant) {
      return voucher.applicant.identificationNumber || 
             voucher.applicant.IDENTIFICATION_NUMBER || 
             "N/A";
    }
    
    return voucher.IDENTIFICATION_NUMBER || "N/A";
  };

  const getEmail = (voucher) => {
    if (!voucher) return "N/A";
    
    if (voucher.applicant) {
      return voucher.applicant.email || voucher.applicant.EMAIL || "N/A";
    }
    
    return voucher.EMAIL || "N/A";
  };

  const getPhone = (voucher) => {
    if (!voucher) return "N/A";
    
    if (voucher.applicant) {
      return voucher.applicant.phone || voucher.applicant.PHONE || "N/A";
    }
    
    return voucher.PHONE || "N/A";
  };

  if (loading) {
    return (
      <div className="vale-provisional-loading-container">
        <div className="vale-provisional-loading-spinner"></div>
        <p className="vale-provisional-loading-text">Cargando vales...</p>
      </div>
    );
  }

  return (
    <div
      className={`vale-provisional-voucher-list-container ${showEditModal ? "vale-provisional-modal-open" : ""}`}
    >
      {/* TARJETAS DE ESTADÍSTICAS */}
      <div className="vale-provisional-stats-cards-container">
        <div className="vale-provisional-stat-card" onClick={() => setStatusFilter("")}>
          <div className="vale-provisional-stat-content">
            <span className="vale-provisional-stat-number">{stats.total}</span>
            <span className="vale-provisional-stat-label">Total Vales</span>
          </div>
        </div>
        <div className="vale-provisional-stat-card" onClick={() => setStatusFilter("P")}>
          <div className="vale-provisional-stat-content">
            <span className="vale-provisional-stat-number">{stats.pending}</span>
            <span className="vale-provisional-stat-label">Pendientes</span>
          </div>
        </div>
        <div className="vale-provisional-stat-card" onClick={() => setStatusFilter("A")}>
          <div className="vale-provisional-stat-content">
            <span className="vale-provisional-stat-number">{stats.approved}</span>
            <span className="vale-provisional-stat-label">Aprobados</span>
          </div>
        </div>
        <div className="vale-provisional-stat-card" onClick={() => setStatusFilter("R")}>
          <div className="vale-provisional-stat-content">
            <span className="vale-provisional-stat-number">{stats.rejected}</span>
            <span className="vale-provisional-stat-label">Rechazados</span>
          </div>
        </div>
      </div>

      {/* CONTROLES DE BÚSQUEDA Y FILTRO */}
      <div className="vale-provisional-search-controls">
        <div className="vale-provisional-search-input-container">
          <Search size={18} />
          <input
            type="text"
            placeholder="Buscar por correlativo, actividad o solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="vale-provisional-search-input"
          />
        </div>

        <div className="vale-provisional-filters-container">
          <div className="vale-provisional-filter-group">
            <Filter size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="vale-provisional-filter-select"
            >
              <option value="">Todos los estados</option>
              <option value="P">Pendientes</option>
              <option value="A">Aprobados</option>
              <option value="R">Rechazados</option>
              <option value="J">Justificados</option>
              <option value="C">Completados</option>
            </select>
          </div>

          <div className="vale-provisional-filter-group">
            <Calendar size={16} />
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="vale-provisional-filter-select"
            >
              <option value="">Todas las fechas</option>
              <option value="today">Hoy</option>
              <option value="week">Esta semana</option>
              <option value="month">Este mes</option>
            </select>
          </div>

          {/* Botones de exportación a Excel */}
          <button
            onClick={exportToExcel}
            className="vale-provisional-excel-btn"
            title="Exportar todos los vales a Excel"
          >
            📊 Excel Total
          </button>

          <button
            onClick={exportFilteredToExcel}
            className="vale-provisional-excel-btn"
            title="Exportar vales filtrados a Excel"
            disabled={filteredVouchers.length === 0 && vouchers.length > 0}
          >
            📋 Excel Filtrado
          </button>

          <button
            className="vale-provisional-nav-btn"
            onClick={() => onNavigate && onNavigate("tracking")}
          >
            Seguimiento
          </button>

          <button onClick={loadVouchers} className="vale-provisional-refresh-btn">
            Actualizar
          </button>
          <button
            className="vale-provisional-nav-btn vale-provisional-create-voucher-btn"
            onClick={() => onCreate && onCreate()}
          >
            <Plus size={16} />
            Nuevo Vale
          </button>
        </div>
      </div>

      {/* Mensaje de error */}
      {error && (
        <div className="vale-provisional-error-message">
          <span>{error}</span>
          <button onClick={loadVouchers} className="vale-provisional-retry-button">
            Reintentar
          </button>
        </div>
      )}

      {/* Tabla de vales */}
      <div className="vale-provisional-table-container">
        <table className="vale-provisional-vouchers-table">
          <thead>
            <tr>
              <th className="vale-provisional-table-header">CORRELATIVO</th>
              <th className="vale-provisional-table-header">SOLICITANTE</th>
              <th className="vale-provisional-table-header">ACTIVIDAD</th>
              <th className="vale-provisional-table-header">MONTO</th>
              <th className="vale-provisional-table-header">CENTRO COSTO</th>
              <th className="vale-provisional-table-header">FECHA SOLICITUD</th>
              <th className="vale-provisional-table-header">ESTADO</th>
              <th className="vale-provisional-table-header vale-provisional-table-header-actions">ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers.map((voucher) => {
              const statusInfo = getStatusInfo(
                voucher.STATUS || voucher.status
              );
              const status = voucher.STATUS || voucher.status;
              const voucherId = voucher.ID_VOUCHER || voucher.idVoucher;

              return (
                <tr key={voucherId} className="vale-provisional-table-row">
                  <td className="vale-provisional-table-cell">
                    <div className="vale-provisional-correlative-container">
                      <span className="vale-provisional-correlative-code">
                        #{voucher.CORRELATIVE || voucher.correlative}
                      </span>
                    </div>
                  </td>

                  <td className="vale-provisional-table-cell">
                    <div className="vale-provisional-applicant-info">
                      <span className="vale-provisional-applicant-name">
                        {getApplicantName(voucher)}
                      </span>
                    </div>
                  </td>

                  <td className="vale-provisional-table-cell">
                    <div className="vale-provisional-activity-info">
                      <span
                        className="vale-provisional-activity-text"
                        title={
                          voucher.ACTIVITY_TO_PERFORM ||
                          voucher.activityToPerform
                        }
                      >
                        {voucher.ACTIVITY_TO_PERFORM ||
                          voucher.activityToPerform}
                      </span>
                    </div>
                  </td>

                  <td className="vale-provisional-table-cell">
                    <div className="vale-provisional-amount-container">
                      <span className="vale-provisional-amount-value">
                        {formatAmount(voucher.AMOUNT || voucher.amount)}
                      </span>
                    </div>
                  </td>

                  <td className="vale-provisional-table-cell">
                    <div className="vale-provisional-cost-center-info">
                      <span className="vale-provisional-cost-center-name">
                        {getCostCenterName(voucher)}
                      </span>
                    </div>
                  </td>

                  <td className="vale-provisional-table-cell">
                    <div className="vale-provisional-date-text">
                      {formatDate(voucher.REQUEST_DATE || voucher.requestDate)}
                    </div>
                  </td>

                  <td className="vale-provisional-table-cell">
                    <span
                      className="vale-provisional-status-badge"
                      style={{
                        backgroundColor: statusInfo.bgColor,
                        color: statusInfo.color,
                      }}
                    >
                      {statusInfo.label}
                    </span>
                  </td>

                  <td className="vale-provisional-table-cell">
                    <div className="vale-provisional-actions-container">
                      {/* Ver detalles */}
                      <button
                        onClick={() => openDetailsModal(voucher)}
                        className="vale-provisional-action-btn vale-provisional-view-btn"
                        title="Ver detalles"
                      >
                        <Eye size={16} />
                      </button>

                      {/* Editar - Solo disponible para vales pendientes */}
                      {status === "P" && (
                        <button
                          onClick={() => openEditModal(voucher)}
                          className="vale-provisional-action-btn vale-provisional-edit-btn"
                          title="Editar vale"
                        >
                          <Edit size={16} />
                        </button>
                      )}

                      {/* Aprobar - Solo para vales pendientes */}
                      {status === "P" && (
                        <button
                          onClick={() => openApproveModal(voucher)}
                          className="vale-provisional-action-btn vale-provisional-approve-btn"
                          title="Aprobar vale"
                          disabled={isProcessing(voucherId)}
                        >
                          {isProcessing(voucherId, "approve") ? (
                            <Loader size={16} />
                          ) : (
                            <CheckCircle size={16} />
                          )}
                        </button>
                      )}

                      {/* Rechazar - Solo para vales pendientes */}
                      {status === "P" && (
                        <button
                          onClick={() => openRejectModal(voucher)}
                          className="vale-provisional-action-btn vale-provisional-reject-btn"
                          title="Rechazar vale"
                          disabled={isProcessing(voucherId)}
                        >
                          {isProcessing(voucherId, "reject") ? (
                            <Loader size={16} />
                          ) : (
                            <XCircle size={16} />
                          )}
                        </button>
                      )}

                      {/* Eliminar - Solo para vales pendientes */}
                      {status === "P" && (
                        <button
                          onClick={() => openDeleteModal(voucher)}
                          className="vale-provisional-action-btn vale-provisional-delete-btn"
                          title="Eliminar vale"
                          disabled={isProcessing(voucherId)}
                        >
                          {isProcessing(voucherId, "delete") ? (
                            <Loader size={16} />
                          ) : (
                            <Trash2 size={16} />
                          )}
                        </button>
                      )}

                      {/* Descargar PDF */}
                      <button
                        onClick={() => handleDownloadVoucher(voucher)}
                        className="vale-provisional-action-btn vale-provisional-download-btn"
                        title="Descargar PDF del vale"
                        disabled={isProcessing(voucherId, "download")}
                      >
                        {isProcessing(voucherId, "download") ? (
                          <Loader size={16} />
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredVouchers.length === 0 && (
          <div className="vale-provisional-empty-state">
            <FileText size={48} />
            <h3>No hay vales</h3>
            <p>
              {vouchers.length === 0
                ? "No se han registrado vales en el sistema"
                : "No se encontraron vales con los filtros aplicados"}
            </p>
            {vouchers.length === 0 && (
              <button onClick={onCreate} className="vale-provisional-btn-create-empty">
                <Plus size={18} />
                Crear Primer Vale
              </button>
            )}
          </div>
        )}
      </div>

      {/* MODALES */}
      {showEditModal && selectedVoucher && (
        <div className="vale-provisional-modal-overlay" onClick={closeAllModals}>
          <div
            className="vale-provisional-modal-content vale-provisional-large-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="vale-provisional-modal-header">
              <h2>Editar Vale Provisional</h2>
              <button className="vale-provisional-modal-close" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>

            <div className="vale-provisional-modal-body">
              <VoucherForm
                initialData={selectedVoucher}
                onSubmit={handleSaveVoucher}
                onCancel={closeAllModals}
                isModal={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles */}
      {showDetailsModal && selectedVoucher && (
        <div className="vale-provisional-modal-overlay" onClick={closeAllModals}>
          <div className="vale-provisional-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="vale-provisional-modal-header">
              <h2>Detalles Completos del Vale</h2>
              <button className="vale-provisional-modal-close" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>

            <div className="vale-provisional-modal-body">
              {/* Header con correlativo y estado */}
              <div className="vale-provisional-detail-header">
                <div className="vale-provisional-correlative-badge">
                  <FileText size={20} />
                  <span>
                    Vale #
                    {selectedVoucher.CORRELATIVE || selectedVoucher.correlative}
                  </span>
                </div>
                <span
                  className="vale-provisional-status-badge vale-provisional-large-badge"
                  style={{
                    backgroundColor: getStatusInfo(selectedVoucher.STATUS)
                      .bgColor,
                    color: getStatusInfo(selectedVoucher.STATUS).color,
                  }}
                >
                  {getStatusInfo(selectedVoucher.STATUS).label}
                </span>
              </div>

              {/* Información completa en grid */}
              <div className="vale-provisional-details-grid-improved">
                {/* Sección 1: Información del Solicitante */}
                <div className="vale-provisional-detail-section">
                  <h3 className="vale-provisional-section-title">
                    <User size={18} />
                    Información del Solicitante
                  </h3>
                  <div className="vale-provisional-detail-group">
                    <div className="vale-provisional-detail-field">
                      <label>Nombre completo</label>
                      <span className="vale-provisional-detail-value">
                        {getApplicantName(selectedVoucher)}
                      </span>
                    </div>
                    <div className="vale-provisional-detail-field">
                      <label>Email</label>
                      <span className="vale-provisional-detail-value">
                        {selectedVoucher.applicant?.email ||
                          selectedVoucher.applicant?.EMAIL ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="vale-provisional-detail-field">
                      <label>Teléfono</label>
                      <span className="vale-provisional-detail-value">
                        {selectedVoucher.applicant?.phone ||
                          selectedVoucher.applicant?.PHONE ||
                          "N/A"}
                      </span>
                    </div>
                    <div className="vale-provisional-detail-field">
                      <label>N° Identificación</label>
                      <span className="vale-provisional-detail-value">
                        {selectedVoucher.applicant?.identificationNumber ||
                          selectedVoucher.applicant?.IDENTIFICATION_NUMBER ||
                          "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sección 2: Detalles del Vale */}
                <div className="vale-provisional-detail-section">
                  <h3 className="vale-provisional-section-title">
                    <DollarSign size={18} />
                    Detalles del Vale
                  </h3>
                  <div className="vale-provisional-detail-group">
                    <div className="vale-provisional-detail-field">
                      <label>Monto solicitado</label>
                      <span className="vale-provisional-detail-value vale-provisional-amount-large">
                        {formatAmount(
                          selectedVoucher.AMOUNT || selectedVoucher.amount
                        )}
                      </span>
                    </div>
                    <div className="vale-provisional-detail-field">
                      <label>Centro de Costo</label>
                      <span className="vale-provisional-detail-value">
                        {getCostCenterName(selectedVoucher)}
                      </span>
                    </div>
                    <div className="vale-provisional-detail-field">
                      <label>Firma del Área</label>
                      <span className="vale-provisional-detail-value">
                        {getAreaSignatureName(selectedVoucher)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sección 3: Fechas */}
                <div className="vale-provisional-detail-section">
                  <h3 className="vale-provisional-section-title">
                    <Calendar size={18} />
                    Fechas
                  </h3>
                  <div className="vale-provisional-detail-group">
                    <div className="vale-provisional-detail-field">
                      <label>Fecha de Solicitud</label>
                      <span className="vale-provisional-detail-value">
                        {formatDate(
                          selectedVoucher.REQUEST_DATE ||
                            selectedVoucher.requestDate
                        )}
                      </span>
                    </div>
                    <div className="vale-provisional-detail-field">
                      <label>Fecha de Entrega</label>
                      <span className="vale-provisional-detail-value">
                        {formatDate(
                          selectedVoucher.DELIVERY_DATE ||
                            selectedVoucher.deliveryDate
                        ) || "No especificada"}
                      </span>
                    </div>
                    <div className="vale-provisional-detail-field">
                      <label>Fecha de Justificación</label>
                      <span className="vale-provisional-detail-value">
                        {formatDate(
                          selectedVoucher.JUSTIFICATION_DATE ||
                            selectedVoucher.justificationDate
                        ) || "No especificada"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Sección 4: Actividad */}
                <div className="vale-provisional-detail-section vale-provisional-full-width">
                  <h3 className="vale-provisional-section-title">
                    <Activity size={18} />
                    Actividad a Realizar
                  </h3>
                  <div className="vale-provisional-activity-content">
                    <p className="vale-provisional-activity-description">
                      {selectedVoucher.ACTIVITY_TO_PERFORM ||
                        selectedVoucher.activityToPerform}
                    </p>
                  </div>
                </div>

                {/* Sección 5: Información adicional */}
                {(selectedVoucher.JUSTIFICATION ||
                  selectedVoucher.OBSERVATIONS ||
                  selectedVoucher.REASON) && (
                  <div className="vale-provisional-detail-section vale-provisional-full-width">
                    <h3 className="vale-provisional-section-title">
                      <FileText size={18} />
                      Información Adicional
                    </h3>
                    <div className="vale-provisional-detail-group">
                      {selectedVoucher.JUSTIFICATION && (
                        <div className="vale-provisional-detail-field">
                          <label>Justificación</label>
                          <span className="vale-provisional-detail-value">
                            {selectedVoucher.JUSTIFICATION}
                          </span>
                        </div>
                      )}
                      {selectedVoucher.OBSERVATIONS && (
                        <div className="vale-provisional-detail-field">
                          <label>Observaciones</label>
                          <span className="vale-provisional-detail-value">
                            {selectedVoucher.OBSERVATIONS}
                          </span>
                        </div>
                      )}
                      {selectedVoucher.REASON && (
                        <div className="vale-provisional-detail-field">
                          <label>Motivo</label>
                          <span className="vale-provisional-detail-value">
                            {selectedVoucher.REASON}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sección 6: Documentos (si existen) */}
                {(selectedVoucher.APPLICANT_SIGNATURE ||
                  selectedVoucher.SUPPORTING_DOCUMENT) && (
                  <div className="vale-provisional-detail-section vale-provisional-full-width">
                    <h3 className="vale-provisional-section-title">
                      <FileText size={18} />
                      Documentos Adjuntos
                    </h3>
                    <div className="vale-provisional-detail-group">
                      {selectedVoucher.APPLICANT_SIGNATURE && (
                        <div className="vale-provisional-detail-field">
                          <label>Firma del Solicitante</label>
                          <span className="vale-provisional-detail-value">
                            {selectedVoucher.APPLICANT_SIGNATURE === true
                              ? "Sí"
                              : "No"}
                          </span>
                        </div>
                      )}
                      {selectedVoucher.SUPPORTING_DOCUMENT && (
                        <div className="vale-provisional-detail-field">
                          <label>Documento de Soporte</label>
                          <span className="vale-provisional-detail-value">
                            {selectedVoucher.SUPPORTING_DOCUMENT === true
                              ? "Adjuntado"
                              : "No adjuntado"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="vale-provisional-modal-actions">
              <button onClick={closeAllModals} className="vale-provisional-btn-secondary">
                Cerrar
              </button>
              <button
                onClick={() => handleDownloadVoucher(selectedVoucher)}
                className="vale-provisional-btn-primary"
              >
                <Download size={16} />
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Aprobar */}
      {showApproveModal && selectedVoucher && (
        <div className="vale-provisional-modal-overlay" onClick={closeAllModals}>
          <div className="vale-provisional-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="vale-provisional-modal-header">
              <h2>Confirmar Aprobación</h2>
              <button className="vale-provisional-modal-close" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>

            <div className="vale-provisional-modal-body">
              <div className="vale-provisional-approve-content">
                <CheckCircle size={48} className="vale-provisional-approve-icon" />
                <p>
                  ¿Está seguro de aprobar el vale{" "}
                  <strong>#{selectedVoucher.CORRELATIVE}</strong>?
                </p>
                <p className="vale-provisional-modal-subtitle">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="vale-provisional-modal-actions">
              <button onClick={closeAllModals} className="vale-provisional-btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleApprove}
                className="vale-provisional-btn-primary"
                disabled={isProcessing(selectedVoucher.ID_VOUCHER)}
              >
                {isProcessing(selectedVoucher.ID_VOUCHER, "approve") ? (
                  <>
                    <Loader size={16} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Sí, Aprobar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Rechazar */}
      {showRejectModal && selectedVoucher && (
        <div className="vale-provisional-modal-overlay" onClick={closeAllModals}>
          <div className="vale-provisional-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="vale-provisional-modal-header">
              <h2>Confirmar Rechazo</h2>
              <button className="vale-provisional-modal-close" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>

            <div className="vale-provisional-modal-body">
              <div className="vale-provisional-reject-content">
                <XCircle size={48} className="vale-provisional-reject-icon" />
                <p>
                  ¿Está seguro de rechazar el vale{" "}
                  <strong>#{selectedVoucher.CORRELATIVE}</strong>?
                </p>

                <div className="vale-provisional-reason-input">
                  <label>Motivo del rechazo:</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ingrese el motivo del rechazo..."
                    rows="3"
                  />
                </div>
              </div>
            </div>

            <div className="vale-provisional-modal-actions">
              <button onClick={closeAllModals} className="vale-provisional-btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleReject}
                className="vale-provisional-btn-danger"
                disabled={
                  !rejectReason.trim() ||
                  isProcessing(selectedVoucher.ID_VOUCHER)
                }
              >
                {isProcessing(selectedVoucher.ID_VOUCHER, "reject") ? (
                  <>
                    <Loader size={16} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <XCircle size={16} />
                    Sí, Rechazar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Eliminar */}
      {showDeleteModal && selectedVoucher && (
        <div className="vale-provisional-modal-overlay" onClick={closeAllModals}>
          <div className="vale-provisional-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="vale-provisional-modal-header">
              <h2>Confirmar Eliminación</h2>
              <button className="vale-provisional-modal-close" onClick={closeAllModals}>
                <X size={20} />
              </button>
            </div>

            <div className="vale-provisional-modal-body">
              <div className="vale-provisional-delete-content">
                <Trash2 size={48} className="vale-provisional-delete-icon" />
                <p>
                  ¿Está seguro de eliminar el vale{" "}
                  <strong>#{selectedVoucher.CORRELATIVE}</strong>?
                </p>
                <p className="vale-provisional-modal-subtitle">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="vale-provisional-modal-actions">
              <button onClick={closeAllModals} className="vale-provisional-btn-secondary">
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="vale-provisional-btn-danger"
                disabled={isProcessing(selectedVoucher.ID_VOUCHER)}
              >
                {isProcessing(selectedVoucher.ID_VOUCHER, "delete") ? (
                  <>
                    <Loader size={16} />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Sí, Eliminar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoucherList;