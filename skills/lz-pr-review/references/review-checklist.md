# Review Checklist — Deep Reference

This is the complete review checklist loaded during Phase 5. The SKILL.md references this file
to keep the main workflow under 500 lines.

## Security Checklist

### Authentication & Authorization
- [ ] New endpoints require authentication
- [ ] Authorization checks match the documented role model
- [ ] No privilege escalation paths (horizontal or vertical)
- [ ] Session tokens not leaked in URLs or logs
- [ ] CORS configuration not overly permissive

### Input Validation
- [ ] All user input sanitized before use
- [ ] SQL injection: parameterized queries only (no string interpolation)
- [ ] XSS: output encoding applied in templates
- [ ] Path traversal: no user-controlled file paths without validation
- [ ] Deserialization: no untrusted data deserialized into objects

### Secrets & Credentials
- [ ] No API keys, passwords, or tokens in the diff
- [ ] No hardcoded credentials (check for `password =`, `secret =`, `token =`)
- [ ] Environment variables used for sensitive configuration
- [ ] `.env` files not committed (check `.gitignore`)

### Data Protection
- [ ] PII not logged or exposed in error messages
- [ ] Sensitive data encrypted at rest and in transit
- [ ] Database queries do not leak data across tenant boundaries

## Performance Checklist

### Database
- [ ] No N+1 query patterns (eager loading used where needed)
- [ ] Indexes exist for new query patterns
- [ ] Bulk operations used instead of row-by-row processing
- [ ] Large result sets paginated
- [ ] No `SELECT *` on wide tables

### Memory & CPU
- [ ] No unbounded collections (arrays/lists that grow without limit)
- [ ] Streams/iterators used for large data processing
- [ ] No blocking operations on the main/event loop
- [ ] Connection pools configured with limits

### Network & I/O
- [ ] Timeouts set on all external HTTP/gRPC calls
- [ ] Retry logic includes exponential backoff and jitter
- [ ] Circuit breaker patterns for unreliable dependencies
- [ ] Response compression enabled for large payloads

## Reliability Checklist

### Error Handling
- [ ] Errors not silently swallowed (no empty catch blocks)
- [ ] Error messages actionable (not just "Something went wrong")
- [ ] Structured logging with correlation IDs
- [ ] Graceful degradation for non-critical failures

### State Management
- [ ] Database transactions have appropriate isolation levels
- [ ] Idempotency keys for mutation operations
- [ ] Distributed locks used where concurrent modification possible
- [ ] Cache invalidation strategy documented

### Deployment Safety
- [ ] Feature flags for risky changes
- [ ] Database migrations are backwards-compatible (or deployed separately)
- [ ] Health check endpoints updated for new dependencies
- [ ] Rollback plan exists (and is documented if complex)

## Code Quality Checklist

### Structure
- [ ] Single Responsibility Principle followed
- [ ] Functions/methods ≤ 50 lines (approximate, not absolute)
- [ ] Cyclomatic complexity reasonable (no deeply nested if/else trees)
- [ ] Dead code removed (not just commented out)

### Naming & Conventions
- [ ] Names follow project conventions (camelCase vs snake_case)
- [ ] Boolean variables/functions read as yes/no questions (`isValid`, `hasPermission`)
- [ ] Constants extracted for magic numbers/strings
- [ ] Abbreviated names spelled out (`usr` → `user`, `mgr` → `manager`)

### Documentation
- [ ] Public APIs have JSDoc/docstrings
- [ ] Complex business logic has inline comments explaining "why"
- [ ] README updated if public-facing behavior changed
- [ ] Breaking changes documented in migration guide or changelog

## Test Coverage Checklist

### Unit Tests
- [ ] Happy path tested
- [ ] Error paths tested (invalid input, network failure, timeout)
- [ ] Boundary values tested (empty, null, max, min)
- [ ] Test names describe behavior, not implementation

### Integration Tests
- [ ] API endpoints tested end-to-end
- [ ] Database interactions tested (not mocked) where critical
- [ ] External service interactions use mocks/stubs

### Test Quality
- [ ] Tests are deterministic (no flaky/time-dependent tests)
- [ ] Tests don't depend on execution order
- [ ] Assertions are specific (not just "response is 200")
- [ ] Test data factories/fixtures used (not hardcoded across tests)

## Language-Specific Patterns

### JavaScript/TypeScript
- [ ] `===` used instead of `==`
- [ ] Promise rejections handled (`.catch()` or try/catch with async/await)
- [ ] No `any` type unless documented justification
- [ ] Event listeners cleaned up (removeEventListener, unsubscribe)

### Python
- [ ] Context managers (`with`) used for resource management
- [ ] f-strings or `.format()` over `%` formatting
- [ ] Type hints on function signatures
- [ ] No mutable default arguments

### Go
- [ ] Errors returned, not panicked
- [ ] Context propagated through call chains
- [ ] Goroutines have lifecycle management (context cancellation)
- [ ] `defer` used for cleanup

### Java/Kotlin
- [ ] Null safety annotations or Optional types used
- [ ] Resources closed (try-with-resources / use)
- [ ] Thread safety documented for shared mutable state
- [ ] Lombok/data classes used to reduce boilerplate

### SQL/Migrations
- [ ] Migrations are reversible (have `down` method)
- [ ] No destructive changes without data backup plan
- [ ] Indexes created CONCURRENTLY if on large tables (PostgreSQL)
- [ ] Default values provided for new non-nullable columns
