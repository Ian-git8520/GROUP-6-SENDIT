# JWT Cookie Authentication Implementation

## Overview
Implemented secure JWT authentication using HTTP-only cookies with CSRF protection via SameSite + double-submit token pattern.

## Backend Changes

### 1. **app.py**
- Added Flask-Session configuration
- Set up JWT HTTP-only cookie with settings:
  - `SESSION_COOKIE_HTTPONLY = True` (prevents XSS attacks)
  - `SESSION_COOKIE_SAMESITE = 'Lax'` (CSRF protection)
  - `PERMANENT_SESSION_LIFETIME = 86400` (24 hours)
- Enabled CORS with `supports_credentials=True`
- Added `Logout` endpoint at `/auth/logout`

### 2. **resources/auth.py**
- **Register endpoint**: Sets JWT in `auth_token` cookie + returns CSRF token
- **Login endpoint**: Sets JWT in `auth_token` cookie + returns CSRF token
- **Logout endpoint**: Clears both `auth_token` and `csrf_token` cookies
- Uses `make_response()` to set secure cookies

### 3. **utils/auth.py**
- Updated `extract_token()` to read from:
  1. Authorization header (`Bearer <token>`)
  2. HTTP-only `auth_token` cookie (fallback)
- Added `validate_csrf_token()` for double-submit pattern validation
- Extended token expiration to 24 hours

### 4. **requirements.txt**
- Added `Flask-Session==0.5.0` dependency

## Frontend Changes

### 1. **Login.jsx**
- Updated login request with `credentials: 'include'` to send/receive cookies
- Stores CSRF token from response in localStorage
- Removed token from storage (now in HTTP-only cookie)
- Profile fetch now uses `credentials: 'include'`

### 2. **api.js** (Refactored)
- Added `getCSRFToken()` - retrieves CSRF token from localStorage
- Added `getAuthHeaders()` - includes CSRF token header for POST/PATCH requests
- Added `getFetchOptions()` - centralized fetch config with credentials & CSRF
- Updated all API endpoints (login, register, logout, profile, delivery, users, riders)
- **New endpoint**: `authAPI.logout()` - calls `/auth/logout` and clears storage

## Security Features

### HTTP-Only Cookies
✅ JWT stored in HTTP-only cookie (`auth_token`)
- Prevents JavaScript from accessing token (XSS protection)
- Automatically sent with every request to same domain

### CSRF Protection (Double-Submit Pattern)
✅ Two-token approach:
1. **HTTP-Only Cookie**: `auth_token` (sent automatically)
2. **Non-HTTP-Only Cookie**: `csrf_token` (readable by JS)
3. **Header Check**: Frontend sends CSRF token in `X-CSRF-Token` header
- Backend validates both tokens match
- `SameSite=Lax` prevents cross-site cookie sending

### CORS Security
✅ `supports_credentials=True` enables cookie sending across origins
✅ Specific origin whitelist (localhost:3000)

## Usage

### Login Flow
```
1. Frontend: POST /auth/login with credentials
2. Backend: Sets auth_token & csrf_token cookies, returns csrf_token in JSON
3. Frontend: Stores csrf_token in localStorage
4. All subsequent requests: Cookies auto-sent, CSRF token in X-CSRF-Token header
```

### Logout Flow
```
1. Frontend: Call authAPI.logout()
2. Backend: Clears auth_token & csrf_token cookies
3. Frontend: Clears localStorage
```

### Protected Requests
All API calls now use `getFetchOptions()` which:
- Includes `credentials: 'include'` (sends cookies)
- Adds `X-CSRF-Token` header (for POST/PATCH)
- Automatically includes auth headers

## Production Checklist
- [ ] Set `SESSION_COOKIE_SECURE = True` (requires HTTPS)
- [ ] Update CORS origins to production domains
- [ ] Set `SESSION_COOKIE_SECURE = True` in auth.py cookies
- [ ] Use environment variables for SECRET_KEY
- [ ] Enable proper HTTPS
- [ ] Configure session storage (database instead of filesystem)

## Backward Compatibility
✅ `extract_token()` still supports Authorization header for existing clients
✅ Can be transitioned gradually if needed
