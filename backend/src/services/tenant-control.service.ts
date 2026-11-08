import { Client } from 'pg';
import { assertIdentityKeys, documentHash, encryptDocument, randomToken, tokenHash } from '../core/identity-crypto';
import { sendAccessLink } from './mail.service';

export interface ProvisionTenantInput {
  requestId: string;
  code: string;
  name: string;
  reason: string;
  firstAdmin: { firstName: string; lastName: string; email: string; dni: string };
}

/** Plano de control: conexión exclusiva, sin acceso SQL a tablas escolares. */
export class TenantControlService {
  private constructor(private readonly client: Client, private readonly operator: string) {}

  static async connect(): Promise<TenantControlService> {
    const url = process.env.OPERATOR_DATABASE_URL;
    if (!url || url === process.env.DATABASE_URL) {
      throw new Error('OPERATOR_DATABASE_URL debe usar una credencial exclusiva del operador.');
    }
    const client = new Client({ connectionString: url });
    await client.connect();
    try {
      const result = await client.query<{ operator: string; valid: boolean }>(`
        SELECT session_user AS operator,
          pg_has_role(current_user,'sms_operator','USAGE')
          AND NOT r.rolsuper AND NOT r.rolbypassrls
          AND NOT has_table_privilege(current_user,'personas','SELECT')
          AND NOT has_table_privilege(current_user,'usuarios','SELECT')
          AND NOT has_table_privilege(current_user,'logs_auditoria','SELECT') AS valid
        FROM pg_roles r WHERE r.rolname=current_user`);
      if (!result.rows[0]?.valid || result.rows[0].operator !== process.env.OPERATOR_ID) {
        throw new Error('La credencial del operador no es válida o no coincide con OPERATOR_ID.');
      }
      return new TenantControlService(client, result.rows[0].operator);
    } catch (cause) { await client.end(); throw cause; }
  }

  async close(): Promise<void> { await this.client.end(); }

  async provision(input: ProvisionTenantInput): Promise<string> {
    if (!/^[0-9a-f-]{36}$/i.test(input.requestId) || !/^[0-9A-Za-z-]{1,10}$/.test(input.code) ||
      input.name.trim().length < 3 || input.reason.trim().length < 10 ||
      !/^[0-9]{8}$/.test(input.firstAdmin.dni) ||
      !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(input.firstAdmin.email)) {
      throw new Error('Datos de provisión inválidos.');
    }
    assertIdentityKeys();
    const created = await this.client.query<{ id: string }>(
      `SELECT fn_operador_provisionar($1,$2,$3,$4,$5) AS id`,
      [input.requestId,input.code,input.name,this.operator,input.reason]);
    const tenantId=created.rows[0].id;
    await this.client.query(
      `SELECT fn_operador_preparar_admin($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [tenantId,this.operator,input.reason,input.firstAdmin.firstName,input.firstAdmin.lastName,
        input.firstAdmin.email.toLowerCase(),documentHash(input.firstAdmin.dni),
        encryptDocument(input.firstAdmin.dni),input.firstAdmin.dni.slice(-4),null]);
    return tenantId;
  }

  async inviteAdmin(tenantId: string, code: string, reason: string,
    admin: { firstName: string; lastName: string; email: string; dni: string }): Promise<void> {
    if (!/^[0-9A-Za-z-]{1,10}$/.test(code) || reason.trim().length<10 ||
      !/^[0-9]{8}$/.test(admin.dni) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(admin.email)) {
      throw new Error('Datos del primer administrador inválidos.');
    }
    assertIdentityKeys();
    const token=randomToken();
    await this.client.query(
      `SELECT fn_operador_preparar_admin($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [tenantId,this.operator,reason,admin.firstName,admin.lastName,
        admin.email.toLowerCase(),documentHash(admin.dni),
        encryptDocument(admin.dni),admin.dni.slice(-4),tokenHash(token)]);
    // El tenant sigue APROVISIONANDO si SMTP falla; repetir la misma solicitud crea un enlace nuevo.
    await sendAccessLink(admin.email,code,token,'ACTIVACION');
    await this.client.query(`SELECT fn_operador_cambiar_estado($1,'ACTIVO',$2,$3)`,
      [tenantId,this.operator,reason]);
  }

  async suspend(tenantId: string, reason: string): Promise<boolean> {
    return this.changeState(tenantId,'SUSPENDIDO',reason);
  }

  async reactivate(tenantId: string, reason: string): Promise<boolean> {
    return this.changeState(tenantId,'ACTIVO',reason);
  }

  private async changeState(tenantId: string, state: 'SUSPENDIDO'|'ACTIVO', reason: string): Promise<boolean> {
    const result=await this.client.query<{ changed: boolean }>(
      'SELECT fn_operador_cambiar_estado($1,$2,$3,$4) AS changed',
      [tenantId,state,this.operator,reason]);
    return result.rows[0].changed;
  }

  async configure(tenantId: string, reason: string, origins: string[], from: string|null,
    rpm: number, jobs: number): Promise<void> {
    await this.client.query('SELECT fn_operador_configurar($1,$2,$3,$4,$5,$6,$7)',
      [tenantId,this.operator,reason,origins,from,rpm,jobs]);
  }
}
