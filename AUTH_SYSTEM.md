# Authentication System Setup & Usage

## Overview
The authentication system uses:
- **Database**: MySQL with `users` and `sessions` tables
- **Password**: `password_hash()` with `PASSWORD_DEFAULT` (bcrypt)
- **Authentication**: JWT (JSON Web Tokens) with HS256
- **Token Lifetime**: 6 hours
- **Security**: Prepared statements, HTTPS-ready, IP logging

## Database Schema

### users table
```sql
CREATE TABLE users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('Superadmin','Admin','Author') DEFAULT 'Admin',
  status ENUM('active','disabled') DEFAULT 'active',
  last_login DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### sessions table (optional, for audit logging)
```sql
CREATE TABLE sessions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  session_token VARCHAR(500) NOT NULL,
  user_agent VARCHAR(500),
  ip_address VARCHAR(45),
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Default Users (Created on Setup)

| Email | Password | Role |
|-------|----------|------|
| admin@smpmuh35.sch.id | Admin123! | Superadmin |
| adminstaff@smpmuh35.sch.id | AdminStaff123! | Admin |
| postmaker@smpmuh35.sch.id | PostMaker123! | Author |

## Setup Instructions

### 1. Initialize Database
```bash
# Run migration + seed script
curl -X POST http://localhost/api/setup/init.php
```

Or manually:
```bash
# Create schema
curl -X POST http://localhost/api/db_migrate.php

# Seed users
curl -X POST http://localhost/api/db_seed_users.php
```

### 2. Configure JWT Secret
Edit `public/api/config.local.php`:
```php
return [
  'db' => [
    'host' => 'localhost',
    'name' => 'smpmuh35',
    'user' => 'dbuser',
    'pass' => 'dbpass',
    'charset' => 'utf8mb4'
  ],
  'jwt_secret' => 'your-secure-random-secret-key-here',
  // ... rest of config
];
```

Or set environment variable:
```bash
export JWT_SECRET="your-secure-secret"
```

## API Endpoints

### POST /api/auth/login.php
Login with email and password.

**Request:**
```json
{
  "email": "admin@smpmuh35.sch.id",
  "password": "Admin123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "user": {
      "id": 1,
      "name": "Super Administrator",
      "email": "admin@smpmuh35.sch.id",
      "role": "Superadmin"
    }
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "data": []
}
```

### GET /api/auth/verify.php
Verify token validity and get user data.

**Request Header:**
```
Authorization: Bearer eyJhbGc...
```

**Response (Success):**
```json
{
  "success": true,
  "message": "",
  "data": {
    "user": {
      "sub": 1,
      "name": "Super Administrator",
      "email": "admin@smpmuh35.sch.id",
      "role": "Superadmin",
      "iat": 1704465600,
      "exp": 1704486000
    }
  }
}
```

**Response (Error - Expired Token):**
```json
{
  "success": false,
  "message": "Token expired",
  "data": []
}
```

### POST /api/auth/logout.php
Logout current user (invalidate token).

**Request Header:**
```
Authorization: Bearer eyJhbGc...
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": []
}
```

## Frontend Integration

### React Login
File: `src/components/AdminLogin.jsx`

```javascript
import { apiLogin } from '@/lib/authApi';

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const data = await apiLogin(email, password);
    const session = {
      user: data.user,
      token: data.token,
      expiresAt: Date.now() + 6 * 60 * 60 * 1000
    };
    localStorage.setItem('app_session', JSON.stringify(session));
    onLoginSuccess(session.user);
  } catch (err) {
    setError(err.message);
  }
};
```

### Making Authenticated Requests

```javascript
import { apiVerify } from '@/lib/authApi';

// Verify token
const session = JSON.parse(localStorage.getItem('app_session') || '{}');
const user = await apiVerify(session.token);

// Use token in fetch
const response = await fetch('/api/articles/list.php', {
  headers: {
    'Authorization': `Bearer ${session.token}`
  }
});
```

## Security Best Practices

1. **Password Storage**: Always use `password_hash()` - NEVER store plaintext passwords
2. **Token Transport**: Always use HTTPS in production
3. **Token Storage**: Store in localStorage only for SPA; consider httpOnly cookies for enhanced security
4. **CORS**: Configure `Access-Control-Allow-Origin` properly
5. **Session Logging**: All login attempts are logged to `sessions` table with IP and User-Agent
6. **Token Expiry**: Default 6 hours; adjust as needed in `login.php`
7. **Role-Based Access**: Use `require_auth($config, ['Superadmin', 'Admin'])` to guard endpoints
8. **SQL Injection**: All queries use prepared statements with parameterized queries

## Troubleshooting

### Login Returns "Method not allowed"
- Ensure request is `POST` not `GET`

### Login Returns "Email and password required"
- Check request body is valid JSON
- Verify email and password fields are present

### Login Returns "Invalid email or password"
- Verify user exists in database: `SELECT * FROM users WHERE email = 'admin@smpmuh35.sch.id';`
- Check password hash: `php -r "echo password_hash('Admin123!', PASSWORD_DEFAULT);"`
- Verify password was hashed correctly in database

### Token Verification Fails
- Check token format: should be `Authorization: Bearer <token>`
- Verify JWT_SECRET matches between login and verify
- Check token hasn't expired (exp claim)

### Access Denied on Protected Endpoints
- Token must be included in `Authorization` header
- User role must be in allowed roles list
- Example: `require_auth($config, ['Superadmin', 'Admin'])`

## File Locations

| File | Purpose |
|------|---------|
| `public/api/auth/login.php` | Login endpoint |
| `public/api/auth/verify.php` | Token verification |
| `public/api/auth/logout.php` | Logout endpoint |
| `public/api/setup/init.php` | Complete setup (migrate + seed) |
| `public/api/db_migrate.php` | Run schema.sql migrations |
| `public/api/db_seed_users.php` | Create default users |
| `public/api/schema.sql` | Database schema definition |
| `public/api/_bootstrap.php` | Config loading & helpers |
| `src/lib/authApi.js` | Frontend API wrapper |
| `src/components/AdminLogin.jsx` | Login UI component |

## Testing Login

### Using curl
```bash
# Login
curl -X POST http://localhost/api/auth/login.php \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smpmuh35.sch.id","password":"Admin123!"}'

# Verify token
curl -H "Authorization: Bearer <TOKEN>" http://localhost/api/auth/verify.php

# Logout
curl -X POST -H "Authorization: Bearer <TOKEN>" http://localhost/api/auth/logout.php
```

### Using Postman
1. Create POST request to `http://localhost/api/auth/login.php`
2. Set Body (raw JSON):
   ```json
   {"email":"admin@smpmuh35.sch.id","password":"Admin123!"}
   ```
3. Copy token from response
4. Create GET request to `/api/auth/verify.php`
5. Set Header: `Authorization: Bearer <TOKEN>`

## Environment Variables

```bash
# .env or shell
export DB_HOST=localhost
export DB_NAME=smpmuh35
export DB_USER=dbuser
export DB_PASS=dbpass
export JWT_SECRET=your-super-secret-jwt-key
```

These are read by `public/api/config.php` via `getenv()`.
