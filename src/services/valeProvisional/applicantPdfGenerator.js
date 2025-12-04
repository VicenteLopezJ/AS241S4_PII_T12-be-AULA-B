import jsPDF from 'jspdf';

export const generateApplicantPDF = async (applicant) => {
  return new Promise((resolve) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // ===== ENCABEZADO FORMAL =====
    // Fondo corporativo
    doc.setFillColor(15, 42, 89); // Azul oscuro corporativo
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    // Logo institucional (texto)
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text('SISTEMA DE VALES PROVISIONALES', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255, 0.8);
    doc.setFont(undefined, 'normal');
    doc.text('Informe Oficial de Solicitante', pageWidth / 2, 30, { align: 'center' });
    
    // Línea divisoria
    doc.setDrawColor(255, 255, 255, 0.3);
    doc.setLineWidth(0.3);
    doc.line(20, 40, pageWidth - 20, 40);
    
    // ===== INFORMACIÓN PRINCIPAL =====
    let yPosition = 65;
    
    // Encabezado de información
    doc.setFontSize(14);
    doc.setTextColor(15, 42, 89);
    doc.setFont(undefined, 'bold');
    doc.text('DATOS DEL SOLICITANTE', 20, yPosition);
    
    yPosition += 15;
    
    // Tarjeta de información principal - diseño formal
    doc.setFillColor(249, 250, 251);
    doc.rect(20, yPosition, pageWidth - 40, 70, 'F');
    doc.setDrawColor(209, 213, 219);
    doc.rect(20, yPosition, pageWidth - 40, 70, 'S');
    
    // Información en formato de tabla formal
    const mainInfo = [
      { label: 'CÓDIGO DE IDENTIFICACIÓN', value: `#${applicant.ID_APPLICANT}` },
      { label: 'NOMBRE COMPLETO', value: `${applicant.FIRST_NAME} ${applicant.LAST_NAME}` },
      { label: 'DOCUMENTO DE IDENTIDAD', value: `${applicant.IDENTIFICATION_TYPE} - ${applicant.IDENTIFICATION_NUMBER}` },
      { label: 'CORREO ELECTRÓNICO', value: applicant.EMAIL },
      { label: 'TELÉFONO', value: applicant.PHONE || 'No registrado' }
    ];
    
    let infoY = yPosition + 15;
    mainInfo.forEach((info, index) => {
      // Fondo alternado para filas
      if (index % 2 === 0) {
        doc.setFillColor(255, 255, 255);
        doc.rect(25, infoY - 5, pageWidth - 50, 10, 'F');
      }
      
      doc.setFontSize(9);
      doc.setTextColor(75, 85, 99);
      doc.setFont(undefined, 'bold');
      doc.text(info.label, 30, infoY);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(31, 41, 55);
      doc.text(info.value, 100, infoY);
      
      infoY += 12;
    });
    
    // Estado del solicitante
    const statusText = applicant.STATUS === 'A' ? 'ACTIVO' : 'INACTIVO';
    const statusColor = applicant.STATUS === 'A' ? [16, 122, 87] : [185, 28, 28]; // Verde oscuro / Rojo oscuro
    
    doc.setFillColor(...statusColor);
    doc.rect(pageWidth - 70, yPosition + 45, 50, 15, 'F');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.setFont(undefined, 'bold');
    doc.text(`ESTADO: ${statusText}`, pageWidth - 45, yPosition + 55, { align: 'center' });
    
    // ===== INFORMACIÓN DETALLADA =====
    yPosition += 90;
    
    // Sección de detalles
    doc.setFontSize(12);
    doc.setTextColor(15, 42, 89);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN ADICIONAL', 20, yPosition);
    
    // Línea divisoria
    doc.setDrawColor(15, 42, 89);
    doc.setLineWidth(0.5);
    doc.line(20, yPosition + 2, 90, yPosition + 2);
    
    yPosition += 15;
    
    // Secciones organizadas en columnas
    const leftColumn = 25;
    const rightColumn = pageWidth / 2 + 10;
    let leftY = yPosition;
    let rightY = yPosition;
    
    // === COLUMNA IZQUIERDA ===
    
    // Información Personal
    doc.setFontSize(10);
    doc.setTextColor(15, 42, 89);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN PERSONAL', leftColumn, leftY);
    
    leftY += 8;
    doc.setDrawColor(229, 231, 235);
    doc.line(leftColumn, leftY, leftColumn + 80, leftY);
    leftY += 12;
    
    const personalInfo = [
      { label: 'Nombres', value: applicant.FIRST_NAME },
      { label: 'Apellidos', value: applicant.LAST_NAME },
      { label: 'Tipo de Documento', value: applicant.IDENTIFICATION_TYPE },
      { label: 'Número de Documento', value: applicant.IDENTIFICATION_NUMBER }
    ];
    
    personalInfo.forEach(info => {
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont(undefined, 'bold');
      doc.text(info.label + ':', leftColumn, leftY);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(55, 65, 81);
      const labelWidth = doc.getTextWidth(info.label + ': ');
      doc.text(info.value, leftColumn + labelWidth, leftY);
      
      leftY += 6;
    });
    
    leftY += 10;
    
    // Información Laboral
    doc.setFontSize(10);
    doc.setTextColor(15, 42, 89);
    doc.setFont(undefined, 'bold');
    doc.text('INFORMACIÓN LABORAL', leftColumn, leftY);
    
    leftY += 8;
    doc.setDrawColor(229, 231, 235);
    doc.line(leftColumn, leftY, leftColumn + 70, leftY);
    leftY += 12;
    
    const workInfo = [
      { label: 'Empresa', value: applicant.COMPANY },
      { label: 'Área/Departamento', value: `Área ${applicant.AREA_ID}` }
    ];
    
    workInfo.forEach(info => {
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont(undefined, 'bold');
      doc.text(info.label + ':', leftColumn, leftY);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(55, 65, 81);
      const labelWidth = doc.getTextWidth(info.label + ': ');
      doc.text(info.value, leftColumn + labelWidth, leftY);
      
      leftY += 6;
    });
    
    // === COLUMNA DERECHA ===
    
    // Estado del Registro
    doc.setFontSize(10);
    doc.setTextColor(15, 42, 89);
    doc.setFont(undefined, 'bold');
    doc.text('ESTADO DEL REGISTRO', rightColumn, rightY);
    
    rightY += 8;
    doc.setDrawColor(229, 231, 235);
    doc.line(rightColumn, rightY, rightColumn + 75, rightY);
    rightY += 12;
    
    const statusInfo = [
      { label: 'Estado Actual', value: applicant.STATUS === 'A' ? 'Activo' : 'Inactivo' },
      { label: 'Fecha de Registro', value: new Date(applicant.CREATED_AT).toLocaleDateString('es-ES') },
      { label: 'Nivel de Acceso', value: applicant.STATUS === 'A' ? 'Acceso Completo' : 'Acceso Restringido' }
    ];
    
    statusInfo.forEach(info => {
      doc.setFontSize(8);
      doc.setTextColor(107, 114, 128);
      doc.setFont(undefined, 'bold');
      doc.text(info.label + ':', rightColumn, rightY);
      
      doc.setFont(undefined, 'normal');
      doc.setTextColor(55, 65, 81);
      const labelWidth = doc.getTextWidth(info.label + ': ');
      doc.text(info.value, rightColumn + labelWidth, rightY);
      
      rightY += 6;
    });
    
    rightY += 10;
    
    // Observaciones
    doc.setFontSize(10);
    doc.setTextColor(15, 42, 89);
    doc.setFont(undefined, 'bold');
    doc.text('OBSERVACIONES', rightColumn, rightY);
    
    rightY += 8;
    doc.setDrawColor(229, 231, 235);
    doc.line(rightColumn, rightY, rightColumn + 60, rightY);
    rightY += 12;
    
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.setFont(undefined, 'normal');
    const observation = applicant.STATUS === 'A' 
      ? 'El solicitante cuenta con acceso completo al sistema y está autorizado para realizar todas las operaciones correspondientes.'
      : 'El solicitante tiene acceso restringido al sistema. No puede realizar operaciones hasta que sea reactivado.';
    
    doc.text(observation, rightColumn, rightY, { maxWidth: 80, align: 'justify' });
    
    // ===== FIRMAS Y AUTORIZACIONES =====
    const signatureY = Math.max(leftY, rightY) + 40;
    
    if (signatureY < pageHeight - 50) {
      doc.setFontSize(10);
      doc.setTextColor(15, 42, 89);
      doc.setFont(undefined, 'bold');
      doc.text('AUTORIZACIÓN Y VALIDACIÓN', pageWidth / 2, signatureY, { align: 'center' });
      
      // Líneas para firmas
      doc.setDrawColor(156, 163, 175);
      doc.setLineWidth(0.3);
      
      const signatureLineY = signatureY + 20;
      doc.line(40, signatureLineY, 90, signatureLineY);
      doc.line(pageWidth - 90, signatureLineY, pageWidth - 40, signatureLineY);
      
      doc.setFontSize(7);
      doc.setTextColor(107, 114, 128);
      doc.text('Firma del Responsable', 65, signatureLineY + 8, { align: 'center' });
      doc.text('Sello Institucional', pageWidth - 65, signatureLineY + 8, { align: 'center' });
    }
    
    // ===== PIE DE PÁGINA FORMAL =====
    const footerY = pageHeight - 20;
    
    // Línea superior del pie
    doc.setDrawColor(209, 213, 219);
    doc.line(20, footerY - 12, pageWidth - 20, footerY - 12);
    
    // Información del documento
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.setFont(undefined, 'normal');
    
    const generatedDate = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    doc.text(`Documento generado: ${generatedDate}`, 20, footerY - 5);
    doc.text('Sistema de Vales Provisionales - Documento Oficial', pageWidth / 2, footerY - 5, { align: 'center' });
    doc.text(`Página 1 de 1`, pageWidth - 20, footerY - 5, { align: 'right' });
    
    // ===== GENERAR PDF =====
    const pdfBlob = doc.output('blob');
    resolve(pdfBlob);
  });
};