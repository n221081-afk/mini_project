Backend setup

Steps to install dependencies and run the backend server:

1. Open a terminal and navigate to the backend folder:

   cd mini_project/backend

2. Install dependencies:

   npm install express cors body-parser dotenv mysql2 jsonwebtoken bcryptjs

3. Create a .env file in the backend folder (optional) and set PORT if desired:

   PORT=5000

4. Start the server:

   node server.js

5. Test health endpoint (should return { "status": "Server running" }):

   curl http://localhost:5000/api/health
