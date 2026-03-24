Backend setup

Steps to install dependencies and run the backend server:

1. Open a terminal and navigate to the backend folder:

   cd mini_project/backend

2. Install dependencies:

   npm install express cors body-parser dotenv mysql2 jsonwebtoken bcryptjs

3. Create a .env file in the backend folder (optional) and set PORT if desired:

   PORT=5000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=mini_project

4. Ensure MySQL server is running and the database 'mini_project' exists. If not, create it:

   - Start MySQL (via XAMPP or standalone)
   - Run: CREATE DATABASE mini_project;

5. Start the server:

   node server.js

6. Test health endpoint (should return { "status": "Server running" }):

   curl http://localhost:5000/api/health

Database Setup:

- The backend/config/db.js file handles MySQL connection.
- It connects to the database on startup and logs success or failure.
- To test database connection: run `node backend/config/db.js` in the project root.
- Expected output: "Database connected successfully"
- If connection fails, check MySQL credentials in .env and ensure the database exists.

5. Test health endpoint (should return { "status": "Server running" }):

   curl http://localhost:5000/api/health
