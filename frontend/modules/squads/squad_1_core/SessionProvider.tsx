'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE_URL as API, parseEnvelope as parse, publicGet, publicPost } from '@/modules/shared/api';
import type { CoreSessionData, CoreUser } from '@/modules/shared/api';

export type { CoreUser } from '@/modules/shared/api';
type SessionResult = CoreSessionData;
type CoreSession={user:CoreUser|null; loading:boolean;
  login:(codigoModular:string,identifier:string,password:string)=>Promise<void>;
  logout:()=>Promise<void>;
  request:<T>(path:string,init?:RequestInit)=>Promise<T>;
  download:(path:string,filename:string)=>Promise<void>;
  subscribeNotifications:(listener:()=>void)=>()=>void};
const Context=createContext<CoreSession|null>(null);

export const corePublicRequest=publicPost;
export const corePublicGet=publicGet;

export function SessionProvider({children}:{children:React.ReactNode}){
  const [user,setUser]=useState<CoreUser|null>(null);
  const [loading,setLoading]=useState(true);
  const token=useRef<string|null>(null);
  const router=useRouter();
  const pathname=usePathname();
  const renew=useCallback(async()=>{
    const response=await fetch(`${API}/api/v1/auth/refresh-token`,{method:'POST',credentials:'include'});
    const data=await parse<SessionResult>(response);
    token.current=data.accessToken;
    setUser(data.user);
    return data.accessToken;
  },[]);
  useEffect(()=>{
    let mounted=true;
    renew().catch(()=>{if(mounted){token.current=null;setUser(null);}})
      .finally(()=>{if(mounted)setLoading(false);});
    return()=>{mounted=false;};
  },[renew]);
  useEffect(()=>{
    if(!loading && !user && pathname.startsWith('/intranet')) router.replace('/login');
  },[loading,user,pathname,router]);
  const login=useCallback(async(codigoModular:string,identifier:string,password:string)=>{
    const response=await fetch(`${API}/api/v1/auth/login`,{method:'POST',credentials:'include',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({codigoModular,identifier,password})});
    const data=await parse<SessionResult>(response);
    token.current=data.accessToken;
    setUser(data.user);
  },[]);
  const logout=useCallback(async()=>{
    try{if(token.current)await fetch(`${API}/api/v1/auth/logout`,{method:'POST',credentials:'include',
      headers:{Authorization:`Bearer ${token.current}`}});}finally{
      token.current=null;setUser(null);router.replace('/login');
    }
  },[router]);
  const request=useCallback(async<T,>(path:string,init:RequestInit={}):Promise<T>=>{
    let access=token.current;
    if(!access) access=await renew();
    const send=(value:string)=>fetch(`${API}/api/v1${path}`,{...init,credentials:'include',
      headers:{...init.headers,Authorization:`Bearer ${value}`}});
    let response=await send(access);
    if(response.status===401){access=await renew();response=await send(access);}
    return parse<T>(response);
  },[renew]);
  const download=useCallback(async(path:string,filename:string)=>{
    let access=token.current||await renew();
    const send=(value:string)=>fetch(`${API}/api/v1${path}`,{credentials:'include',headers:{Authorization:`Bearer ${value}`}});
    let response=await send(access);
    if(response.status===401){access=await renew();response=await send(access);}
    if(!response.ok)throw new Error('No se pudo descargar el archivo.');
    const url=URL.createObjectURL(await response.blob());
    const link=document.createElement('a');link.href=url;link.download=filename;link.click();
    setTimeout(()=>URL.revokeObjectURL(url),60_000);
  },[renew]);
  const subscribeNotifications=useCallback((listener:()=>void)=>{
    let active=true;let socket:WebSocket|null=null;let retry:ReturnType<typeof setTimeout>|null=null;
    const connect=async()=>{
      if(!active)return;
      try{
        const access=token.current || await renew();
        if(!active)return;
        socket=new WebSocket(`${API.replace(/^http/,'ws')}/api/v1/notifications/ws`,['bearer',access]);
        socket.onmessage=(event)=>{try{if(JSON.parse(event.data).type==='notification')listener();}
          catch{ /* Se ignoran mensajes que no cumplen el contrato del canal. */ }};
        socket.onclose=()=>{if(active)retry=setTimeout(()=>{void renew().then(connect).catch(()=>{});},3000);};
      }catch{ /* La bandeja HTTP sigue disponible si falla el canal en tiempo real. */ }
    };
    void connect();
    return()=>{active=false;if(retry)clearTimeout(retry);socket?.close();};
  },[renew]);
  const value=useMemo(()=>({user,loading,login,logout,request,download,subscribeNotifications}),
    [user,loading,login,logout,request,download,subscribeNotifications]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useCoreSession(){
  const context=useContext(Context);
  if(!context) throw new Error('SessionProvider no está montado.');
  return context;
}

export function SessionGate({children}:{children:React.ReactNode}){
  const {user,loading}=useCoreSession();
  const pathname=usePathname();
  if(!pathname.startsWith('/intranet')) return <>{children}</>;
  if(loading) return <p role="status" className="p-8 text-center">Verificando sesión…</p>;
  if(!user) return <p role="status" className="p-8 text-center">Redirigiendo al acceso…</p>;
  return <>{children}</>;
}
