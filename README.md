# ICanCare - Healthcare Management System

## Overview

ICanCare is a comprehensive healthcare management platform designed to connect patients with doctors, manage cases, schedule meetings, and facilitate secure communication. The platform includes features for patients, doctors, and administrators, ensuring a seamless and secure healthcare experience.

---

## Features

### General Features
- **Authentication**: Login and signup for patients, doctors, and admins with role-based access.
- **Google Login**: Support for Google OAuth for easy authentication.
- **Profile Management**: Complete and update profiles for patients and doctors.
- **Role-Based Dashboards**: Separate dashboards for patients, doctors, and admins.
- **Error Handling**: Improved error handling for login and other operations.
- **Protected Routes**: Redirect to login if the user is not authenticated.
- **Dynamic Titles and Images**: Update page titles and images dynamically.
- **Modern UI**: A clean, responsive, and user-friendly interface built with Material-UI.

### Patient Features
- **Case Management**: Create and manage cases.
- **Doctor Selection**: Add doctors to cases and change the primary doctor.
- **Meeting Scheduling**: View scheduled meetings with doctors.
- **Feedback**: Provide feedback and ratings for doctors.
- **Secure Chat**: Communicate with doctors via a secure chat interface.
- **Document Upload**: Upload and manage medical documents for cases.
- **Automated Calendar**: View all past and upcoming meetings in a calendar interface.

### Doctor Features
- **Case Management**: View and respond to pending and accepted cases.
- **Meeting Scheduling**: Schedule meetings with patients and other doctors.
- **Doctor Forum**: Participate in discussions with other doctors to share knowledge and collaborate.
- **Profile Completion**: Update specialization, location, and other professional details.
- **Document Access**: View and download patient-uploaded documents.
- **Chat Rooms**:
  - **Doctor-Patient Chat**: Communicate with patients securely.
  - **Doctor-Doctor Chat**: Collaborate with other doctors in private chat rooms.
- **Automated Calendar**: View all past and upcoming meetings in a calendar interface.

### Admin Features
- **Doctor Approvals**: Approve or deny doctor registration requests.
- **Doctor Reviews**: View feedback and ratings for approved doctors.
- **Specialization Management**: Manage approved specializations for doctors.
- **Admin Dashboard**: View pending approvals and manage approved doctors.

---

## Automated Features

### Gmail Notifications
- **Meeting Creation**: When a meeting is scheduled, automated Gmail notifications are sent to:
  - The patient involved in the case.
  - All doctors assigned to the case (except the one who created the meeting).
- **Email Content**: The email includes:
  - Meeting summary and description.
  - Start and end times.
  - Google Meet link for the meeting.
- **Customization**: The email content is dynamically generated based on the meeting details.

### Calendar Integration
- **Automated Calendar**: Each user (patient or doctor) has access to a calendar that displays:
  - All past meetings.
  - All upcoming meetings.
- **Meeting Details**: Clicking on a meeting in the calendar shows:
  - Meeting summary and description.
  - Start and end times.
  - Google Meet link (if applicable).
- **Role-Based Views**:
  - Patients see meetings they are involved in.
  - Doctors see meetings for cases they are assigned to.

---

## Chat Rooms

### Doctor-Patient Chat
- **Secure Communication**: Patients and doctors can communicate securely within the platform.
- **Case-Specific Chats**: Each case has a dedicated chat room for discussions.

### Doctor-Doctor Chat
- **Private Collaboration**: Doctors can discuss cases and collaborate in private chat rooms.
- **Role-Based Access**: Only doctors assigned to a case can access the doctor-only chat room.

---

## Doctor Forum
- **Knowledge Sharing**: A dedicated forum for doctors to discuss medical topics, share knowledge, and seek advice.
- **Threaded Discussions**: Create threads and reply to existing discussions.
- **Search and Filter**: Easily find relevant topics using search and filter options.

---

## Setup Instructions

### Prerequisites
- **Node.js**: Ensure Node.js is installed on your system.
- **MongoDB**: Set up a MongoDB instance (local or cloud).
- **Google API Credentials**: Obtain credentials for Google OAuth and Google Meet integration.
- **Environment Variables**: Create a `.env` file in the `backend` directory with the following variables:
  ```
  PORT=5000
  MONGO_URI=<your-mongodb-uri>
  JWT_SECRET=<your-jwt-secret>
  GOOGLE_CLIENT_ID=<your-google-client-id>
  GOOGLE_CLIENT_SECRET=<your-google-client-secret>
  ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd code/backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd code/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```

### Access the Application
- Open your browser and navigate to `http://localhost:3000`.

---

## Project Structure

### Backend
- **Controllers**: Handles business logic for cases, doctors, meetings, and authentication.
- **Models**: MongoDB schemas for users, cases, meetings, and feedback.
- **Routes**: API endpoints for various functionalities.
- **Utils**: Helper functions for Google Meet integration, email notifications, etc.

### Frontend
- **Pages**: React components for different pages (e.g., Dashboard, Profile, Chat).
- **Components**: Reusable UI components (e.g., Navbar, Footer).
- **Routes**: Configured routes for navigation.

---

## Key Functionalities

### Authentication
- Role-based login and signup.
- Google OAuth integration.
- Admin login with predefined credentials.

### Case Management
- Patients can create cases and assign doctors.
- Doctors can accept or reject cases.
- Admins can approve or deny doctor registrations.

### Meetings
- Doctors can schedule Google Meet sessions.
- Patients and doctors receive notifications and emails for scheduled meetings.

### Feedback
- Patients can provide feedback and ratings for doctors.
- Admins can view feedback and ratings.

### Chat
- Secure chat for patients and doctors.
- Separate chat rooms for general and doctor-only discussions.

### Document Management
- Patients can upload and manage medical documents.
- Doctors can view and download patient-uploaded documents.

### Calendar
- Automated calendar for patients and doctors to view all meetings.
- Role-based meeting visibility.

### Doctor Forum
- A collaborative space for doctors to discuss and share knowledge.

---

## API Endpoints

### Authentication
- `POST /api/auth/login`
- `POST /api/auth/signup`
- `POST /api/auth/google-login`

### Cases
- `GET /api/case`
- `POST /api/case`
- `PUT /api/case/updatePrimaryDoctor`

### Meetings
- `GET /api/meetings`
- `POST /api/meetings`

### Feedback
- `POST /api/feedback`
- `GET /api/feedback/status`

### Documents
- `POST /api/documents/upload`
- `GET /api/documents/:caseId`
- `GET /api/documents/download/:documentId`

---

## Technologies Used

### Frontend
- React.js
- Material-UI
- Vite

### Backend
- Node.js
- Express.js
- MongoDB

### Other Tools
- Google OAuth
- Google Meet API

---
