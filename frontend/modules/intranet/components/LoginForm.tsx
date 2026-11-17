'use client';

import { FormEvent, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import Link from 'next/link';
import { useCoreSession } from '@/modules/squads/squad_1_core/SessionProvider';

export default function LoginForm({onSuccess}:{onSuccess:()=>void}){
  const {login}=useCoreSession();
  const [identifier,setIdentifier]=useState('');
  const [password,setPassword]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  async function submit(event:FormEvent){
    event.preventDefault();setError('');setBusy(true);
    try{await login(identifier.trim(),password);onSuccess();}
    catch(cause){setError(cause instanceof Error?cause.message:'No se pudo iniciar sesión.');}
    finally{setBusy(false);}
  }
  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <span className="inline-block rounded-full bg-[#8F1025]/10 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#8F1025]">
          Acceso Institucional Seguro
        </span>
        <h2 className="mt-1.5 bbd-font-display text-2xl sm:text-3xl text-[#3A0008] leading-none tracking-tight">
          INICIAR SESIÓN
        </h2>
        <p className="mt-1 text-xs text-[#796763]">
          Ingrese las credenciales oficiales asignadas a su cuenta institucional.
        </p>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="usuario-core" className="block text-xs font-bold uppercase tracking-wider text-[#291719]">
          Usuario, correo o DNI
        </label>
        <InputText
          id="usuario-core"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
          autoComplete="username"
          className="w-full rounded-xl border border-[#E8D8D4] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#4F000B] focus:ring-2 focus:ring-[#8F1025]/20"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="clave-core" className="block text-xs font-bold uppercase tracking-wider text-[#291719]">
          Contraseña
        </label>
        <Password
          inputId="clave-core"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          feedback={false}
          toggleMask
          inputClassName="w-full rounded-xl border border-[#E8D8D4] bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-[#4F000B] focus:ring-2 focus:ring-[#8F1025]/20"
          className="w-full [&_.p-icon-field]:w-full"
          style={{ width: '100%' }}
          inputStyle={{ width: '100%' }}
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </p>
      )}

      <Button
        type="submit"
        label={busy ? 'Validando credenciales…' : 'Ingresar a la Intranet'}
        icon="pi pi-sign-in"
        loading={busy}
        disabled={busy}
        className="w-full justify-center rounded-xl bg-[#8F1025] hover:bg-[#4F000B] px-5 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all active:scale-[0.98]"
      />

      <div className="flex flex-col items-center gap-2 pt-1">
        <Link
          href="/recuperar-clave"
          className="text-xs font-bold uppercase tracking-wider text-[#8F1025] hover:text-[#4F000B] hover:underline transition-colors"
        >
          ¿Olvidó su contraseña?
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-[#796763] hover:text-[#4F000B] transition-colors"
        >
          ← Regresar al Portal Institucional
        </Link>
      </div>
    </form>
  );
}
