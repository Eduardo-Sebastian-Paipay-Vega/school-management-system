'use client';

import { FormEvent, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { useCoreSession } from '@/modules/squads/squad_1_core/SessionProvider';

export default function LoginForm({onSuccess}:{onSuccess:()=>void}){
  const {login}=useCoreSession();
  const [codigo,setCodigo]=useState('');
  const [identifier,setIdentifier]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function submit(event:FormEvent){
    event.preventDefault();setError('');setBusy(true);
    try{await login(codigo.trim(),identifier.trim(),password);onSuccess();}
    catch(cause){setError(cause instanceof Error?cause.message:'No se pudo iniciar sesión.');}
    finally{setBusy(false);}
  }
  return <form onSubmit={submit} className="space-y-5">
    <div><p className="text-xs font-bold uppercase tracking-wide text-brand">Acceso institucional</p>
      <h2 className="mt-1 text-2xl font-black text-brand-dark">Iniciar sesión</h2>
      <p className="mt-1 text-sm text-gray-600">Use las credenciales asignadas a su cuenta.</p></div>
    <div className="space-y-1"><label htmlFor="codigo-modular" className="block text-sm font-semibold">Código modular</label>
      <InputText id="codigo-modular" value={codigo} onChange={e=>setCodigo(e.target.value)}
        required maxLength={10} autoComplete="organization" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2" /></div>
    <div className="space-y-1"><label htmlFor="usuario-core" className="block text-sm font-semibold">Usuario, correo o DNI</label>
      <InputText id="usuario-core" value={identifier} onChange={e=>setIdentifier(e.target.value)}
        required autoComplete="username" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2" /></div>
    <div className="space-y-1"><label htmlFor="clave-core" className="block text-sm font-semibold">Contraseña</label>
      <Password inputId="clave-core" value={password} onChange={e=>setPassword(e.target.value)}
        required feedback={false} toggleMask inputClassName="w-full rounded-lg border border-gray-300 bg-white px-3 py-2" className="w-full [&_.p-icon-field]:w-full" style={{width:'100%'}} inputStyle={{width:'100%'}} autoComplete="current-password" /></div>
    {error&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <Button type="submit" label={busy?'Validando…':'Ingresar a la intranet'} icon="pi pi-sign-in"
      loading={busy} disabled={busy} className="w-full justify-center rounded-lg bg-brand px-4 py-3 font-semibold text-white" />
    <Link href="/recuperar-clave" className="block text-center text-sm font-semibold text-brand underline">¿Olvidó su contraseña?</Link>
  </form>;
}
