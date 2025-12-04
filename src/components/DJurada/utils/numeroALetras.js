// import React, { useState } from 'react';
import { Download, FileText, Table, CheckCircle } from 'lucide-react';

// ============================================
// UTILIDADES PARA CONVERTIR NÚMEROS A LETRAS
// ============================================
export const numeroALetras = (numero) => {
    const unidades = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
    const decenas = ['', 'DIEZ', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
    const especiales = ['DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISEIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'];
    const centenas = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

    const convertirGrupo = (n) => {
        if (n === 0) return '';
        if (n < 10) return unidades[n];
        if (n < 20) return especiales[n - 10];
        if (n < 100) {
            const dec = Math.floor(n / 10);
            const uni = n % 10;
            if (uni === 0) return decenas[dec];
            if (dec === 2) return 'VEINTI' + unidades[uni];
            return decenas[dec] + ' Y ' + unidades[uni];
        }
        if (n < 1000) {
            const cent = Math.floor(n / 100);
            const resto = n % 100;
            if (n === 100) return 'CIEN';
            return centenas[cent] + (resto > 0 ? ' ' + convertirGrupo(resto) : '');
        }
        return '';
    };

    const [entero, decimal = '00'] = numero.toString().split('.');
    const num = parseInt(entero);

    if (num === 0) return 'CERO CON ' + decimal.padEnd(2, '0') + '/100 SOLES';

    let resultado = '';

    if (num >= 1000000) {
        const millones = Math.floor(num / 1000000);
        resultado += convertirGrupo(millones) + (millones === 1 ? ' MILLON ' : ' MILLONES ');
        const resto = num % 1000000;
        if (resto > 0) resultado += convertirGrupo(resto);
    } else if (num >= 1000) {
        const miles = Math.floor(num / 1000);
        if (miles === 1) resultado += 'MIL ';
        else resultado += convertirGrupo(miles) + ' MIL ';
        const resto = num % 1000;
        if (resto > 0) resultado += convertirGrupo(resto);
    } else {
        resultado = convertirGrupo(num);
    }

    return resultado.trim() + ' CON ' + decimal.padEnd(2, '0') + '/100 SOLES';
};

