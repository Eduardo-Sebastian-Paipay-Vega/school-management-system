'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { TabView, TabPanel } from 'primereact/tabview';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { useCoreSession } from './SessionProvider';

type DirectoryUser={id:string;username:string;estado:string;nombres:string;apellido_paterno:string;
  apellido_materno:string|null;email:string|null;telefono_enmascarado:string|null;documento_ultimos4:string|null;roles:string[]};
type Year={id:string;anio:number;fecha_inicio:string;fecha_fin:string;activo:boolean};
type Institution={id:string;codigo_modular:string;nombre:string;direccion:string|null;telefono:string|null;
  membrete_texto:string|null;escudo_url:string|null};
type Site={id:string;nombre:string;direccion:string|null;activo:boolean};
type Notice={id:string;titulo:string;mensaje:string;categoria:string;created_at:string;leida_en:string|null};
type AuditLog={id:string;accion:string;modulo:string;tabla_afectada:string;timestamp_utc:string;usuario_id:string};
type Preview={summary:{nuevos:number;actualizados:number;sinCambios:number;rechazados:number};
  rejected:{line:number;reason:string}[]};
type Role={id:number;codigo:string;nombre:string;permisos:string[]};
type Permission={codigo:string;descripcion:string};
type Person={id:string;nombres:string;apellido_paterno:string;documento_ultimos4:string|null};
type GuardianLink={id:string;apoderado_id:string;estudiante_id:string;apoderado:string;estudiante:string;
  parentesco:string;activo:boolean;confirmado_en:string|null};

function useLoad<T>(path:string,enabled=true){
  const {request}=useCoreSession();
  const [data,setData]=useState<T|null>(null);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const reload=useCallback(async()=>{
    if(!enabled)return;
    setBusy(true);setError('');
    try{setData(await request<T>(path));}
    catch(cause){setError(cause instanceof Error?cause.message:'No se pudo cargar la información.');}
    finally{setBusy(false);}
  },[enabled,path,request]);
  useEffect(()=>{void reload();},[reload]);
  return {data,busy,error,reload};
}

function State({busy,error,retry}:{busy:boolean;error:string;retry:()=>void}){
  if(busy)return <p role="status" className="p-4 text-sm">Cargando datos…</p>;
  if(error)return <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
    {error} <Button label="Reintentar" text size="small" onClick={retry}/></div>;
  return null;
}

