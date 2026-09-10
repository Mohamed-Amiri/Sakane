# Test Users for Sakane

## Test Credentials
Seeded by `src/main/resources/data.sql` on every boot (H2 in-memory, `create-drop` —
anything created at runtime is lost on restart, the seed users are always recreated).

### Demo accounts (password: **Password1!**)
- Email: `tenant@example.com` — Amiri Mohamed — LOCATAIRE (tenant)
- Email: `owner@example.com` — Jean Dupont — PROPRIETAIRE (owner)

These are the accounts wired to the **Demo accounts** chips on the login page.

### Other users (password: **Password123!**)
`marie@example.com` (tenant), `ahmed@example.com` (owner), `fatima@example.com` (tenant),
`youssef@example.com` (owner), `sara@example.com` (tenant), `karim@example.com` (tenant)

## Testing the Flow

1. **Register a new user** with any email and the role you want to test
2. **Login** with the credentials above to test existing users
3. **Check routing** - each role should redirect to the appropriate home:
   - Tenant → `/`
   - Owner → `/owner/dashboard`

## Password Requirements
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one digit
- At least one special character (!@#$%^&*(),.?":{}|<>)
