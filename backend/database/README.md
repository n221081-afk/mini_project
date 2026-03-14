# Database - MongoDB

This project uses MongoDB (cloud or local). No SQL schema is required.

**Setup:**
1. Add your MongoDB URI to `.env` as `MONGODB_URI`
2. Run `npm run seed` to populate initial data

Collections are created automatically when data is first inserted:
- users
- departments
- employees
- attendances
- leaves
- payrolls
- recruitments
- performances
- passwordresettokens
