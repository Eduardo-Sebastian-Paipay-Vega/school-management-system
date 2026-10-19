export type UserRole = 'estudiante' | 'docente' | 'administrativo' | 'directivo';

export interface UserSession {
  usuario: string;
  role: UserRole;
  nombreCompleto: string;
  email: string;
  tenantId: string;
  token?: string;
}

export interface SquadModuleInfo {
  id: string;
  squadNumber: number;
  title: string;
  description: string;
  iconName: string;
  badge: string;
  route: string;
  allowedRoles: UserRole[];
}