function UsersPanel(){
  const {request,user}=useCoreSession();
  const [search,setSearch]=useState('');
  const [appliedSearch,setAppliedSearch]=useState('');
  const [first,setFirst]=useState(0);
  const {data,busy,error,reload}=useLoad<{users:DirectoryUser[];count:number}>(`/users?search=${encodeURIComponent(appliedSearch)}&limit=10&offset=${first}`,
    !!user?.permissions.includes('users:read'));
  const {data:roles}=useLoad<Role[]>('/users/roles',!!user?.permissions.includes('roles:read'));
  const [action,setAction]=useState('');
  const [message,setMessage]=useState('');
  const [file,setFile]=useState<{filename:string;contentBase64:string}|null>(null);
  const [preview,setPreview]=useState<Preview|null>(null);
  const [newUser,setNewUser]=useState({nombres:'',apellidoPaterno:'',documento:'',email:'',rol:''});
  const [target,setTarget]=useState<DirectoryUser|null>(null);
  const [editTarget,setEditTarget]=useState<DirectoryUser|null>(null);
  const [editName,setEditName]=useState('');const [editLastName,setEditLastName]=useState('');
  const [editPhone,setEditPhone]=useState('');const [editPhoneTouched,setEditPhoneTouched]=useState(false);
  const [selectedRoles,setSelectedRoles]=useState<string[]>([]);
  const [roleReason,setRoleReason]=useState('');
  async function createUser(){
    setAction('create');setMessage('');
    try{
      await request('/users',{method:'POST',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...newUser,tipoDocumento:'DNI'})});
      setNewUser({nombres:'',apellidoPaterno:'',documento:'',email:'',rol:''});
      setMessage('Cuenta pendiente creada. Envíe la invitación desde el directorio.');await reload();
    }catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo crear la cuenta.');}
    finally{setAction('');}
  }
  async function assignRoles(){
    if(!target)return;
    setAction('roles');setMessage('');
    try{
      await request(`/users/${target.id}/roles`,{method:'PUT',headers:{'Content-Type':'application/json'},
        body:JSON.stringify({roles:selectedRoles,motivo:roleReason})});
      setTarget(null);setRoleReason('');setMessage('Roles actualizados; la cuenta deberá iniciar sesión de nuevo.');
      await reload();
    }catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudieron asignar los roles.');}
    finally{setAction('');}
  }
  async function saveUser(){
    if(!editTarget)return;
    setAction('edit');setMessage('');
    try{await request(`/users/${editTarget.id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nombres:editName.trim(),apellidoPaterno:editLastName.trim(),
        ...(editPhoneTouched?{telefono:editPhone}:{})})});
      setEditTarget(null);setMessage('Usuario actualizado.');await reload();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo actualizar el usuario.');}
    finally{setAction('');}
  }
  async function post(path:string,body:object={}){
    setAction(path);setMessage('');
    try{await request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      setMessage('Operación completada.');await reload();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo completar.');}
    finally{setAction('');}
  }
  async function choose(input:File|null){
    setPreview(null);if(!input)return;
    const encoded=await new Promise<string>((resolve,reject)=>{const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result).split(',')[1]||'');reader.onerror=()=>reject(reader.error);reader.readAsDataURL(input);});
    setFile({filename:input.name,contentBase64:encoded});
  }
  async function importRequest(commit:boolean){
    if(!file)return;setAction('import');setMessage('');
    try{
      if(commit){await request('/users/import/commit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(file)});
        setPreview(null);setFile(null);setMessage('Lote aplicado.');await reload();}
      else setPreview(await request<Preview>('/users/import/preview',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(file)}));
    }catch(cause){setMessage(cause instanceof Error?cause.message:'Error en el lote.');}
    finally{setAction('');}
  }
  if(!user?.permissions.includes('users:read'))return <p>No tiene permiso para consultar el directorio.</p>;
  return <div className="space-y-4">
    <div className="flex flex-wrap gap-2"><label htmlFor="search-users" className="sr-only">Buscar usuario</label>
      <InputText id="search-users" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Nombre, usuario o DNI"/>
      <Button label="Buscar" icon="pi pi-search" outlined onClick={()=>{setFirst(0);setAppliedSearch(search.trim());}}/>
      <Button label="Actualizar" icon="pi pi-refresh" outlined onClick={()=>void reload()}/></div>
    <State busy={busy} error={error} retry={()=>void reload()}/>
    <DataTable value={data?.users??[]} dataKey="id" loading={busy} paginator rows={10} first={first}
      lazy totalRecords={data?.count??0} onPage={event=>setFirst(event.first)}
      emptyMessage="No hay usuarios para mostrar." scrollable className="text-sm">
      <Column header="Persona" body={(row:DirectoryUser)=>`${row.nombres} ${row.apellido_paterno}`}/>
      <Column field="username" header="Usuario"/><Column field="estado" header="Estado"/>
      <Column header="Roles" body={(row:DirectoryUser)=>row.roles.join(', ')||'Sin rol'}/>
      <Column header="Acciones" body={(row:DirectoryUser)=><div className="flex gap-1">
        {user.permissions.includes('users:manage')&&<Button label="Editar" text size="small" onClick={()=>{
          setEditTarget(row);setEditName(row.nombres);setEditLastName(row.apellido_paterno);
          setEditPhone('');setEditPhoneTouched(false);}}/>}
        {user.permissions.includes('users:assign-roles')&&row.estado==='ACTIVO'&&
          <Button label="Roles" text size="small" onClick={()=>{
            setTarget(row);setSelectedRoles(row.roles);setRoleReason('');}}/>}
        {user.permissions.includes('users:manage')&&row.estado==='PENDIENTE_CAMBIO_CLAVE'&&<Button label="Invitar" text size="small"
          disabled={!!action} onClick={()=>void post(`/users/${row.id}/invite`)}/>}
        {user.permissions.includes('users:manage')&&user.roles.includes('SUPERADMIN')&&row.id!==user.id&&<Button label={row.estado==='INACTIVO'?'Reactivar':'Desactivar'}
          text size="small" disabled={!!action} onClick={()=>{const motivo=window.prompt('Motivo de esta acción');
            if(motivo)void post(`/users/${row.id}/${row.estado==='INACTIVO'?'reactivate':'deactivate'}`,{motivo});}}/>}
      </div>}/>
    </DataTable>
    {editTarget&&<section className="rounded-xl border border-gray-200 p-4" aria-label="Editar usuario">
      <h3 className="font-bold">Editar a {editTarget.username}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label htmlFor="edit-name" className="text-sm">Nombres</label>
        <InputText id="edit-name" value={editName} onChange={event=>setEditName(event.target.value)} maxLength={100}/>
        <label htmlFor="edit-last-name" className="text-sm">Apellido paterno</label>
        <InputText id="edit-last-name" value={editLastName} onChange={event=>setEditLastName(event.target.value)} maxLength={100}/>
        <label htmlFor="edit-phone" className="text-sm">Teléfono</label>
        <div><InputText id="edit-phone" value={editPhone} onChange={event=>{
          setEditPhone(event.target.value);setEditPhoneTouched(true);}} maxLength={20}
          placeholder="Dejar sin cambios"/>
          {editTarget.telefono_enmascarado&&<p className="mt-1 text-xs text-gray-600">
            Actual: {editTarget.telefono_enmascarado}</p>}</div>
      </div>
      <div className="mt-3 flex gap-2"><Button label="Guardar" disabled={!!action||!editName.trim()||!editLastName.trim()}
        onClick={()=>void saveUser()}/><Button label="Cancelar" outlined onClick={()=>setEditTarget(null)}/></div>
    </section>}
    {target&&<section className="rounded-xl border border-gray-200 p-4" aria-label="Asignar roles">
      <h3 className="font-bold">Roles de {target.nombres} {target.apellido_paterno}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{roles?.map(role=><label key={role.codigo} className="flex gap-2 text-sm">
        <input type="checkbox" checked={selectedRoles.includes(role.codigo)} onChange={event=>setSelectedRoles(current=>
          event.target.checked?[...current,role.codigo]:current.filter(code=>code!==role.codigo))}/>
        <span>{role.nombre}</span></label>)}</div>
      <label htmlFor="role-reason" className="mt-3 block text-sm">Motivo del cambio</label>
      <InputText id="role-reason" value={roleReason} onChange={event=>setRoleReason(event.target.value)}
        className="mt-1 w-full" maxLength={500}/>
      <div className="mt-3 flex gap-2"><Button label="Guardar roles" disabled={!!action||!selectedRoles.length||roleReason.trim().length<3}
        onClick={()=>void assignRoles()}/><Button label="Cancelar" outlined onClick={()=>setTarget(null)}/></div>
    </section>}
    {user.permissions.includes('users:manage')&&user.roles.some(role=>['SUPERADMIN','DIRECTIVO'].includes(role))&&<section className="rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold">Alta individual</h3>
      <p className="mt-1 text-xs text-gray-600">La persona recibirá una invitación para fijar su propia contraseña.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Nombres<InputText className="mt-1 w-full" value={newUser.nombres}
          onChange={event=>setNewUser(current=>({...current,nombres:event.target.value}))}/></label>
        <label className="text-sm">Apellido paterno<InputText className="mt-1 w-full" value={newUser.apellidoPaterno}
          onChange={event=>setNewUser(current=>({...current,apellidoPaterno:event.target.value}))}/></label>
        <label className="text-sm">DNI<InputText className="mt-1 w-full" value={newUser.documento} maxLength={8}
          onChange={event=>setNewUser(current=>({...current,documento:event.target.value}))}/></label>
        <label className="text-sm">Correo<InputText className="mt-1 w-full" type="email" value={newUser.email}
          onChange={event=>setNewUser(current=>({...current,email:event.target.value}))}/></label>
        <label className="text-sm">Rol<select className="mt-1 w-full rounded-lg border border-gray-300 p-2" value={newUser.rol}
          onChange={event=>setNewUser(current=>({...current,rol:event.target.value}))}>
          <option value="">Seleccione un rol</option>{roles?.filter(role=>role.codigo!=='SUPERADMIN'||user.roles.includes('SUPERADMIN'))
            .map(role=><option key={role.codigo} value={role.codigo}>{role.nombre}</option>)}
        </select></label>
      </div>
      <Button label="Crear cuenta pendiente" className="mt-3" disabled={!!action||!newUser.nombres.trim()||
        !newUser.apellidoPaterno.trim()||!/^\d{8}$/.test(newUser.documento)||!newUser.email||!newUser.rol}
        onClick={()=>void createUser()}/>
    </section>}
    {user.permissions.includes('users:import')&&<section className="rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold">Importar personas y cuentas</h3>
      <p className="mt-1 text-xs text-gray-600">CSV o XLSX; valide el lote antes de aplicarlo. El archivo no debe incluir contraseñas.</p>
      <input aria-label="Archivo de usuarios" type="file" accept=".csv,.xlsx" className="mt-3 block text-sm"
        onChange={e=>void choose(e.target.files?.[0]??null)}/>
      <div className="mt-3 flex gap-2"><Button label="Vista previa" outlined disabled={!file||!!action}
        onClick={()=>void importRequest(false)}/>
      <Button label="Aplicar lote" disabled={!preview||!!action||preview.rejected.length>0}
        onClick={()=>void importRequest(true)}/></div>
      {preview&&<p className="mt-3 text-sm" role="status">Nuevos: {preview.summary.nuevos}; actualizados: {preview.summary.actualizados}; sin cambios: {preview.summary.sinCambios}; rechazados: {preview.summary.rechazados}.
        {preview.rejected.map(r=><span key={r.line} className="block text-red-700">Fila {r.line}: {r.reason}</span>)}</p>}
    </section>}
    {message&&<p role="status" className="text-sm">{message}</p>}
  </div>;
}

type Period={id:string;tipo:string;numero:number;fecha_inicio:string;fecha_fin:string;cerrado:boolean};
type Section={id:string;nivel:string;grado:number;seccion:string;aforo_maximo:number};
type NonSchoolDay={id:string;fecha:string;tipo:string;motivo:string};
type Scale={id:string;nivel:string;modalidad:string;estado:string};
type ScaleGrade='AD'|'A'|'B'|'C';
const scaleGrades:ScaleGrade[]=['AD','A','B','C'];
type ScaleRangeDraft={descripcion:string;min:string;max:string};

function YearDetails({id}:{id:string}){
  const {request,user}=useCoreSession();
  const periods=useLoad<Period[]>(`/school/years/${id}/periods`);
  const sections=useLoad<Section[]>(`/school/years/${id}/sections`);
  const days=useLoad<NonSchoolDay[]>(`/school/years/${id}/non-school-days`);
  const scales=useLoad<Scale[]>(`/school/years/${id}/scales`);
  const [type,setType]=useState('BIMESTRE');const [number,setNumber]=useState('1');
  const [start,setStart]=useState('');const [end,setEnd]=useState('');const [deadline,setDeadline]=useState('');
  const [level,setLevel]=useState('PRIMARIA');const [grade,setGrade]=useState('1');
  const [section,setSection]=useState('A');const [capacity,setCapacity]=useState('30');
  const [day,setDay]=useState('');const [dayType,setDayType]=useState('FERIADO');const [reason,setReason]=useState('');
  const [scaleLevel,setScaleLevel]=useState('PRIMARIA');const [scaleMode,setScaleMode]=useState<'LITERAL'|'DUAL_VIGESIMAL'>('LITERAL');
  const [scaleRanges,setScaleRanges]=useState<Record<ScaleGrade,ScaleRangeDraft>>({
    AD:{descripcion:'',min:'',max:''},A:{descripcion:'',min:'',max:''},
    B:{descripcion:'',min:'',max:''},C:{descripcion:'',min:'',max:''}});
  const [approvalSource,setApprovalSource]=useState('');
  const [message,setMessage]=useState('');
  async function submit(path:string,body:object,reload:()=>Promise<void>){
    setMessage('');try{await request(path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      setMessage('Guardado.');await reload();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo guardar.');}
  }
  async function createScale(){
    const rangos=scaleGrades.map(nivel=>({nivel,descripcion:scaleRanges[nivel].descripcion.trim(),
      min:scaleMode==='LITERAL'?null:Number(scaleRanges[nivel].min),
      max:scaleMode==='LITERAL'?null:Number(scaleRanges[nivel].max)}));
    await submit(`/school/years/${id}/scales`,{nivel:scaleLevel,modalidad:scaleMode,rangos},scales.reload);
  }
  return <section className="space-y-5 rounded-xl border p-4"><h3 className="text-lg font-bold">Detalle del año lectivo</h3>
    <div><h4 className="font-semibold">Periodos</h4><State busy={periods.busy} error={periods.error} retry={()=>void periods.reload()}/>
      <DataTable value={periods.data??[]} dataKey="id" emptyMessage="Sin periodos." loading={periods.busy}>
      <Column field="tipo" header="Tipo"/><Column field="numero" header="N.º"/><Column field="fecha_inicio" header="Inicio"/>
      <Column field="fecha_fin" header="Fin"/><Column header="Estado" body={(p:Period)=>p.cerrado?'Cerrado':'Abierto'}/>
      {user?.permissions.includes('school:manage')&&<Column header="Acción" body={(p:Period)=>!p.cerrado&&
        <Button label="Cerrar" text size="small" onClick={()=>void submit(`/school/periods/${p.id}/close`,{},periods.reload)}/>}/>}
    </DataTable>{user?.permissions.includes('school:manage')&&<div className="mt-3 flex flex-wrap items-end gap-2 text-sm">
      <label>Tipo<select value={type} onChange={e=>setType(e.target.value)} className="block rounded border p-2"><option>BIMESTRE</option><option>TRIMESTRE</option></select></label>
      <label>N.º<InputText value={number} onChange={e=>setNumber(e.target.value)} className="block w-16 rounded border p-2"/></label>
      <label>Inicio<input type="date" value={start} onChange={e=>setStart(e.target.value)} className="block rounded border p-2"/></label>
      <label>Fin<input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="block rounded border p-2"/></label>
      <label>Límite de notas<input type="datetime-local" value={deadline} onChange={e=>setDeadline(e.target.value)} className="block rounded border p-2"/></label>
      <Button label="Crear periodo" disabled={!start||!end||!deadline} onClick={()=>void submit(`/school/years/${id}/periods`,
        {tipo:type,numero:Number(number),fechaInicio:start,fechaFin:end,fechaLimiteNotas:new Date(deadline).toISOString()},periods.reload)}/>
    </div>}</div>
    <div><h4 className="font-semibold">Secciones</h4><State busy={sections.busy} error={sections.error} retry={()=>void sections.reload()}/>
      <DataTable value={sections.data??[]} dataKey="id" emptyMessage="Sin secciones." loading={sections.busy}>
      <Column field="nivel" header="Nivel"/><Column field="grado" header="Grado"/><Column field="seccion" header="Sección"/>
      <Column field="aforo_maximo" header="Aforo"/></DataTable>
      {user?.permissions.includes('school:manage')&&<div className="mt-3 flex flex-wrap items-end gap-2 text-sm">
        <label>Nivel<select value={level} onChange={e=>setLevel(e.target.value)} className="block rounded border p-2">
          <option>INICIAL</option><option>PRIMARIA</option><option>SECUNDARIA</option></select></label>
        <label>Grado<InputText value={grade} onChange={e=>setGrade(e.target.value)} className="block w-16 rounded border p-2"/></label>
        <label>Sección<InputText value={section} onChange={e=>setSection(e.target.value)} className="block w-16 rounded border p-2"/></label>
        <label>Aforo<InputText value={capacity} onChange={e=>setCapacity(e.target.value)} className="block w-20 rounded border p-2"/></label>
        <Button label="Crear sección" onClick={()=>void submit(`/school/years/${id}/sections`,
          {nivel:level,grado:Number(grade),seccion:section,aforoMaximo:Number(capacity)},sections.reload)}/>
      </div>}</div>
    <div><h4 className="font-semibold">Días no lectivos</h4><State busy={days.busy} error={days.error} retry={()=>void days.reload()}/>
      <DataTable value={days.data??[]} dataKey="id" emptyMessage="Sin días no lectivos." loading={days.busy}>
      <Column field="fecha" header="Fecha"/><Column field="tipo" header="Tipo"/><Column field="motivo" header="Motivo"/></DataTable>
      {user?.permissions.includes('school:manage')&&<div className="mt-3 flex flex-wrap items-end gap-2 text-sm">
        <label>Fecha<input type="date" value={day} onChange={e=>setDay(e.target.value)} className="block rounded border p-2"/></label>
        <label>Tipo<select value={dayType} onChange={e=>setDayType(e.target.value)} className="block rounded border p-2">
          <option>FERIADO</option><option>VACACIONES</option><option>SUSPENSION</option><option>INSTITUCIONAL</option></select></label>
        <label>Motivo<InputText value={reason} onChange={e=>setReason(e.target.value)} className="block rounded border p-2"/></label>
        <Button label="Agregar día" disabled={!day||reason.trim().length<2} onClick={()=>void submit(`/school/years/${id}/non-school-days`,
          {fecha:day,tipo:dayType,motivo:reason},days.reload)}/>
      </div>}</div>
    <div><h4 className="font-semibold">Escalas CNEB</h4><State busy={scales.busy} error={scales.error} retry={()=>void scales.reload()}/>
      <DataTable value={scales.data??[]} dataKey="id" emptyMessage="Sin escalas." loading={scales.busy}>
      <Column field="nivel" header="Nivel"/><Column field="modalidad" header="Modalidad"/><Column field="estado" header="Estado"/>
      {user?.permissions.includes('school:manage')&&user.roles.some(role=>['SUPERADMIN','DIRECTIVO'].includes(role))&&
        <Column header="Aprobación" body={(scale:Scale)=>scale.estado==='BORRADOR'&&
          (scale.modalidad==='DUAL_VIGESIMAL'?<span>Pendiente D-16</span>:
            <Button label="Aprobar" text size="small" disabled={approvalSource.trim().length<5}
              onClick={()=>void submit(`/school/scales/${scale.id}/approve`,
                {fuenteAprobacion:approvalSource.trim()},scales.reload)}/>)}/>}</DataTable>
      <p className="mt-2 text-xs text-gray-600">La publicación de rangos numéricos requiere la aprobación académica oficial D-16.</p>
      {user?.permissions.includes('school:manage')&&user.roles.some(role=>['SUPERADMIN','DIRECTIVO'].includes(role))&&
        <label className="mt-3 block text-sm">Fuente de aprobación
          <InputText value={approvalSource} onChange={event=>setApprovalSource(event.target.value)}
            placeholder="Acta o resolución oficial" className="mt-1 w-full" maxLength={500}/></label>}
      {user?.permissions.includes('school:manage')&&<div className="mt-4 rounded-lg border border-gray-200 p-3">
        <h5 className="font-semibold">Nueva escala en borrador</h5>
        <div className="mt-3 flex flex-wrap gap-3 text-sm">
          <label>Nivel<select value={scaleLevel} onChange={event=>setScaleLevel(event.target.value)} className="block rounded border p-2">
            <option>INICIAL</option><option>PRIMARIA</option><option>SECUNDARIA</option></select></label>
          <label>Modalidad<select value={scaleMode} onChange={event=>setScaleMode(event.target.value as 'LITERAL'|'DUAL_VIGESIMAL')}
            className="block rounded border p-2"><option value="LITERAL">Literal</option>
            <option value="DUAL_VIGESIMAL">Dual vigesimal</option></select></label>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">{scaleGrades.map(grade=><div key={grade} className="rounded-lg border p-3 text-sm">
          <p className="font-semibold">{grade}</p><label>Descripción<InputText value={scaleRanges[grade].descripcion}
            onChange={event=>setScaleRanges(current=>({...current,[grade]:{...current[grade],descripcion:event.target.value}}))}
            className="mt-1 w-full" maxLength={150}/></label>
          {scaleMode==='DUAL_VIGESIMAL'&&<div className="mt-2 flex gap-2">
            <label>Mínimo<input type="number" min="0" max="20" step="0.01" value={scaleRanges[grade].min}
              onChange={event=>setScaleRanges(current=>({...current,[grade]:{...current[grade],min:event.target.value}}))}
              className="block w-24 rounded border p-2"/></label>
            <label>Máximo<input type="number" min="0" max="20" step="0.01" value={scaleRanges[grade].max}
              onChange={event=>setScaleRanges(current=>({...current,[grade]:{...current[grade],max:event.target.value}}))}
              className="block w-24 rounded border p-2"/></label></div>}</div>)}</div>
        <Button label="Guardar borrador" className="mt-3"
          disabled={scaleGrades.some(grade=>!scaleRanges[grade].descripcion.trim()||scaleMode==='DUAL_VIGESIMAL'&&
            (!scaleRanges[grade].min||!scaleRanges[grade].max))} onClick={()=>void createScale()}/>
      </div>}
    </div>
    {message&&<p role="status" className="text-sm">{message}</p>}
  </section>;
}

function SchoolPanel(){
  const {request,user}=useCoreSession();
  const {data,busy,error,reload}=useLoad<Year[]>('/school/years');
  const {data:institution,busy:institutionBusy,error:institutionError,reload:reloadInstitution}=useLoad<Institution>('/school/institution');
  const {data:sites,busy:sitesBusy,error:sitesError,reload:reloadSites}=useLoad<Site[]>('/school/sites');
  const [schoolName,setSchoolName]=useState('');const [address,setAddress]=useState('');
  const [phone,setPhone]=useState('');const [letterhead,setLetterhead]=useState('');const [crest,setCrest]=useState('');
  const [siteName,setSiteName]=useState('');const [selectedYear,setSelectedYear]=useState('');
  const [editingSite,setEditingSite]=useState<Site|null>(null);const [editingSiteName,setEditingSiteName]=useState('');
  useEffect(()=>{if(institution){setSchoolName(institution.nombre);setAddress(institution.direccion??'');
    setPhone(institution.telefono??'');setLetterhead(institution.membrete_texto??'');
    setCrest(institution.escudo_url??'');}},[institution]);
  const [year,setYear]=useState(String(new Date().getFullYear()+1));
  const [start,setStart]=useState('');const [end,setEnd]=useState('');const [message,setMessage]=useState('');
  async function create(){
    setMessage('');try{await request('/school/years',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({anio:Number(year),fechaInicio:start,fechaFin:end})});setMessage('Año lectivo creado.');await reload();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo crear el año.');}
  }
  async function updateInstitution(){
    setMessage('');try{await request('/school/institution',{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nombre:schoolName,direccion:address,telefono:phone,membreteTexto:letterhead,
        escudoUrl:crest||undefined})});
      setMessage('Datos institucionales actualizados.');await reloadInstitution();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo guardar.');}
  }
  async function addSite(){
    setMessage('');try{await request('/school/sites',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({nombre:siteName})});setSiteName('');setMessage('Sede creada.');await reloadSites();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo crear la sede.');}
  }
  async function updateSite(id:string,body:object){
    setMessage('');try{await request(`/school/sites/${id}`,{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify(body)});setEditingSite(null);setMessage('Sede actualizada.');await reloadSites();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo actualizar la sede.');}
  }
  async function activate(id:string){
    if(!window.confirm('¿Activar este año lectivo?'))return;
    try{await request(`/school/years/${id}/activate`,{method:'POST'});await reload();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo activar.');}
  }
  return <div className="space-y-4"><State busy={busy} error={error} retry={()=>void reload()}/>
    <State busy={institutionBusy} error={institutionError} retry={()=>void reloadInstitution()}/>
    {institution&&<section className="rounded-xl border border-gray-200 p-4"><h3 className="font-bold">Institución · {institution.codigo_modular}</h3>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Nombre<InputText value={schoolName} onChange={e=>setSchoolName(e.target.value)} className="block w-full rounded border p-2"/></label>
        <label className="text-sm">Dirección<InputText value={address} onChange={e=>setAddress(e.target.value)} className="block w-full rounded border p-2"/></label>
        <label className="text-sm">Teléfono<InputText value={phone} onChange={e=>setPhone(e.target.value)} className="block w-full rounded border p-2"/></label>
        <label className="text-sm">Membrete<InputText value={letterhead} onChange={e=>setLetterhead(e.target.value)} className="block w-full rounded border p-2"/></label>
        <label className="text-sm">URL del escudo<InputText value={crest} onChange={e=>setCrest(e.target.value)} className="block w-full rounded border p-2"/></label>
      </div>{user?.permissions.includes('school:manage')&&<Button label="Guardar institución" className="mt-3"
        onClick={()=>void updateInstitution()}/>}</section>}
    <section className="rounded-xl border border-gray-200 p-4"><h3 className="font-bold">Sedes</h3>
      <State busy={sitesBusy} error={sitesError} retry={()=>void reloadSites()}/>
      <ul className="mt-2 space-y-2 text-sm">{sites?.map(s=><li key={s.id} className="flex flex-wrap items-center gap-2">
        <span>{s.nombre}{s.activo?'':' · inactiva'}</span>
        {user?.roles.includes('SUPERADMIN')&&<><Button label="Editar" text size="small" onClick={()=>{
          setEditingSite(s);setEditingSiteName(s.nombre);}}/>
          <Button label={s.activo?'Desactivar':'Reactivar'} text size="small"
            onClick={()=>void updateSite(s.id,{activo:!s.activo})}/></>}
      </li>)}</ul>
      {editingSite&&<div className="mt-3 flex flex-wrap items-end gap-2"><label htmlFor="edit-site-name">Nombre de sede</label>
        <InputText id="edit-site-name" value={editingSiteName} maxLength={120}
          onChange={event=>setEditingSiteName(event.target.value)}/>
        <Button label="Guardar" disabled={editingSiteName.trim().length<2}
          onClick={()=>void updateSite(editingSite.id,{nombre:editingSiteName.trim()})}/>
        <Button label="Cancelar" outlined onClick={()=>setEditingSite(null)}/></div>}
      {user?.roles.includes('SUPERADMIN')&&<div className="mt-3 flex gap-2"><InputText aria-label="Nueva sede" value={siteName}
        onChange={e=>setSiteName(e.target.value)} placeholder="Nueva sede" className="rounded border p-2"/>
        <Button label="Agregar" disabled={siteName.trim().length<2} onClick={()=>void addSite()}/></div>}</section>
    <DataTable value={data??[]} dataKey="id" emptyMessage="No hay años lectivos." loading={busy}>
      <Column field="anio" header="Año"/><Column field="fecha_inicio" header="Inicio"/>
      <Column field="fecha_fin" header="Fin"/><Column header="Estado" body={(row:Year)=>row.activo?'Activo':'Preparación'}/>
      <Column header="Acciones" body={(row:Year)=><div className="flex gap-1"><Button label="Detalle" text size="small"
        onClick={()=>setSelectedYear(row.id)}/>{user?.permissions.includes('school:manage')&&!row.activo&&
        <Button label="Activar" text size="small" onClick={()=>void activate(row.id)}/>}</div>}/>
    </DataTable>
    {selectedYear&&<YearDetails id={selectedYear}/>}
    {user?.permissions.includes('school:manage')&&<section className="rounded-xl border border-gray-200 p-4">
      <h3 className="font-bold">Preparar año lectivo</h3><div className="mt-3 flex flex-wrap gap-3">
        <label className="text-sm">Año <InputText value={year} onChange={e=>setYear(e.target.value)} className="block w-24"/></label>
        <label className="text-sm">Inicio <input type="date" value={start} onChange={e=>setStart(e.target.value)} className="block rounded border p-2"/></label>
        <label className="text-sm">Fin <input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="block rounded border p-2"/></label>
        <Button label="Crear" disabled={!year||!start||!end} onClick={()=>void create()}/></div>
      <p className="mt-2 text-xs text-gray-600">Las personas y sus claves continúan entre años. La matrícula anual se gestionará en su módulo.</p>
    </section>}{message&&<p role="status">{message}</p>}</div>;
}

function NoticesPanel(){
  const {request,subscribeNotifications,user}=useCoreSession();const {data,busy,error,reload}=useLoad<Notice[]>('/notifications');
  const {data:unread,reload:reloadUnread}=useLoad<{count:number}>('/notifications/unread-count');
  const {data:preferences,reload:reloadPreferences}=useLoad<{categoria:string;por_correo:boolean}[]>('/notifications/preferences');
  const [search,setSearch]=useState('');const [recipients,setRecipients]=useState<DirectoryUser[]>([]);
  const [recipient,setRecipient]=useState('');const [category,setCategory]=useState('RECORDATORIO');
  const [title,setTitle]=useState('');const [body,setBody]=useState('');const [message,setMessage]=useState('');
  useEffect(()=>subscribeNotifications(()=>{void reload();void reloadUnread();}),[subscribeNotifications,reload,reloadUnread]);
  async function mark(id:string){await request(`/notifications/${id}/read`,{method:'PATCH'});await reload();await reloadUnread();}
  async function findRecipients(){
    try{const result=await request<{users:DirectoryUser[]}>(`/users?search=${encodeURIComponent(search)}`);
      setRecipients(result.users);}catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo buscar.');}
  }
  async function send(){
    setMessage('');try{await request('/notifications',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({userId:recipient,categoria:category,titulo:title,mensaje:body})});
      setMessage('Aviso creado. El correo se enviará si el destinatario lo tiene verificado y habilitado.');setTitle('');setBody('');}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo enviar.');}
  }
  const categories=['SEGURIDAD','RECORDATORIO','ASISTENCIA','NOTAS','TRAMITES','CITAS'];
  return <div><h2 className="mb-2 flex items-center gap-2 font-bold" aria-live="polite">
    <i className="pi pi-bell" aria-hidden="true"/> Avisos
    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-white" aria-label={`${unread?.count??0} avisos no leídos`}>
      {unread?.count??0}</span></h2><State busy={busy} error={error} retry={()=>{void reload();void reloadUnread();}}/>
    {data?.length===0&&<p className="p-4 text-sm text-gray-600">No hay avisos.</p>}
    <ul className="divide-y">{data?.map(n=><li key={n.id} className="flex flex-wrap items-start justify-between gap-3 py-4">
      <div><h3 className="font-bold">{n.titulo}</h3><p className="text-sm text-gray-700">{n.mensaje}</p>
        <p className="text-xs text-gray-500">{n.categoria} · {new Date(n.created_at).toLocaleString('es-PE')}</p></div>
      {!n.leida_en&&<Button label="Marcar leída" text size="small" onClick={()=>void mark(n.id)}/>}</li>)}</ul>
    <section className="mt-5 rounded-xl border p-4"><h3 className="font-bold">Correo por categoría</h3>
      <p className="text-xs text-gray-600">Los avisos permanecen en la bandeja aunque desactive el correo. El correo de seguridad es obligatorio.</p>
      <div className="mt-3 flex flex-wrap gap-4">{categories.map(c=><label key={c} className="flex gap-2 text-sm">
        <input type="checkbox" checked={c==='SEGURIDAD'||(preferences?.find(p=>p.categoria===c)?.por_correo??true)}
          disabled={c==='SEGURIDAD'}
          onChange={e=>void request(`/notifications/preferences/${c}`,{method:'PUT',
            headers:{'Content-Type':'application/json'},body:JSON.stringify({porCorreo:e.target.checked})})
            .then(()=>reloadPreferences()).catch(cause=>setMessage(String(cause)))}/>{c}</label>)}</div>
    </section>
    {user?.permissions.includes('notifications:send')&&<section className="mt-5 rounded-xl border p-4">
      <h3 className="font-bold">Enviar aviso</h3>
      <div className="mt-3 flex gap-2"><InputText value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="Buscar destinatario" aria-label="Buscar destinatario"/>
        <Button label="Buscar" outlined disabled={search.length<2} onClick={()=>void findRecipients()}/></div>
      <label className="mt-3 block text-sm">Destinatario<select className="block w-full rounded border p-2" value={recipient}
        onChange={e=>setRecipient(e.target.value)}><option value="">Seleccione</option>
        {recipients.map(r=><option key={r.id} value={r.id}>{r.nombres} {r.apellido_paterno} · {r.username}</option>)}
      </select></label>
      <label className="mt-3 block text-sm">Categoría<select className="block w-full rounded border p-2" value={category}
        onChange={e=>setCategory(e.target.value)}>{categories.map(c=><option key={c}>{c}</option>)}</select></label>
      <label htmlFor="notice-title" className="mt-3 block text-sm">Título</label>
      <InputText id="notice-title" value={title} onChange={e=>setTitle(e.target.value)} className="w-full"/>
      <label htmlFor="notice-message" className="mt-3 block text-sm">Mensaje</label>
      <textarea id="notice-message" value={body} onChange={e=>setBody(e.target.value)} className="w-full rounded border p-2" rows={3}/>
      <Button label="Enviar aviso" className="mt-3" disabled={!recipient||!title||!body} onClick={()=>void send()}/>
    </section>}{message&&<p role="status" className="mt-3 text-sm">{message}</p>}</div>;
}

function AuditPanel(){
  const {download,user}=useCoreSession();
  const [exportError,setExportError]=useState('');
  const [dni,setDni]=useState('');const [ip,setIp]=useState('');const [moduleFilter,setModuleFilter]=useState('');
  const [from,setFrom]=useState('');const [to,setTo]=useState('');
  const [applied,setApplied]=useState({dni:'',ip:'',modulo:'',desde:'',hasta:''});
  const [first,setFirst]=useState(0);
  const params=new URLSearchParams();
  for(const [key,value] of Object.entries(applied))if(value)params.set(key,value);
  const filterQuery=params.toString();
  params.set('limit','20');params.set('offset',String(first));
  const {data,busy,error,reload}=useLoad<{logs:AuditLog[];count:number}>(`/audit/logs?${params.toString()}`);
  const invalidDni=!!dni&&!/^\d{8}$/.test(dni);
  const invalidDates=!!from&&!!to&&from>to;
  function apply(){setFirst(0);setApplied({dni:dni.trim(),ip:ip.trim(),modulo:moduleFilter.trim(),
    desde:from?`${from}T00:00:00-05:00`:'',hasta:to?`${to}T23:59:59-05:00`:''});}
  function clear(){setDni('');setIp('');setModuleFilter('');setFrom('');setTo('');setFirst(0);
    setApplied({dni:'',ip:'',modulo:'',desde:'',hasta:''});}
  return <div><State busy={busy} error={error} retry={()=>void reload()}/>
    <section className="mb-4 grid gap-3 rounded-xl border p-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="text-sm">DNI del responsable<InputText value={dni} onChange={e=>setDni(e.target.value)}
        inputMode="numeric" maxLength={8} className="mt-1 w-full"/></label>
      <label className="text-sm">Dirección IP<InputText value={ip} onChange={e=>setIp(e.target.value)}
        maxLength={45} className="mt-1 w-full"/></label>
      <label className="text-sm">Módulo<InputText value={moduleFilter} onChange={e=>setModuleFilter(e.target.value)}
        maxLength={50} className="mt-1 w-full"/></label>
      <label className="text-sm">Desde<input type="date" value={from} onChange={e=>setFrom(e.target.value)}
        className="mt-1 w-full rounded border p-2"/></label>
      <label className="text-sm">Hasta<input type="date" value={to} onChange={e=>setTo(e.target.value)}
        className="mt-1 w-full rounded border p-2"/></label>
      <div className="flex flex-wrap gap-2 sm:col-span-2 lg:col-span-5">
        <Button label="Buscar" icon="pi pi-search" disabled={invalidDni||invalidDates} onClick={apply}/>
        <Button label="Limpiar" outlined onClick={clear}/>
      </div>
    </section>
    <p className="mb-2 text-sm" role="status">{data?.count??0} registros encontrados</p>
    {user?.permissions.includes('audit:export')&&<Button label="Exportar PDF" icon="pi pi-file-pdf" outlined
      onClick={()=>void download(`/audit/export.pdf${filterQuery?`?${filterQuery}`:''}`,'auditoria-core.pdf')
        .catch(cause=>setExportError(String(cause)))}/>}
    {exportError&&<p role="alert" className="text-sm text-red-700">{exportError}</p>}
    <DataTable value={data?.logs??[]} dataKey="id" loading={busy} paginator lazy first={first} rows={20}
      totalRecords={data?.count??0} onPage={event=>setFirst(event.first)}
      emptyMessage="No hay eventos de auditoría." scrollable>
      <Column field="id" header="ID"/><Column field="accion" header="Acción"/>
      <Column field="modulo" header="Módulo"/><Column field="usuario_id" header="Usuario"/>
      <Column header="Fecha" body={(row:AuditLog)=>new Date(row.timestamp_utc).toLocaleString('es-PE')}/>
    </DataTable></div>;
}

function RolesPanel(){
  const {request,user}=useCoreSession();
  const {data:roles,busy,error,reload}=useLoad<Role[]>('/users/roles');
  const {data:available}=useLoad<Permission[]>('/users/permissions');
  const [selected,setSelected]=useState<Role|null>(null);
  const [codes,setCodes]=useState<string[]>([]);
  const [reason,setReason]=useState('');const [message,setMessage]=useState('');
  const protectedCodes=new Set(['roles:manage','users:assign-roles','users:unmask','audit:read','audit:export']);
  async function save(){
    if(!selected)return;setMessage('');
    try{await request(`/users/roles/${selected.id}/permissions`,{method:'PUT',
      headers:{'Content-Type':'application/json'},body:JSON.stringify({permissions:codes,motivo:reason})});
      setMessage('Matriz actualizada. Las sesiones del rol deben iniciar sesión nuevamente.');await reload();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo guardar.');}
  }
  return <div className="space-y-4"><State busy={busy} error={error} retry={()=>void reload()}/>
    <DataTable value={roles??[]} dataKey="id" emptyMessage="No hay roles.">
      <Column field="nombre" header="Rol"/><Column header="Permisos" body={(r:Role)=>r.permisos.length}/>
      {user?.permissions.includes('roles:manage')&&<Column header="Acción" body={(r:Role)=><Button label="Editar"
        text disabled={r.codigo==='SUPERADMIN'} onClick={()=>{setSelected(r);setCodes(r.permisos);setReason('');}}/>}/>}
    </DataTable>
    {selected&&<section className="rounded-xl border p-4"><h3 className="font-bold">Permisos de {selected.nombre}</h3>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">{available?.filter(p=>!protectedCodes.has(p.codigo)).map(p=><label key={p.codigo} className="flex gap-2 text-sm">
        <input type="checkbox" checked={codes.includes(p.codigo)} onChange={e=>setCodes(value=>e.target.checked?
          [...value,p.codigo]:value.filter(x=>x!==p.codigo))}/><span>{p.descripcion} <code className="text-xs">{p.codigo}</code></span>
      </label>)}</div>
      <label htmlFor="role-reason" className="mt-4 block text-sm">Motivo del cambio</label>
      <InputText id="role-reason" value={reason} onChange={e=>setReason(e.target.value)} className="w-full"/>
      <Button label="Guardar matriz" disabled={reason.trim().length<10} className="mt-3" onClick={()=>void save()}/>
    </section>}{message&&<p role="status">{message}</p>}</div>;
}

function GuardiansPanel(){
  const {request}=useCoreSession();
  const {data:links,busy,error,reload}=useLoad<GuardianLink[]>('/guardians/links');
  const [query,setQuery]=useState('');const [persons,setPersons]=useState<Person[]>([]);
  const [guardian,setGuardian]=useState('');const [student,setStudent]=useState('');
  const [relationship,setRelationship]=useState('PADRE');
  const [message,setMessage]=useState('');
  async function search(){
    setMessage('');try{const found=await request<Person[]>(`/users/persons?search=${encodeURIComponent(query)}`);
      setPersons(previous=>Array.from(new Map([...previous,...found].map(p=>[p.id,p])).values()));}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo buscar.');}
  }
  async function action(path:string,method='POST',body:object={}){
    setMessage('');try{await request(path,{method,headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      setMessage('Operación completada.');await reload();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo completar.');}
  }
  return <div className="space-y-5"><State busy={busy} error={error} retry={()=>void reload()}/>
    <DataTable value={links??[]} dataKey="id" emptyMessage="No hay vínculos familiares." paginator rows={10}>
      <Column field="apoderado" header="Apoderado"/><Column field="estudiante" header="Estudiante"/>
      <Column field="parentesco" header="Vínculo"/><Column header="Estado" body={(r:GuardianLink)=>
        !r.activo?'Revocado':r.confirmado_en?'Confirmado':'Pendiente de aceptación'}/>
      <Column header="Acción" body={(r:GuardianLink)=><div className="flex gap-1">
        {r.activo&&<><Button label="Invitar" text size="small" onClick={()=>void action('/guardians/invitations','POST',
          {guardianId:r.apoderado_id,studentId:r.estudiante_id})}/>
          <Button label="Revocar" text size="small" severity="danger" onClick={()=>{
            if(window.confirm('¿Revocar este vínculo familiar?'))void action(`/guardians/links/${r.apoderado_id}/${r.estudiante_id}`,'DELETE');}}/></>}
      </div>}/>
    </DataTable>
    <section className="rounded-xl border p-4"><h3 className="font-bold">Vincular desde la ficha verificada</h3>
      <p className="mt-1 text-sm text-gray-600">El parentesco debe constar en la ficha del estudiante cargada por Matrícula.</p>
      <div className="mt-3 flex flex-wrap gap-2"><label htmlFor="person-search" className="sr-only">Buscar persona</label>
        <InputText id="person-search" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar persona por nombre"/>
        <Button label="Buscar" outlined disabled={query.trim().length<2} onClick={()=>void search()}/></div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm">Apoderado<select value={guardian} onChange={e=>setGuardian(e.target.value)} className="block w-full rounded border p-2">
          <option value="">Seleccione</option>{persons.map(p=><option key={p.id} value={p.id}>{p.nombres} {p.apellido_paterno} · ••••{p.documento_ultimos4||'—'}</option>)}
        </select></label>
        <label className="text-sm">Estudiante<select value={student} onChange={e=>setStudent(e.target.value)} className="block w-full rounded border p-2">
          <option value="">Seleccione</option>{persons.map(p=><option key={p.id} value={p.id}>{p.nombres} {p.apellido_paterno} · ••••{p.documento_ultimos4||'—'}</option>)}
        </select></label>
        <label className="text-sm">Parentesco<select value={relationship} onChange={e=>setRelationship(e.target.value)} className="block w-full rounded border p-2">
          <option value="PADRE">Padre</option><option value="MADRE">Madre</option><option value="TUTOR_LEGAL">Tutor legal</option></select></label>
      </div>
      <Button label="Crear vínculo" className="mt-3" disabled={!guardian||!student||guardian===student}
        onClick={()=>void action('/guardians/links','POST',{guardianId:guardian,studentId:student,parentesco:relationship})}/>
    </section>{message&&<p role="status">{message}</p>}</div>;
}

function ProfilePanel(){
  const {user,request,logout}=useCoreSession();
  const profile=useLoad<{nombres:string;apellido_paterno:string;email:string|null;
    username:string;telefono:string|null;foto_url:string|null}>('/users/me');
  const [current,setCurrent]=useState('');const [next,setNext]=useState('');
  const [phone,setPhone]=useState('');const [photo,setPhoto]=useState('');
  const [saving,setSaving]=useState(false);
  const [message,setMessage]=useState('');
  useEffect(()=>{if(profile.data){setPhone(profile.data.telefono??'');setPhoto(profile.data.foto_url??'');}},
    [profile.data]);
  async function saveProfile(){
    setSaving(true);setMessage('');
    try{await request('/users/me',{method:'PATCH',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({telefono:phone,fotoUrl:photo||undefined})});
      await profile.reload();setMessage('Perfil actualizado.');}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo actualizar el perfil.');}
    finally{setSaving(false);}
  }
  async function save(){
    setMessage('');try{await request('/users/me/change-password',{method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({actual:current,nueva:next})});await logout();}
    catch(cause){setMessage(cause instanceof Error?cause.message:'No se pudo cambiar la clave.');}
  }
  return <div className="max-w-xl space-y-3 text-sm">
    <State busy={profile.busy} error={profile.error} retry={()=>void profile.reload()}/>
    <p><strong>Nombre:</strong> {user?.fullName}</p><p><strong>Usuario:</strong> {user?.username}</p>
    <p><strong>Correo:</strong> {user?.email||'No registrado'}</p>
    <h3 className="pt-3 font-bold">Datos de contacto</h3>
    <label htmlFor="profile-phone" className="block">Teléfono</label>
    <InputText id="profile-phone" value={phone} maxLength={20} onChange={event=>setPhone(event.target.value)}
      className="w-full"/>
    <label htmlFor="profile-photo" className="block">URL de foto</label>
    <InputText id="profile-photo" value={photo} maxLength={1000} onChange={event=>setPhoto(event.target.value)}
      className="w-full"/>
    <Button label={saving?'Guardando…':'Guardar perfil'} disabled={saving||profile.busy}
      onClick={()=>void saveProfile()}/>
    <h3 className="pt-3 font-bold">Cambiar contraseña</h3>
    <label htmlFor="current-key" className="block">Clave actual</label>
    <input id="current-key" type="password" autoComplete="current-password" value={current}
      onChange={e=>setCurrent(e.target.value)} className="w-full rounded border p-2"/>
    <label htmlFor="new-key" className="block">Nueva clave</label>
    <input id="new-key" type="password" autoComplete="new-password" value={next}
      onChange={e=>setNext(e.target.value)} className="w-full rounded border p-2"/>
    <p className="text-xs text-gray-600">Mínimo 8 caracteres, una letra y un número. Cerrará todas sus sesiones.</p>
    <Button label="Cambiar clave" disabled={!current||!next} onClick={()=>void save()}/>
    {message&&<p role="status">{message}</p>}
  </div>;
}

export default function CoreModuleView(){
  const {user}=useCoreSession();
  return <div className="space-y-5"><Link href="/intranet" className="text-sm font-semibold text-brand">← Volver a la intranet</Link>
    <div><p className="text-xs font-bold uppercase text-brand">Squad 1 · Core y seguridad</p>
      <h1 className="text-2xl font-black text-brand-dark">Gestión institucional</h1></div>
    <TabView>
      {user?.permissions.includes('users:read')&&<TabPanel header="Usuarios"><UsersPanel/></TabPanel>}
      {user?.permissions.includes('school:read')&&<TabPanel header="Año lectivo"><SchoolPanel/></TabPanel>}
      <TabPanel header="Avisos"><NoticesPanel/></TabPanel>
      {user?.permissions.includes('audit:read')&&<TabPanel header="Auditoría"><AuditPanel/></TabPanel>}
      {user?.permissions.includes('roles:read')&&<TabPanel header="Roles"><RolesPanel/></TabPanel>}
      {user?.permissions.includes('guardians:manage')&&<TabPanel header="Apoderados"><GuardiansPanel/></TabPanel>}
      <TabPanel header="Mi perfil"><ProfilePanel/></TabPanel>
    </TabView>
  </div>;
}
