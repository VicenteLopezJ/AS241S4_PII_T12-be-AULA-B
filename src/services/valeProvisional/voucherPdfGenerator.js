// services/voucherPdfGenerator.js
import jsPDF from 'jspdf';
import { AreaSignatureService } from './areaSignatureApi';

export const generateVoucherPDF = async (voucher) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Crear nuevo PDF en orientación vertical
      const pdf = new jsPDF();
      
      // Configuración
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 10;
      let yPosition = margin;

      // Función para agregar texto con estilos
      const addText = (text, x, y, styles = {}) => {
        pdf.setFontSize(styles.fontSize || 10);
        pdf.setFont(styles.font || 'helvetica', styles.fontStyle || 'normal');
        pdf.setTextColor(styles.color || 0);
        pdf.text(text, x, y);
      };

      // Función para dibujar línea
      const drawLine = (y) => {
        pdf.setDrawColor(0);
        pdf.setLineWidth(0.5);
        pdf.line(margin, y, pageWidth - margin, y);
      };

      // Función para centrar texto
      const centerText = (text, y, styles = {}) => {
        const textWidth = pdf.getStringUnitWidth(text) * (styles.fontSize || 10) / pdf.internal.scaleFactor;
        const x = (pageWidth - textWidth) / 2;
        addText(text, x, y, styles);
      };

      // Función para alinear a la derecha
      const rightText = (text, y, styles = {}) => {
        const textWidth = pdf.getStringUnitWidth(text) * (styles.fontSize || 10) / pdf.internal.scaleFactor;
        const x = pageWidth - margin - textWidth;
        addText(text, x, y, styles);
      };

      // ===== ENCABEZADO =====
      
      // Empresa - CENTRADO
      centerText('EMPRESA XYZ S.A.', yPosition, { 
        fontSize: 14, 
        fontStyle: 'bold'
      });
      yPosition += 6;
      
      // RUC - CENTRADO
      centerText('R.U.C. 20120055128', yPosition, { 
        fontSize: 10 
      });
      yPosition += 6;
      
      // Correlativo - CENTRADO
      centerText(`Correlativo: ${voucher.CORRELATIVE || voucher.correlative || 'N/A'}`, yPosition, { 
        fontSize: 10,
        fontStyle: 'bold' 
      });
      yPosition += 8;
      
      // Estado - CENTRADO
      const statusText = getStatusText(voucher.STATUS || voucher.status);
      centerText(statusText, yPosition, { 
        fontSize: 12,
        fontStyle: 'bold',
        color: getStatusColor(voucher.STATUS || voucher.status)
      });
      yPosition += 10;
      
      // Línea separadora
      drawLine(yPosition);
      yPosition += 8;
      
      // Dirección - CENTRADO
      centerText('Carretera Ant. Panamericana Sur Km. 144 - San Vicente Cañete - Lima', yPosition, { 
        fontSize: 9 
      });
      yPosition += 12;
      
      // ===== TÍTULO PRINCIPAL =====
      centerText('VALE PROVISIONAL', yPosition, { 
        fontSize: 16, 
        fontStyle: 'bold'
      });
      yPosition += 8;
      
      // Importe - CENTRADO
      const amount = formatAmount(voucher.AMOUNT || voucher.amount);
      centerText(`Importe ${amount}`, yPosition, { 
        fontSize: 14,
        fontStyle: 'bold'
      });
      yPosition += 18;
      
      // ===== INFORMACIÓN PRINCIPAL =====
      
      // Fechas (en dos columnas)
      const fechaEntrega = formatDate(voucher.DELIVERY_DATE || voucher.deliveryDate) || 'No especificada';
      const fechaJustificacion = formatDate(voucher.JUSTIFICATION_DATE || voucher.justificationDate) || 'No especificada';
      
      addText('Fecha entrega de Dinero:', margin, yPosition, { fontSize: 10 });
      addText(fechaEntrega, margin + 43, yPosition, { fontSize: 10, fontStyle: 'bold' });
      
      addText('Fecha de Justificación:', pageWidth / 2, yPosition, { fontSize: 10 });
      addText(fechaJustificacion, pageWidth / 2 + 40, yPosition, { fontSize: 10, fontStyle: 'bold' });
      yPosition += 8;
      
      // Área y Centro de Costos
      const area = getAreaSignatureName(voucher);
      const centroCostos = getCostCenterName(voucher);
      
      addText('Área:', margin, yPosition, { fontSize: 10 });
      addText(area, margin + 10, yPosition, { fontSize: 10, fontStyle: 'bold' });
      
      rightText(`Centro de Costos: ${centroCostos}`, yPosition, { fontSize: 10 });
      yPosition += 8;
      
      // Actividad
      const actividad = voucher.ACTIVITY_TO_PERFORM || voucher.activityToPerform || 'No especificada';
      addText('Actividad:', margin, yPosition, { fontSize: 10 });
      // Manejar actividad larga
      const splitActividad = pdf.splitTextToSize(actividad, pageWidth - margin - 20);
      pdf.text(splitActividad, margin + 28, yPosition);
      yPosition += (splitActividad.length * 4) + 12;
      
      // Línea separadora
      drawLine(yPosition);
      yPosition += 12;
      
      // ===== INFORMACIÓN DEL SOLICITANTE =====
      
      // Solicitante
      const solicitante = getApplicantName(voucher);
      addText('Solicitante:', margin, yPosition, { fontSize: 10 });
      addText(solicitante, margin + 32, yPosition, { fontSize: 10, fontStyle: 'bold' });
      yPosition += 6;
      
      // Nº Documento
      const identificacion = getIdentificationNumber(voucher);
      addText('NºDocumento:', margin, yPosition, { fontSize: 10 });
      addText(identificacion, margin + 37, yPosition, { fontSize: 10, fontStyle: 'bold' });
      yPosition += 6;
      
      // Correo
      const correo = getEmail(voucher);
      addText('Correo:', margin, yPosition, { fontSize: 10 });
      addText(correo, margin + 22, yPosition, { fontSize: 10, fontStyle: 'bold' });
      yPosition += 6;
      
      // Celular
      const celular = getPhone(voucher);
      addText('Celular:', margin, yPosition, { fontSize: 10 });
      addText(celular, margin + 24, yPosition, { fontSize: 10, fontStyle: 'bold' });
      yPosition += 15;
      
      // Línea separadora FINAL de información del solicitante
      drawLine(yPosition);
      yPosition += 15;
      
      // ===== OBTENER FIRMA DEL ADMINISTRADOR =====
      let adminSignature = null;
      try {
        adminSignature = await getAdminSignature(voucher);
        console.log('✅ Firma del administrador obtenida:', adminSignature);
      } catch (error) {
        console.warn('⚠️ No se pudo obtener la firma del administrador:', error);
      }
      
      // ===== SECCIÓN DE FIRMA DEL ADMINISTRADOR - SEPARADA CORRECTAMENTE =====
      
