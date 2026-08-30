import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
const roleSeed = [
    { name: 'SuperAdmin', description: 'Platform-wide facility administrator' },
    { name: 'HospitalAdmin', description: 'Facility-level system administrator' },
    { name: 'Doctor', description: 'Medical practitioner' },
    { name: 'Nurse', description: 'Clinical assistant and nursing staff' },
    { name: 'Receptionist', description: 'Appointment and front-desk operations' },
    { name: 'LabTech', description: 'Laboratory test technician' },
    { name: 'LabManager', description: 'Laboratory operations manager' },
    { name: 'PharmTech', description: 'Pharmacy dispensing technician' },
    { name: 'PharmacyManager', description: 'Pharmacy operations manager' },
    { name: 'Auditor', description: 'Compliance and audit review' },
    { name: 'Accountant', description: 'Finance and billing support' },
    { name: 'FinanceManager', description: 'Finance team manager' },
    { name: 'RecordsOfficer', description: 'Records management officer' },
    { name: 'RecordsManager', description: 'Records operations manager' },
    { name: 'Patient', description: 'Patient portal user' },
];
const permissions = [
    { resource: '*', action: '*' },
    { resource: 'user', action: 'create' },
    { resource: 'user', action: 'update' },
    { resource: 'role', action: 'grant' },
    { resource: 'patient_record', action: 'read' },
    { resource: 'patient_record', action: 'update' },
    { resource: 'patient_record', action: 'create' },
    { resource: 'patient_record', action: 'delete' },
    { resource: 'prescription', action: 'create' },
    { resource: 'prescription', action: 'read' },
    { resource: 'lab_order', action: 'create' },
    { resource: 'lab_order', action: 'read' },
    { resource: 'lab_result', action: 'create' },
    { resource: 'lab_result', action: 'update' },
    { resource: 'lab_result', action: 'read' },
    { resource: 'lab_tech', action: 'manage' },
    { resource: 'vitals', action: 'create' },
    { resource: 'appointment', action: 'create' },
    { resource: 'appointment', action: 'update' },
    { resource: 'dispense', action: 'create' },
    { resource: 'inventory', action: '*' },
    { resource: 'audit_log', action: 'read' },
    { resource: 'invoice', action: 'create' },
    { resource: 'invoice', action: 'read' },
    { resource: 'invoice', action: 'update' },
    { resource: 'invoice', action: 'delete' },
    { resource: 'invoice', action: 'approve' },
    { resource: 'payment', action: 'create' },
    { resource: 'payment', action: 'approve' },
    { resource: 'financial_report', action: 'read' },
    { resource: 'records_officer', action: 'manage' },
    { resource: 'own_record', action: 'read' },
    { resource: 'own_appointment', action: 'create' },
    { resource: 'own_appointment', action: 'read' },
];
async function main() {
    for (const role of roleSeed) {
        await prisma.role.upsert({
            where: { name: role.name },
            update: {},
            create: { name: role.name, description: role.description, isSystem: true },
        });
    }
    for (const permission of permissions) {
        await prisma.permission.upsert({
            where: { resource_action: { resource: permission.resource, action: permission.action } },
            update: {},
            create: permission,
        });
    }
    const allRoles = await prisma.role.findMany();
    const allPermissions = await prisma.permission.findMany();
    for (const role of allRoles) {
        const assignments = new Map();
        const roleName = role.name;
        switch (roleName) {
            case 'SuperAdmin':
                assignments.set('*:*', true);
                break;
            case 'HospitalAdmin':
                assignments.set('user:create', true);
                assignments.set('user:update', true);
                assignments.set('role:grant', true);
                assignments.set('patient_record:read', true);
                assignments.set('patient_record:update', true);
                break;
            case 'Doctor':
                assignments.set('patient_record:read', true);
                assignments.set('patient_record:update', true);
                assignments.set('prescription:create', true);
                assignments.set('lab_order:create', true);
                break;
            case 'Nurse':
                assignments.set('patient_record:read', true);
                assignments.set('patient_record:update', true);
                assignments.set('vitals:create', true);
                break;
            case 'Receptionist':
                assignments.set('appointment:create', true);
                assignments.set('appointment:update', true);
                assignments.set('patient_record:read', true);
                break;
            case 'LabTech':
                assignments.set('lab_result:create', true);
                assignments.set('lab_result:update', true);
                assignments.set('lab_order:read', true);
                break;
            case 'LabManager':
                assignments.set('lab_result:*', true);
                assignments.set('lab_order:read', true);
                assignments.set('lab_tech:manage', true);
                break;
            case 'PharmTech':
                assignments.set('prescription:read', true);
                assignments.set('dispense:create', true);
                break;
            case 'PharmacyManager':
                assignments.set('prescription:*', true);
                assignments.set('inventory:*', true);
                break;
            case 'Auditor':
                assignments.set('patient_record:read', true);
                assignments.set('audit_log:read', true);
                break;
            case 'Accountant':
                assignments.set('invoice:create', true);
                assignments.set('invoice:read', true);
                assignments.set('payment:create', true);
                break;
            case 'FinanceManager':
                assignments.set('invoice:*', true);
                assignments.set('payment:approve', true);
                assignments.set('financial_report:read', true);
                break;
            case 'RecordsOfficer':
                assignments.set('patient_record:create', true);
                assignments.set('patient_record:read', true);
                assignments.set('patient_record:update', true);
                break;
            case 'RecordsManager':
                assignments.set('patient_record:*', true);
                assignments.set('records_officer:manage', true);
                break;
            case 'Patient':
                assignments.set('own_record:read', true);
                assignments.set('own_appointment:create', true);
                assignments.set('own_appointment:read', true);
                break;
            default:
                break;
        }
        for (const [key, value] of assignments.entries()) {
            if (!value)
                continue;
            const [resource, action] = key.split(':');
            const permission = allPermissions.find((item) => item.resource === resource && item.action === action);
            if (!permission)
                continue;
            await prisma.rolePermission.upsert({
                where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
                update: {},
                create: { roleId: role.id, permissionId: permission.id },
            });
        }
    }
    console.log('✅ Seeded HMS roles and permissions.');
}
main()
    .catch((error) => {
    console.error(error);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map