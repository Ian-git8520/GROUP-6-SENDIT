# Quick Start - Running the Connected SENDIT App

## Prerequisites
- Python 3.8+ installed
- Node.js 16+ installed
- Git

## Step 1: Setup Backend

\`\`\`bash
# Navigate to backend directory
cd BACKEND

# Install dependencies
pip install -r requirements.txt
# OR if using Pipenv:
pipenv install

# Initialize database (if first time)
python -c "from database import init_db; init_db()"

# Run Flask server
python app.py
\`\`\`

Expected output:
\`\`\`
WARNING in flask_cors.core: ...
 * Running on http://127.0.0.1:5000
\`\`\`

**⚠️ Leave this terminal running!**

## Step 2: Setup Frontend

Open **new terminal**, navigate to frontend:

\`\`\`bash
cd FRONTEND

# Install dependencies
npm install

# Start development server
npm run dev
\`\`\`

Expected output:
\`\`\`
  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
\`\`\`

## Step 3: Test the Connection

1. Open browser to `http://localhost:5173`
2. Click "Sign Up"
3. Create an account:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Role: User
4. Click Sign Up (should call backend API)
5. You should be redirected to login
6. Login with same credentials
7. Should see dashboard with your profile

## Step 4: Test Full Flow

### Create Order
1. Click "Create Order"
2. Fill in item details (weight, height, length)
3. Search and select pickup location
4. Search and select destination location
5. Click "Submit Order"
6. Confirm order creation
7. Should see delivery ID returned from backend

### View Orders
1. Click "View Orders"
2. Should see your created order with all details from database
3. Order status should be "pending"

### Track Order
1. Click "Track Order"
2. Should see your order in the list
3. Click on order to view on map
4. Map should show routing from pickup to destination

## For Admin Testing

Create admin account:
1. Signup with role "Admin" (role_id = 1)
2. Login as admin
3. You'll see "/admin/dashboard" option
4. Click "Go to Admin Panel"
5. View all orders and update their status

## For Driver Testing

Create driver account:
1. Signup with role "Driver" (role_id = 3)
2. Login as driver
3. You'll see "/driver/dashboard" option
4. View all available orders on map

## Database Inspection

Check what's actually in the database:

\`\`\`bash
# In BACKEND directory
sqlite3 sendit.db

# View users
sqlite> SELECT id, name, email, role_id FROM users;

# View deliveries
sqlite> SELECT id, user_id, status, distance, total_price FROM deliveries;

# View with locations
sqlite> SELECT id, user_id, pickup_location, drop_off_location FROM deliveries;

# Exit
sqlite> .exit
\`\`\`

## Common Issues

### "Connection refused" or "Cannot POST /auth/login"
**Problem**: Backend not running
**Solution**: Make sure you ran `python app.py` in BACKEND terminal

### "CORS error" in browser console
**Problem**: Backend CORS configuration
**Solution**: Restart backend server, ensure CORS is imported in app.py

### Order not appearing after creation
**Problem**: Frontend needs to refetch data
**Solution**: Refresh page or navigate away and back

### "Invalid credentials" on login
**Problem**: User doesn't exist in database
**Solution**: Create new account via signup first

### Port 5000 already in use
**Problem**: Another app using port 5000
**Solution**: Kill process or change Flask port in app.py:
\`\`\`python
if __name__ == "__main__":
    app.run(debug=True, port=5001)  # Change port here
\`\`\`

## Key Files Changed

### Frontend
- `src/Login.jsx` - Now calls `/auth/login` endpoint
- `src/Dashboard.jsx` - Fetches profile from `/profile`
- `src/CreateOrder.jsx` - POSTs to `/deliveries`
- `src/ViewOrders.jsx` - GETs from `/deliveries`
- `src/TrackOrder.jsx` - Fetches and displays order data
- `src/Driver.jsx` - Shows available orders from backend
- `src/AdminPanel.jsx` - Admin order management with status updates
- `src/api.js` - NEW: Centralized API configuration

### Backend
- `app.py` - Already had all endpoints configured
- `resources/` - Login, delivery, profile endpoints working
- `utils/auth.py` - JWT token validation implemented

## Data Flow

\`\`\`
User Action (Login)
    ↓
Frontend sends request (POST /auth/login)
    ↓
Backend validates credentials + generates JWT
    ↓
Frontend stores token in localStorage
    ↓
Frontend includes token in future requests
    ↓
Backend validates token + executes operation
    ↓
Data persisted in SQLite database
    ↓
Response sent back to frontend
    ↓
Frontend displays data from response
\`\`\`

## Environment Variables

Backend uses:
- `SECRET_KEY` - For JWT signing (defined in config.py)
- `DATABASE_URL` - SQLite path (sendit.db)

Frontend uses:
- `API_BASE_URL` - Backend URL (http://127.0.0.1:5000, defined in src/api.js)

To change API URL for production:
1. Edit `/FRONTEND/src/api.js`
2. Change `const API_BASE_URL = "..."`

## Performance Tips

1. **Use the API utility**: Import from `src/api.js` instead of hardcoding URLs
2. **Implement pagination**: For large order lists, use limit/offset
3. **Cache user profile**: Use `useEffect` dependency arrays to avoid refetching
4. **Debounce search**: Add delays to autocomplete in CreateOrder

## Next: Deployment

When ready to deploy:
1. Backend: Deploy to Heroku, AWS, or similar
2. Frontend: Deploy to Vercel, Netlify, or similar
3. Update `API_BASE_URL` in frontend to point to deployed backend
4. Update CORS origins in backend to allow frontend domain

Enjoy your fully integrated SENDIT app! 🚀