// ===== SECCIÓN DE FIRMA DEL ADMINISTRADOR - SEPARADA CORRECTAMENTE =====

// ESPACIO ADICIONAL para separar claramente la sección de firma
yPosition += 0;

const signatureSectionY = yPosition;
const signatureHeight = 18;

// Insertar firma del administrador SI EXISTE
if (adminSignature && adminSignature.signatureUrl) {
  try {
    console.log('🔄 Intentando insertar firma:', adminSignature.signatureUrl);
    
    // 1. IMAGEN DE LA FIRMA (arriba)
    await addSignatureImage(pdf, adminSignature.signatureUrl, pageWidth / 2 - 25, signatureSectionY, signatureHeight);
    console.log('✅ Firma del administrador insertada en el PDF');
    
    // 2. LÍNEA (debajo de la imagen)
    const lineY = signatureSectionY + signatureHeight + 5;
    pdf.setDrawColor(0);
    pdf.setLineWidth(0.5);
    pdf.line(pageWidth / 2 - 30, lineY, pageWidth / 2 + 20, lineY);
    
    // 3. TEXTO "Firma del administrador" (debajo de la línea)
    centerText('Firma del administrador', pageWidth / 1, lineY + 1, { 
      fontSize: 50,
      fontStyle: 'bold' 
    });
    
    yPosition = lineY + 20;
    
  } catch (error) {
    console.warn('⚠️ No se pudo insertar la firma del administrador:', error);
    // Mostrar mensaje de que no se pudo cargar la firma
    centerText('FIRMA NO DISPONIBLE', signatureSectionY + 10, {
      fontSize: 8,
      color: 150,
      fontStyle: 'italic'
    });
    
    yPosition = signatureSectionY + 25;
  }
} else {
  console.log('ℹ️ No hay firma disponible para insertar');
  
  // 2. LÍNEA
  const lineY = signatureSectionY + 8;
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  pdf.line(pageWidth / 2 - 40, lineY, pageWidth / 2 + 40, lineY);
  
  
  centerText('FIRMA NO REGISTRADA', lineY + 18, {
    fontSize: 8,
    color: 150,
    fontStyle: 'italic'
  });
  
  yPosition = lineY + 80;
}
      
      // ===== PIE DE PÁGINA =====
      
      // Línea separadora final
      drawLine(yPosition);
      yPosition += 8;
      
      // Datos de firma encryptada
      if (voucher.APPLICANT_SIGNATURE) {
        addText(`Datos: ${generateSignatureHash(voucher)}`, margin, yPosition, { 
          fontSize: 8,
          color: 100 
        });
      }
      
      // Fecha de generación
      const fechaGeneracion = new Date().toLocaleDateString('es-ES');
      rightText(`Generado el: ${fechaGeneracion}`, yPosition, { 
        fontSize: 8,
        color: 100 
      });

      // Generar el PDF
      const pdfBlob = pdf.output('blob');
      resolve(pdfBlob);
      
    } catch (error) {
      console.error('❌ Error generando PDF:', error);
      reject(error);
    }
  });
};


