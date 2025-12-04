import { numeroALetras } from './numeroALetras';
// import { loadSheetJS } from './pdfGenerator';


const loadSheetJS = () => {
    return new Promise((resolve, reject) => {
        if (window.XLSX) {
            resolve(window.XLSX);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';
        script.onload = () => resolve(window.XLSX);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

export const generarExcel = async (declaracion) => {
    const XLSX = await loadSheetJS();

    const numDeclaracion = declaracion.numero_declaracion || `DJ-${String(declaracion.id_declaracion).padStart(6, '0')}`;
    const tipoInstitucion = declaracion.tipo_institucion || 'VALLE_GRANDE';
    const monedaSimbolo = declaracion.moneda === 'USD' ? '$' : 'S/';
    const importeEnLetras = numeroALetras(declaracion.importe_total);

    const datos = [
        ['VALLE GRANDE'],
        ['INSTITUTO RURAL'],
        [tipoInstitucion === 'PROSIP' ? 'PROSIP' : 'IESTP VALLE GRANDE'],
        [''],
        [`DECLARACION JURADA Nº ${numDeclaracion}`],
        [`IMPORTE ${monedaSimbolo}${parseFloat(declaracion.importe_total).toFixed(2)}`],
        [''],
        ['PROYECTO:', declaracion.nombre_proyecto || 'N/A', '', 'CENTRO DE COSTOS:', declaracion.nombre_centro || 'N/A'],
        [''],
        ['Yo:', declaracion.nombre_trabajador],
        ['Identificado con DNI Nº:', declaracion.dni_trabajador, 'Domiciliado en:', declaracion.domicilio_trabajador || 'N/A'],
        [''],
        ['Declaro bajo juramento haber gastado y/o recibido la suma de:'],
        [importeEnLetras],
        [''],
        ['Por concepto de:'],
        [declaracion.concepto_gasto],
        [''],
        ['Justificación:', declaracion.justificacion || 'N/A'],
        ['Razón sin comprobante:', declaracion.razon_sin_comprobante || 'N/A'],
        ['Fecha del gasto:', declaracion.fecha_gasto ? new Date(declaracion.fecha_gasto).toLocaleDateString('es-PE') : 'N/A'],
        ['Lugar del gasto:', declaracion.lugar_gasto || 'N/A'],
        [''],
        ['Que por la naturaleza y/o ubicación del gasto me fue imposible obtener un'],
        ['comprobante de pago establecido por SUNAT.'],
        [''],
        ['FECHA:', new Date(declaracion.fecha_solicitud).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })]
    ];

    // Agregar estado si existe
    if (declaracion.estado && declaracion.estado !== 'PENDIENTE') {
        datos.push(['']);
        datos.push(['ESTADO:', declaracion.estado]);
        if (declaracion.nombre_aprobador) {
            datos.push(['Revisado por:', declaracion.nombre_aprobador]);
            if (declaracion.cargo_aprobador) {
                datos.push(['Cargo:', declaracion.cargo_aprobador]);
            }
        }
        if (declaracion.observaciones) {
            datos.push(['Observaciones:', declaracion.observaciones]);
        }
    }

    // Crear hoja
    const ws = XLSX.utils.aoa_to_sheet(datos);

    // Configurar anchos de columna
    ws['!cols'] = [
        { wch: 30 },
        { wch: 40 },
        { wch: 5 },
        { wch: 25 },
        { wch: 40 }
    ];

    // Crear libro
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Declaración Jurada');

    // Guardar
    const nombreArchivo = `Declaracion_Jurada_${numDeclaracion}.xlsx`;
    XLSX.writeFile(wb, nombreArchivo);

    return { success: true, filename: nombreArchivo };
};