# HR System Database Setup

This document explains how to set up the HR management database using MongoDB.

## Database Setup

The backend is configured to use MongoDB with the connection string in `.env`:

 

The database uses the following collections (equivalent to SQL tables):
- `departments`
- `employees`
- `users`
- `attendances`
- `leave_types`
- `leaves`
- `payrolls`
- `payslips`
- `recruitments`
- `recruitment_candidates`
- `performance_reviews`

## Seeding Sample Data

To populate the database with sample data:

1. Ensure MongoDB connection is working.
2. Run the seed script: `cd backend && node seed.js`
3. This will insert 5 departments and 10 sample employees/users.

## Backend Configuration

- Models are defined in `backend/models/` using Mongoose schemas.
- The server connects to MongoDB on startup.
- API endpoints use Mongoose queries instead of SQL.

## Testing

1. **Start the backend**: `cd backend && node server.js`
2. **Check health**: `curl http://localhost:5001/api/health` → `{"status":"Server running"}`
3. **Test employees API**: `curl http://localhost:5001/api/employees` → JSON with employee data
4. **Verify connection**: Server logs should show "MongoDB connected successfully"

## Migration from MySQL

If migrating from the previous MySQL setup:
- The data structure is adapted to MongoDB documents.
- Relationships use ObjectId references instead of foreign keys.
- No need for SQL scripts; data is seeded via the Node.js script.

---

### Notes
- Ensure your MongoDB Atlas cluster allows connections from your IP.
- The seed script clears existing data before inserting samples.
- For production, implement proper authentication and data validation.