// ===== FUNCIONES PARA OBTENER FIRMA DEL ADMINISTRADOR =====

const getAdminSignature = async (voucher) => {
  try {
    console.log('🔍 Buscando firma del administrador para el voucher:', voucher);
    
    // Obtener todas las firmas activas
    const response = await AreaSignatureService.getAll();
    const signatures = response.data?.data || response.data || [];
    
    console.log('📋 Total firmas en el sistema:', signatures.length);
    
    // Mostrar información de debug de las firmas disponibles
    const activeSignatures = signatures.filter(sig => sig.STATUS === 'A');
    console.log('🏢 Firmas activas disponibles:', activeSignatures.map(sig => ({
      ID: sig.ID_SIGNATURE,
      AREA: sig.AREA,
      ID_AREA: sig.ID_AREA,
      STATUS: sig.STATUS,
      SIGNATURE_URL: sig.SIGNATURE_URL ? 'SI' : 'NO'
    })));
    
    // Obtener el nombre del área del voucher
    const voucherAreaName = voucher.AREA || voucher.area || "GASTOS ADMINISTRATIVOS";
    console.log('🎯 Buscando firma para área:', voucherAreaName);
    
    // ESTRATEGIA 1: Buscar por nombre exacto del área
    let matchingSignature = signatures.find(sig => {
      const signatureAreaName = sig.AREA || sig.area;
      const isMatch = signatureAreaName === voucherAreaName && sig.STATUS === 'A';
      if (isMatch) {
        console.log('✅ Coincidencia exacta encontrada:', signatureAreaName);
      }
      return isMatch;
    });
    
    // ESTRATEGIA 2: Si no hay coincidencia exacta, usar cualquier firma activa
    if (!matchingSignature) {
      console.log('🔍 No hay coincidencia exacta, buscando primera firma activa');
      matchingSignature = signatures.find(sig => sig.STATUS === 'A');
    }
    
    // ESTRATEGIA 3: Si no hay firmas activas, usar cualquier firma
    if (!matchingSignature && signatures.length > 0) {
      console.log('🔍 No hay firmas activas, usando primera firma disponible');
      matchingSignature = signatures[0];
    }
    
    // ESTRATEGIA 4: Si no hay firmas en absoluto, crear una firma por defecto
    if (!matchingSignature) {
      console.log('⚠️ No hay firmas registradas en el sistema, usando firma por defecto');
      return getDefaultSignature();
    }
    
    console.log('✅ Firma encontrada:', matchingSignature);
    return {
      signatureUrl: matchingSignature.SIGNATURE_URL || matchingSignature.signatureUrl,
      managerName: matchingSignature.MANAGER_NAME || matchingSignature.managerName,
      managerLastname: matchingSignature.MANAGER_LASTNAME || matchingSignature.managerLastname,
      area: matchingSignature.AREA || matchingSignature.area,
      ID_AREA: matchingSignature.ID_AREA || matchingSignature.areaId
    };
    
  } catch (error) {
    console.error('❌ Error obteniendo firma del administrador:', error);
    // En caso de error, usar firma por defecto
    return getDefaultSignature();
  }
};

