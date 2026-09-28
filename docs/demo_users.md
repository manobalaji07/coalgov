# CoalGov AI Demo Logins & User Roles

The following 5 pre-configured demo user accounts represent each key stakeholder persona in Coal India Limited governance workflow:

| Role | Email | Password | Full Name | Scope / Permissions |
|---|---|---|---|---|
| **Field Inspector** | `inspector@coalgov.in` | `inspector123` | Rajeswar Sharma | Mobile PWA, Geo-tagged observations, Offline Sync, Safety checklists |
| **Mine Manager** | `manager@coalgov.in` | `manager123` | Aman Verma | Mine-level KPI Dashboard, CAPA assignment, Verification & closure |
| **Corporate Director** | `corporate@coalgov.in` | `corporate123` | Sunita Rao | Multi-mine comparisons, National GIS Map, Subsidiary risk analytics |
| **Regulator / DGMS** | `regulator@coalgov.in` | `regulator123` | DGMS Inspector Team | Read-only compliance portal, Verified audit ledger, Statutory PDF export |
| **System Admin** | `admin@coalgov.in` | `admin123` | System Administrator | Full organization configuration, User management, Tamper simulation demo |

---

## Quick API Test Command
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "manager@coalgov.in", "password": "manager123"}'
```
