'use client';

import Link from 'next/link';
import { Button } from 'primereact/button';
import { useCoreSession } from '@/modules/squads/squad_1_core/SessionProvider';

const modules=[
  {title:'Core y Seguridad',path:'/intranet/usuarios',permission:'profile:read-own',summary:'Usuarios, calendario, avisos y auditoría'},
  {title:'Matrícula y Asistencia',path:'/intranet/asistencia',permission:'attendance:record',summary:'Matrícula y marcación escolar'},
  {title:'Calificaciones',path:'/intranet/calificaciones',permission:'grades:read',summary:'Notas y competencias'},
  {title:'Analítica',path:'/intranet/analitica',permission:'reports:read',summary:'Indicadores y alertas'},
  {title:'Secretaría',path:'/intranet/libretas',permission:'reports:read',summary:'Libretas y documentos'},
];

export default function IntranetHub(){
  const {user,logout}=useCoreSession();
  if(!user)return null;
  return <div className="space-y-8">
    <section className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-brand p-6 text-white">
      <div><p className="text-xs uppercase tracking-wide opacity-80">Intranet institucional</p>
        <h2 className="mt-1 text-2xl font-black">Bienvenido, {user.fullName}</h2>
        <p className="mt-1 text-sm opacity-80">{user.email||user.username} · {user.roles.join(', ')}</p></div>
      <Button label="Cerrar sesión" icon="pi pi-sign-out" outlined onClick={()=>void logout()} />
    </section>
    <section><h3 className="text-lg font-bold text-brand-dark">Módulos disponibles</h3>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {modules.filter((module)=>user.permissions.includes(module.permission)).map((module)=><Link
          key={module.path} href={module.path}
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand">
          <h4 className="font-bold text-brand-dark">{module.title}</h4>
          <p className="mt-2 text-sm text-gray-600">{module.summary}</p>
          <span className="mt-4 inline-block text-sm font-semibold text-brand">Abrir módulo →</span>
        </Link>)}</div></section>
  </div>;
}