// Firma por defecto cuando no hay firmas en el sistema
const getDefaultSignature = () => {
  console.log('🔄 Usando firma por defecto');
  return {
    signatureUrl: '/images/firma-default.png', // Ruta a una imagen por defecto
    managerName: 'Administrador',
    managerLastname: 'Sistema',
    area: 'ADMINISTRACIÓN',
    ID_AREA: 0
  };
};

const addSignatureImage = (pdf, imageUrl, x, y, height) => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar que la URL sea válida
      if (!imageUrl || typeof imageUrl !== 'string') {
        console.warn('⚠️ URL de firma inválida:', imageUrl);
        reject(new Error('URL de firma inválida'));
        return;
      }

      console.log('🔄 Preparando para cargar imagen desde:', imageUrl);

      // Crear imagen
      const img = new Image();
      
      // Configurar CORS - importante para imágenes externas
      img.crossOrigin = 'Anonymous';
      
      img.onload = function() {
        try {
          console.log('✅ Imagen cargada correctamente:', {
            width: img.width,
            height: img.height,
            src: img.src
          });
          
          // Determinar el formato de la imagen basado en la URL o extensión
          let format = 'JPEG'; // por defecto
          const urlLower = imageUrl.toLowerCase();
          
          if (urlLower.includes('.png')) {
            format = 'PNG';
          } else if (urlLower.includes('.gif')) {
            format = 'GIF';
          } else if (urlLower.includes('.webp')) {
            format = 'WEBP';
          }
          
          console.log('🎨 Formato detectado:', format);
          
          // Calcular dimensiones manteniendo proporción
          const width = (img.width * height) / img.height;
          
          console.log('📐 Dimensiones calculadas:', {
            original: `${img.width}x${img.height}`,
            nueva: `${width.toFixed(2)}x${height}`,
            posicion: `x:${x}, y:${y}`
          });
          
          // Agregar imagen al PDF con el formato correcto
          pdf.addImage(img, format, x, y, width, height);
          console.log('✅ Firma insertada exitosamente en el PDF');
          resolve();
          
        } catch (error) {
          console.error('❌ Error agregando imagen al PDF:', error);
          reject(error);
        }
      };
      
      img.onerror = function(event) {
        console.error('❌ Error cargando imagen de firma:', {
          url: imageUrl,
          event: event
        });
        reject(new Error(`No se pudo cargar la imagen de firma: ${imageUrl}`));
      };
      
      // Configurar timeout para evitar carga infinita
      const timeout = setTimeout(() => {
        console.error('⏰ Timeout cargando imagen:', imageUrl);
        reject(new Error('Timeout cargando imagen de firma'));
      }, 10000); // 10 segundos
      
      const originalOnLoad = img.onload;
      img.onload = function() {
        clearTimeout(timeout);
        originalOnLoad.call(this);
      };
      
      // Agregar timestamp para evitar cache
      const timestamp = new Date().getTime();
      let finalUrl = imageUrl;
      
      if (imageUrl.startsWith('http') || imageUrl.startsWith('/') || imageUrl.startsWith('./')) {
        finalUrl = imageUrl.includes('?') 
          ? `${imageUrl}&t=${timestamp}`
          : `${imageUrl}?t=${timestamp}`;
      }
      
      console.log('🌐 Cargando imagen desde URL final:', finalUrl);
      img.src = finalUrl;
      
    } catch (error) {
      console.error('❌ Error inesperado en addSignatureImage:', error);
      reject(error);
    }
  });
};

