import { AsistenciaModuleView } from '@/modules/squads';

export const metadata = {
  title: 'Asistencia - Kiosco Portería QR | Intranet Guamán Poma UNSCH',
  description: 'Control de asistencia offline-first con lector de código QR en portería.',
};

export default function AsistenciaPage() {
  return <AsistenciaModuleView />;
}
