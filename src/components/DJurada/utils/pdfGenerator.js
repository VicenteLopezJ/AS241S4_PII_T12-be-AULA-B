import { numeroALetras } from './numeroALetras';


// Cargar jsPDF desde CDN
const loadJsPDF = () => {
  return new Promise((resolve, reject) => {
    if (window.jspdf) {
      resolve(window.jspdf);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

// ✅ FUNCIÓN PARA GENERAR PDF PROFESIONAL
export const generarPDF = async (declaracion) => {
  const { jsPDF } = await loadJsPDF();
  const doc = new jsPDF();

  // Configuración
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 25;
  let y = 20;

  // Determinar tipo de institución
  const tipoInstitucion = declaracion.tipo_institucion || 'VALLE_GRANDE';
  const numDeclaracion = declaracion.numero_declaracion || `DJ-${String(declaracion.id_declaracion).padStart(6, '0')}`;
  const monedaSimbolo = declaracion.moneda === 'USD' ? '$' : 'S/';

  // =====================================
  // HEADER CENTRADO
  // =====================================
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('VALLE GRANDE', pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setFontSize(14);
  doc.text('INSTITUTO RURAL', pageWidth / 2, y, { align: 'center' });
  y += 7;
  
  doc.setFontSize(12);
  doc.text(tipoInstitucion === 'PROSIP' ? 'PROSIP' : 'IESTP VALLE GRANDE', pageWidth / 2, y, { align: 'center' });
  y += 15;

  // =====================================
  // NÚMERO DE DECLARACIÓN
  // =====================================
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text(`DECLARACION JURADA N° ${numDeclaracion}`, pageWidth / 2, y, { align: 'center' });
  y += 8;

  // =====================================
  // IMPORTE
  // =====================================
  doc.setFontSize(12);
  doc.text(`IMPORTE ${monedaSimbolo} ${parseFloat(declaracion.importe_total).toFixed(2)}`, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // =====================================
  // PROYECTO Y CENTRO DE COSTOS EN UNA LÍNEA
  // =====================================
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  const proyecto = declaracion.nombre_proyecto || 'N/A';
  const centroCostos = declaracion.nombre_centro || 'N/A';
  
  // Dividir en dos columnas
  const colWidth = (pageWidth - 2 * margin) / 2;
  
  // PROYECTO (columna izquierda)
  doc.text('PROYECTO:', margin, y);
  doc.text('___________________________', margin + 28, y);
  y += 5;
  doc.setFont(undefined, 'bold');
  const proyectoLines = doc.splitTextToSize(proyecto, colWidth - 5);
  doc.text(proyectoLines, margin, y);
  doc.setFont(undefined, 'normal');
  
  // CENTRO DE COSTOS (columna derecha)
  const centroX = margin + colWidth + 5;
  y -= 5; // Volver a la misma línea
  doc.text('CENTRO DE COSTOS:', centroX, y);
  doc.text('___________________________', centroX + 52, y);
  y += 5;
  doc.setFont(undefined, 'bold');
  const centroLines = doc.splitTextToSize(centroCostos, colWidth - 5);
  doc.text(centroLines, centroX, y);
  doc.setFont(undefined, 'normal');
  y += Math.max(proyectoLines.length, centroLines.length) * 5 + 10;

  // =====================================
  // YO (NOMBRE DEL TRABAJADOR)
  // =====================================
  doc.setFontSize(10);
  doc.text('Yo:', margin, y);
  
  // Crear línea de puntos más larga
  let puntosX = margin + 8;
  while (puntosX < pageWidth - margin) {
    doc.text('.', puntosX, y);
    puntosX += 2;
  }
  y += 5;
  
  doc.setFont(undefined, 'bold');
  doc.text(declaracion.nombre_trabajador, margin, y);
  doc.setFont(undefined, 'normal');
  y += 8;

  // =====================================
  // DNI Y DOMICILIO
  // =====================================
  doc.text(`Identificado con DNI N° ${declaracion.dni_trabajador}, domiciliado en:`, margin, y);
  
  // Línea de puntos
  puntosX = margin;
  y += 5;
  while (puntosX < pageWidth - margin) {
    doc.text('.', puntosX, y);
    puntosX += 2;
  }
  y += 5;
  
  doc.setFont(undefined, 'bold');
  const domicilioLines = doc.splitTextToSize(declaracion.domicilio_trabajador || 'N/A', pageWidth - 2 * margin);
  doc.text(domicilioLines, margin, y);
  y += domicilioLines.length * 5 + 8;
  doc.setFont(undefined, 'normal');

  // =====================================
  // DECLARACIÓN PRINCIPAL
  // =====================================
  doc.text('Declaro bajo juramento haber gastado y/o recibido la suma de:', margin, y);
  
  // Línea de puntos
  puntosX = margin;
  y += 5;
  while (puntosX < pageWidth - margin) {
    doc.text('.', puntosX, y);
    puntosX += 2;
  }
  y += 5;
  
  // Importe en letras
  const importeEnLetras = numeroALetras(declaracion.importe_total);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  const letrasLines = doc.splitTextToSize(importeEnLetras, pageWidth - 2 * margin);
  doc.text(letrasLines, margin, y);
  y += letrasLines.length * 6 + 10;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  // =====================================
  // CONCEPTO
  // =====================================
  doc.text('Por concepto de:', margin, y);
  
  // Línea de puntos
  puntosX = margin;
  y += 5;
  while (puntosX < pageWidth - margin) {
    doc.text('.', puntosX, y);
    puntosX += 2;
  }
  y += 5;
  
  doc.setFont(undefined, 'bold');
  const conceptoLines = doc.splitTextToSize(declaracion.concepto_gasto, pageWidth - 2 * margin);
  doc.text(conceptoLines, margin, y);
  y += conceptoLines.length * 5 + 10;
  doc.setFont(undefined, 'normal');

  // =====================================
  // JUSTIFICACIÓN SIN COMPROBANTE
  // =====================================
  // Verificar si necesitamos nueva página
  if (y > pageHeight - 60) {
    doc.addPage();
    y = 25;
  }

  doc.text('Que por la naturaleza y/o ubicación del gasto me fue imposible obtener un', margin, y);
  y += 5;
  doc.text('comprobante de pago establecido por SUNAT.', margin, y);
  y += 15;

  // =====================================
  // FECHA
  // =====================================
  const fecha = new Date(declaracion.fecha_solicitud).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
  doc.text('FECHA:', margin, y);
  doc.text('_______________________', margin + 18, y);
  y += 5;
  doc.setFont(undefined, 'bold');
  doc.text(fecha, margin, y);
  y += 15;
  doc.setFont(undefined, 'normal');

  // =====================================
  // ESTADO DE APROBACIÓN (SI EXISTE)
  // =====================================
  if (declaracion.estado && declaracion.estado !== 'PENDIENTE') {
    // Verificar espacio
    if (y > pageHeight - 70) {
      doc.addPage();
      y = 25;
    }

    // Línea separadora
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    // Badge de estado
    doc.setFontSize(13);
    doc.setFont(undefined, 'bold');
    
    if (declaracion.estado === 'APROBADO') {
      doc.setTextColor(0, 128, 0); // Verde
      doc.text('✓ DECLARACIÓN APROBADA', pageWidth / 2, y, { align: 'center' });
    } else if (declaracion.estado === 'RECHAZADO') {
      doc.setTextColor(200, 0, 0); // Rojo
      doc.text('✗ DECLARACIÓN RECHAZADA', pageWidth / 2, y, { align: 'center' });
    }
    y += 10;

    doc.setTextColor(0, 0, 0); // Volver a negro
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    // Información de aprobación/rechazo
    if (declaracion.nombre_aprobador) {
      y += 5;
      doc.text('Revisado por:', margin, y);
      doc.setFont(undefined, 'bold');
      doc.text(declaracion.nombre_aprobador, margin + 35, y);
      doc.setFont(undefined, 'normal');
      y += 5;
      
      if (declaracion.cargo_aprobador) {
        doc.text('Cargo:', margin, y);
        doc.setFont(undefined, 'bold');
        doc.text(declaracion.cargo_aprobador, margin + 35, y);
        doc.setFont(undefined, 'normal');
        y += 5;
      }
    }

    if (declaracion.fecha_aprobacion) {
      const fechaAprobacion = new Date(declaracion.fecha_aprobacion).toLocaleDateString('es-PE', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      });
      doc.text('Fecha de revisión:', margin, y);
      doc.setFont(undefined, 'bold');
      doc.text(fechaAprobacion, margin + 35, y);
      doc.setFont(undefined, 'normal');
      y += 5;
    }

    // Si hay observaciones (en caso de rechazo)
    if (declaracion.observaciones && declaracion.estado === 'RECHAZADO') {
      y += 8;
      doc.setFont(undefined, 'bold');
      doc.text('Observaciones:', margin, y);
      y += 5;
      doc.setFont(undefined, 'normal');
      const obsLines = doc.splitTextToSize(declaracion.observaciones, pageWidth - 2 * margin);
      doc.text(obsLines, margin, y);
    }
  }

  // =====================================
  // FOOTER
  // =====================================
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generado: ${new Date().toLocaleString('es-PE')} - Sistema de Gestión Administrativa`, pageWidth / 2, footerY, { align: 'center' });

  // =====================================
  // GUARDAR
  // =====================================
  const nombreArchivo = `Declaracion_Jurada_${numDeclaracion}.pdf`;
  doc.save(nombreArchivo);

  return { success: true, filename: nombreArchivo };
};
