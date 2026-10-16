# Application Security & Zero-Trust Review Reference (`layer-security.md`)

**Discipline:** Application Security (AppSec), Zero-Trust Architecture & Data Protection  
**Canonical Sources:** OWASP Top 10 (2021/2025), OWASP ASVS v4.0  
**Prefix:** `sec-`

---

## Rule Catalog by Impact

### 1. Broken Access Control & Injection (CRITICAL)

#### `sec-authz-idor`
- **Impact:** CRITICAL
- **Why:** Insecure Direct Object Reference (IDOR) allows an authenticated user to read or modify resources belonging to another user or tenant simply by changing the ID in the request.
- **Incorrect:**
  ```typescript
  app.get('/api/documents/:id', async (req, res) => {
    // ❌ Missing tenant or owner authorization check!
    const doc = await db.documents.findUnique({ where: { id: req.params.id } });
    res.json(doc);
  });
  ```
- **Correct:**
  ```typescript
  app.get('/api/documents/:id', async (req, res) => {
    // ✅ Scope query by current session's tenant/user
    const doc = await db.documents.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId }
    });
    if (!doc) return res.status(404).json({ error: 'Not found' });
    res.json(doc);
  });
  ```
- **Remedy:** Always scope entity access queries by authenticated session context (`tenantId` / `userId`).

#### `sec-inject-sqli`
- **Impact:** CRITICAL
- **Why:** Interpolating strings into SQL queries allows attackers to execute arbitrary database commands, dump entire databases, or bypass auth.
- **Incorrect:**
  ```typescript
  const query = `SELECT * FROM users WHERE email = '${req.body.email}'`;
  await db.query(query); // ❌ Vulnerable to SQL Injection!
  ```
- **Correct:**
  ```typescript
  const query = `SELECT * FROM users WHERE email = $1`;
  await db.query(query, [req.body.email]); // ✅ Parameterized
  ```
- **Remedy:** Enforce parameterized queries or ORM query builders.

#### `sec-inject-ssrf`
- **Impact:** CRITICAL
- **Why:** Fetching user-provided URLs allows attackers to query internal cloud metadata endpoints (`169.254.169.254`) or scan private VPC services.
- **Incorrect:**
  ```typescript
  app.post('/api/webhook-test', async (req, res) => {
    // ❌ Attacker passes http://169.254.169.254/latest/meta-data/iam/security-credentials/
    const data = await fetch(req.body.targetUrl);
  });
  ```
- **Correct:**
  ```typescript
  // Validate protocol, resolve DNS, and block private IP ranges (RFC 1918, link-local)
  const ip = await resolveDns(url.hostname);
  if (isPrivateIp(ip)) throw new SecurityException('Target IP is not permitted');
  const data = await safeFetch(url);
  ```
- **Remedy:** Validate against private IP ranges and cloud metadata endpoints before fetching remote URLs.

---

### 2. Information Disclosure & Secrets (CRITICAL)

#### `sec-leak-secret`
- **Impact:** CRITICAL
- **Why:** Hardcoding API keys, passwords, or tokens in source code exposes credentials permanently in Git commit history.
- **Incorrect:**
  ```typescript
  const client = new ApiClient({ apiKey: 'HARDCODED_API_SECRET_KEY' });
  ```
- **Correct:**
  ```typescript
  const client = new ApiClient({ apiKey: process.env.API_SECRET_KEY! });
  ```
- **Remedy:** Load credentials from environment variables or secrets manager (AWS Secrets Manager / Vault).

#### `sec-leak-pii-logging`
- **Impact:** CRITICAL
- **Why:** Logging raw request payloads or error dumps containing passwords, credit card numbers, or PII violates GDPR/HIPAA/PCI-DSS and leaks data to observability log collectors.
- **Incorrect:**
  ```typescript
  logger.info('User login payload:', req.body); // ❌ Logs plaintext password!
  ```
- **Correct:**
  ```typescript
  logger.info('User login attempt', { email: maskEmail(req.body.email), ip: req.ip });
  ```
- **Remedy:** Mask or redact sensitive fields before sending payloads to loggers.

---

### 3. Authentication & Input Integrity (HIGH)

#### `sec-authn-missing-check`
- **Impact:** HIGH
- **Why:** Forgetting authentication middleware on newly introduced routes leaves endpoints publicly accessible.
- **Incorrect:**
  ```typescript
  // Missing auth middleware on sensitive endpoint
  router.post('/api/admin/reindex', adminController.reindex);
  ```
- **Correct:**
  ```typescript
  router.post('/api/admin/reindex', requireAuth, requireRole('ADMIN'), adminController.reindex);
  ```
- **Remedy:** Enforce global secure-by-default routing or explicit authentication gates.

#### `sec-data-mass-assignment`
- **Impact:** HIGH
- **Why:** Passing unvalidated `req.body` directly to database models allows attackers to overwrite administrative fields like `role = 'admin'` or `is_verified = true`.
- **Incorrect:**
  ```typescript
  await db.users.update({ where: { id }, data: req.body }); // ❌ Attacker can pass { role: 'SUPERUSER' }
  ```
- **Correct:**
  ```typescript
  // Whitelist explicitly accepted fields
  const { displayName, bio } = req.body;
  await db.users.update({ where: { id }, data: { displayName, bio } });
  ```
- **Remedy:** Whitelist updateable fields explicitly via DTO or schema validator (Zod / Joi).
