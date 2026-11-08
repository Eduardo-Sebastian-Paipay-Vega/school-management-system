import 'dotenv/config';
import { TenantControlService } from '../services/tenant-control.service';

function required(name: string): string {
  const value=process.env[name]?.trim();
  if(!value)throw new Error(`${name} es obligatorio.`);
  return value;
}

async function main(): Promise<void> {
  const action=process.argv[2];
  if(!['provision','invite-admin','suspend','reactivate','configure'].includes(action))
    throw new Error('Uso: tenant:control provision|invite-admin|suspend|reactivate|configure');
  const control=await TenantControlService.connect();
  try {
    const reason=required('OPERATOR_REASON');
    if(action==='provision') {
      const tenantId=await control.provision({requestId:required('TENANT_REQUEST_ID'),
        code:required('TENANT_CODE'),name:required('TENANT_NAME'),reason,
        firstAdmin:{firstName:required('FIRST_ADMIN_FIRST_NAME'),
          lastName:required('FIRST_ADMIN_LAST_NAME'),email:required('FIRST_ADMIN_EMAIL'),
          dni:required('FIRST_ADMIN_DNI')}});
      process.stdout.write(`Tenant aprovisionando: ${tenantId}. Falta invitación explícita.\n`);
    } else if(action==='invite-admin') {
      await control.inviteAdmin(required('TENANT_ID'),required('TENANT_CODE'),reason,
        {firstName:required('FIRST_ADMIN_FIRST_NAME'),lastName:required('FIRST_ADMIN_LAST_NAME'),
          email:required('FIRST_ADMIN_EMAIL'),dni:required('FIRST_ADMIN_DNI')});
      process.stdout.write('Administrador invitado; tenant activo.\n');
    } else if(action==='suspend') {
      const changed=await control.suspend(required('TENANT_ID'),reason);
      process.stdout.write(changed?'Tenant suspendido.\n':'Tenant ya suspendido.\n');
    } else if(action==='reactivate') {
      const changed=await control.reactivate(required('TENANT_ID'),reason);
      process.stdout.write(changed?'Tenant reactivado.\n':'Tenant ya activo.\n');
    } else {
      const origins=process.env.TENANT_ALLOWED_ORIGINS?.split(',').map(v=>v.trim()).filter(Boolean)??[];
      await control.configure(required('TENANT_ID'),reason,origins,
        process.env.TENANT_MAIL_FROM?.trim()||null,
        Number(required('TENANT_RATE_LIMIT_RPM')),Number(required('TENANT_JOB_LIMIT')));
      process.stdout.write('Configuración operativa actualizada.\n');
    }
  } finally { await control.close(); }
}

main().catch(cause=>{console.error(cause instanceof Error?cause.message:cause);process.exitCode=1;});
