'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import { corePublicGet, corePublicRequest } from './SessionProvider';

type Purpose='recover'|'reset'|'activate'|'guardian';
const config={recover:{title:'Recuperar contraseña',path:'/auth/forgot-password'},
  reset:{title:'Restablecer contraseña',path:'/auth/reset-password'},
  activate:{title:'Activar cuenta',path:'/auth/activate'},
  guardian:{title:'Activar acceso familiar',path:'/guardians/activate'}} as const;

export function AccessLinkForm({purpose}:{purpose:Purpose}){
  const [codigo,setCodigo]=useState('');const [token,setToken]=useState('');
  const [identifier,setIdentifier]=useState('');const [password,setPassword]=useState('');
  const [consent,setConsent]=useState(false);const [busy,setBusy]=useState(false);
  const [consentDocument,setConsentDocument]=useState<{version:string;text:string}|null>(null);
  const [message,setMessage]=useState('');const [error,setError]=useState('');
  useEffect(()=>{const params=new URLSearchParams(window.location.search);
    setCodigo(params.get('codigo')||'');setToken(params.get('token')||'');},[]);
  useEffect(()=>{
    if(purpose!=='guardian')return;
    void corePublicGet<{version:string;text:string}>('/guardians/consent')
      .then(setConsentDocument).catch(cause=>setError(cause instanceof Error?cause.message:'No se pudo cargar el consentimiento.'));
  },[purpose]);
  async function submit(event:FormEvent){
    event.preventDefault();setBusy(true);setError('');setMessage('');
    try{
      const body=purpose==='recover'?{codigoModular:codigo,identifier}:
        purpose==='guardian'?{codigoModular:codigo,token,password,consentimiento:consent,
          versionTexto:consentDocument?.version}:
        {codigoModular:codigo,token,password};
      const result=await corePublicRequest<{message:string}>(config[purpose].path,body);
      setMessage(result.message);
    }catch(cause){setError(cause instanceof Error?cause.message:'No se pudo completar.');}
    finally{setBusy(false);}
  }
  return <div className="mx-auto max-w-lg rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <h1 className="text-2xl font-black text-brand-dark">{config[purpose].title}</h1>
    <form onSubmit={submit} className="mt-5 space-y-4">
      <label htmlFor="codigo-link" className="block text-sm font-semibold">Código modular</label>
      <InputText id="codigo-link" value={codigo} onChange={e=>setCodigo(e.target.value)} required className="w-full"/>
      {purpose==='recover'?<><label htmlFor="identifier-link" className="block text-sm font-semibold">Usuario o correo</label>
        <InputText id="identifier-link" value={identifier} onChange={e=>setIdentifier(e.target.value)} required className="w-full"/></>:
        <><label htmlFor="token-link" className="block text-sm font-semibold">Token de un solo uso</label>
          <InputText id="token-link" value={token} onChange={e=>setToken(e.target.value)} required className="w-full"/>
          <label htmlFor="password-link" className="block text-sm font-semibold">{purpose==='guardian'?'Nueva contraseña (solo si su cuenta es nueva)':'Nueva contraseña'}</label>
          <Password inputId="password-link" value={password} onChange={e=>setPassword(e.target.value)}
            feedback={false} toggleMask required={purpose!=='guardian'} minLength={purpose==='guardian'?undefined:8}
            className="w-full [&_.p-icon-field]:w-full" inputClassName="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"/>
          <p className="text-xs text-gray-600">Mínimo 8 caracteres, una letra y un número.</p></>}
      {purpose==='guardian'&&consentDocument&&<section aria-label="Consentimiento de datos" className="rounded-lg border bg-gray-50 p-4 text-sm">
        <p className="whitespace-pre-wrap">{consentDocument.text}</p>
        <p className="mt-2 text-xs text-gray-600">Versión {consentDocument.version}</p></section>}
      {purpose==='guardian'&&<label className="flex gap-2 text-sm"><input type="checkbox" checked={consent}
        onChange={e=>setConsent(e.target.checked)} required/>
        <span>He leído y acepto el texto de consentimiento mostrado.</span></label>}
      {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}
      {message&&<p role="status" className="text-sm text-green-700">{message}</p>}
      <Button type="submit" label={busy?'Procesando…':'Continuar'} loading={busy}
        disabled={busy||purpose==='guardian'&&(!consent||!consentDocument)}/>
    </form>
    <Link href="/login" className="mt-5 inline-block text-sm font-semibold text-brand underline">Volver al acceso</Link>
  </div>;
}
