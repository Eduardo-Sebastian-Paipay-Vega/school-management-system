import { CalificacionesModuleView } from '@/modules/squads';

export const metadata = {
  title: 'Calificaciones - Modo Excel | Intranet Guamán Poma UNSCH',
  description: 'Planilla de notas tipo Excel con autoguardado a 400ms y conclusiones descriptivas CNEB.',
};

export default function CalificacionesPage() {
  return <CalificacionesModuleView />;
}
