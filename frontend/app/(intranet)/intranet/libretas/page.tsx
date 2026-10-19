import { SecretariaModuleView } from '@/modules/squads';

export const metadata = {
  title: 'Secretaría y Libretas Oficiales | Intranet Guamán Poma UNSCH',
  description: 'Emisión de libretas en PDF oficial y verificación criptográfica QR.',
};

export default function LibretasPage() {
  return <SecretariaModuleView />;
}
