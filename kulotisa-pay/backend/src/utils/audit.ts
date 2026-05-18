import { query } from './db';
export const auditLog = async (
  entityType: string, entityId: string, action: string,
  performedBy?: string, oldValue?: any, newValue?: any, ip?: string
) => {
  try {
    await query(
      `INSERT INTO audit_log (entity_type,entity_id,action,performed_by,old_value,new_value,ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [entityType, entityId, action, performedBy||null,
       oldValue ? JSON.stringify(oldValue) : null,
       newValue ? JSON.stringify(newValue) : null, ip||null]
    );
  } catch(e){ console.error('Audit log failed:',e); }
};
