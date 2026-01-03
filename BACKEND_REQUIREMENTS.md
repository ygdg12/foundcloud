# Backend Requirements for User Authentication

## Critical Issue
When a regular user signs up, their data is stored in localStorage. If an admin/security officer refreshes the page, the frontend tries to fetch fresh user data from `/api/auth/me`. If this endpoint fails or returns incorrect data, the wrong user's data might be used.

## Required Backend Endpoint: `/api/auth/me`

### Endpoint Details
- **URL**: `GET /api/auth/me`
- **Authentication**: Required (Bearer token in Authorization header)
- **Purpose**: Return the current authenticated user's data based on the JWT token

### Request Headers
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

### Expected Response Format

**Option 1: User object directly**
```json
{
  "_id": "user_id",
  "id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "role": "user" | "admin" | "staff",
  "status": "pending" | "approved" | "rejected",
  "studentId": "optional",
  "phone": "optional",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Option 2: Wrapped in user property**
```json
{
  "user": {
    "_id": "user_id",
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user" | "admin" | "staff",
    "status": "pending" | "approved" | "rejected",
    "studentId": "optional",
    "phone": "optional",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Backend Implementation Requirements

1. **Extract User from Token**
   - Decode the JWT token from the Authorization header
   - Extract the user ID from the token (usually in `userId`, `id`, `_id`, or `sub` field)
   - Query the database to get the full user object

2. **Return User Data**
   - Must include `role` field: `"user"`, `"admin"`, or `"staff"`
   - Must include `status` field: `"pending"`, `"approved"`, or `"rejected"`
   - Must include user ID (`_id` or `id`)
   - Include other user fields as needed

3. **Error Handling**
   - If token is invalid/expired: Return `401 Unauthorized`
   - If user not found: Return `404 Not Found`
   - If token missing: Return `401 Unauthorized`

4. **CORS Configuration**
   - Must allow requests from frontend origin: `https://foundcloud.vercel.app`
   - Must allow `Authorization` header
   - Must allow `Content-Type` and `Accept` headers
   - Must allow `GET` method

### Example Backend Code (Node.js/Express)

```javascript
// Middleware to verify JWT and get user
const auth = require('../middleware/auth'); // Your JWT verification middleware

router.get('/api/auth/me', auth, async (req, res) => {
  try {
    // req.user should be set by auth middleware after decoding JWT
    const userId = req.user.userId || req.user.id || req.user._id;
    
    // Fetch user from database
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Return user data
    // Frontend accepts both formats: { user: {...} } or direct user object
    res.json({
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role, // Must be: "user", "admin", or "staff"
        status: user.status, // Must be: "pending", "approved", or "rejected"
        studentId: user.studentId,
        phone: user.phone,
        createdAt: user.createdAt
      }
    });
    
    // OR return directly:
    // res.json({
    //   _id: user._id,
    //   id: user._id,
    //   name: user.name,
    //   email: user.email,
    //   role: user.role,
    //   status: user.status,
    //   studentId: user.studentId,
    //   phone: user.phone,
    //   createdAt: user.createdAt
    // });
    
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});
```

### CORS Configuration Example

```javascript
const cors = require('cors');

app.use(cors({
  origin: 'https://foundcloud.vercel.app',
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
```

## Testing the Endpoint

You can test the endpoint using curl:

```bash
curl -X GET https://lost-items-backend-q30o.onrender.com/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json"
```

Expected response:
```json
{
  "user": {
    "_id": "...",
    "name": "...",
    "email": "...",
    "role": "admin",
    "status": "approved"
  }
}
```

## Important Notes

1. **Token Validation**: The endpoint MUST validate the JWT token and extract the user ID from it. Do NOT trust any user data sent in the request body or query parameters.

2. **User ID Matching**: The user ID in the token must match the user ID in the database. The frontend validates this to prevent token-user mismatches.

3. **Role Values**: 
   - Backend may use `"staff"` but frontend normalizes it to `"security"`
   - Valid roles: `"user"`, `"admin"`, `"staff"`

4. **Status Values**:
   - `"pending"`: User is waiting for approval (regular users only)
   - `"approved"`: User can access the system
   - `"rejected"`: User account was rejected

5. **Security**: Admin and staff users should have `status: "approved"` by default (they are auto-approved).

## Current Issue

If `/api/auth/me` is not working correctly or CORS is blocking it, the frontend will:
1. Try to fetch from `/api/auth/me`
2. If it fails, clear localStorage (for security)
3. User will be redirected to signin

This is intentional to prevent using stale/wrong user data.