// ===== FUNCIONES AUXILIARES =====

const getStatusText = (status) => {
  const statusMap = {
    'P': 'PENDIENTE',
    'A': 'APROBADO', 
    'R': 'RECHAZADO',
    'J': 'JUSTIFICADO',
    'C': 'COMPLETADO'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    'P': 255,  // Rojo para pendiente
    'A': 0,    // Negro para aprobado
    'R': 255,  // Rojo para rechazado
    'J': 0,    // Negro para justificado
    'C': 0     // Negro para completado
  };
  return colorMap[status] || 0;
};

const formatAmount = (amount) => {
  if (!amount) return "S/. 0.00";
  return `S/. ${new Intl.NumberFormat('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  return new Date(dateString).toLocaleDateString('es-ES');
};

const getApplicantName = (voucher) => {
  if (!voucher) return "N/A";
  
  if (voucher.applicant) {
    const firstName = voucher.applicant.firstName || voucher.applicant.first_name || "";
    const lastName = voucher.applicant.lastName || voucher.applicant.last_name || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  }
  
  const directFirstName = voucher.FIRST_NAME || voucher.firstName || "";
  const directLastName = voucher.LAST_NAME || voucher.lastName || "";
  const directFullName = `${directFirstName} ${directLastName}`.trim();
  
  return directFullName || "N/A";
};

const getCostCenterName = (voucher) => {
  if (!voucher) return "N/A";
  
  if (voucher.costCenter && typeof voucher.costCenter === "string") {
    return voucher.costCenter;
  }
  
  if (voucher.area && typeof voucher.area === "string") {
    return voucher.area;
  }
  
  const possibleFields = [
    "costCenter", "area", "COST_CENTER_NAME", 
    "costCenterName", "cost_center_name", "AREA_NAME"
  ];
  
  for (let field of possibleFields) {
    if (voucher[field] && typeof voucher[field] === "string") {
      return voucher[field];
    }
  }
  
  return "N/A";
};

const getAreaSignatureName = (voucher) => {
  if (!voucher) return "N/A";

  if (voucher.areaSignature) {
    const managerName = voucher.areaSignature.manager_name || voucher.areaSignature.MANAGER_NAME || "";
    const managerLastname = voucher.areaSignature.manager_lastname || voucher.areaSignature.MANAGER_LASTNAME || "";
    return `${managerName} ${managerLastname}`.trim() || "N/A";
  }

  if (voucher.area) {
    return voucher.area;
  }

  if (voucher._originalData?.area) {
    return voucher._originalData.area;
  }

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

const generateSignatureHash = (voucher) => {
  const data = `${voucher.ID_VOUCHER}-${voucher.CORRELATIVE}-${new Date().getTime()}`;
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36).toUpperCase();
};