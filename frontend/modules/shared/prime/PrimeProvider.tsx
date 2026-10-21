'use client';

import { addLocale, PrimeReactProvider, type APIOptions } from 'primereact/api';
import type { ReactNode } from 'react';

addLocale('es', {
  firstDayOfWeek: 1,
  dayNames: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
  dayNamesShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
  dayNamesMin: ['D', 'L', 'M', 'X', 'J', 'V', 'S'],
  monthNames: [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ],
  monthNamesShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
  today: 'Hoy',
  clear: 'Limpiar',
  accept: 'Sí',
  reject: 'No',
  choose: 'Elegir',
  upload: 'Subir',
  cancel: 'Cancelar',
  weekHeader: 'Sem',
  dateFormat: 'dd/mm/yy',
  emptyMessage: 'No se encontraron resultados',
  emptyFilterMessage: 'No se encontraron resultados',
  startsWith: 'Comienza con',
  contains: 'Contiene',
  notContains: 'No contiene',
  endsWith: 'Termina con',
  equals: 'Igual a',
  notEquals: 'Distinto de',
  noFilter: 'Sin filtro',
  lt: 'Menor que',
  lte: 'Menor o igual que',
  gt: 'Mayor que',
  gte: 'Mayor o igual que',
  dateIs: 'Fecha igual a',
  dateIsNot: 'Fecha distinta de',
  dateBefore: 'Fecha anterior a',
  dateAfter: 'Fecha posterior a',
  apply: 'Aplicar',
  matchAll: 'Coincidir todos',
  matchAny: 'Coincidir alguno',
  addRule: 'Agregar regla',
  removeRule: 'Quitar regla',
  close: 'Cerrar',
  weak: 'Débil',
  medium: 'Media',
  strong: 'Fuerte',
  passwordPrompt: 'Ingrese una contraseña',
});

// Configuración global de PrimeReact; el tema institucional se importa en app/layout.tsx.
const primeOptions: Partial<APIOptions> = {
  ripple: true,
  locale: 'es',
};

export default function PrimeProvider({ children }: { children: ReactNode }) {
  return <PrimeReactProvider value={primeOptions}>{children}</PrimeReactProvider>;
}
