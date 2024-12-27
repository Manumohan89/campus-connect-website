# campus-connect-website

**Campus Connect** is a web-based platform designed to streamline academic management for students. It offers features such as automatic SGPA/CGPA calculation, secure document sharing, curated job opportunities, and personalized dashboards to enhance the student experience.

## Features

- **Automatic SGPA & CGPA Calculation**: Upload marks cards in Excel format to automatically compute Semester Grade Point Average (SGPA) and Cumulative Grade Point Average (CGPA).
- **Secure Document Sharing**: Share study materials, project files, and notes securely with peers.
- **Curated Job Opportunities**: Access tailored internships and job listings relevant to your profile.
- **Personalized Dashboard**: View academic performance metrics, notifications, and quick navigation links.
- **Responsive Design**: Optimized for seamless use across desktops, tablets, and mobile devices.

## Technologies Used

- **Frontend**: React.js, Material-UI
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL
- **File Handling**: Multer for file uploads, ExcelJS for Excel file processing
- **Authentication**: JSON Web Tokens (JWT)

## Getting Started

### Prerequisites

- Node.js (v14 or above)
- PostgreSQL
- npm or yarn package manager

### Installation

1. Clone the repository:

   ```bash
   git clone (https://github.com/Manumohan89/campus-connect-website)
   cd campus-connect

2. Install dependencies:
     For the backend:

        cd backend
        npm install
    For the frontend:

   
       cd ../frontend
       npm install

4. Configure environment variables:

   -Create a .env file in the backend directory with the following variables:

   
            PORT=5000
            DB_USER=your_db_user
            DB_PASSWORD=your_db_password
            DB_HOST=localhost
            DB_PORT=5432
            DB_DATABASE=campus_connect
            JWT_SECRET=your_secret_key

6. Set up the database:

    Ensure PostgreSQL is running.
    Create a database named campus_connect.
    Run the database migrations (if applicable) to set up the necessary tables.
7. Start the application:
    Start the backend server:

   
       cd backend
       node app.js
   Start the frontend development server:

   
       cd ../frontend
       npm start

6.Access the application:

    Open your browser and navigate to http://localhost:3000.





