# API Routes Documentation

## Patient Routes

### Register Patient
- **URL:** `/api/patient/register`
- **Method:** `POST`
- **Description:** Registers a new patient.
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - `201 Created`: Patient registered successfully.
  - `400 Bad Request`: Validation errors or registration failed.

### Login Patient
- **URL:** `/api/patient/login`
- **Method:** `POST`
- **Description:** Logs in an existing patient.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - `200 OK`: Patient logged in successfully.
  - `400 Bad Request`: Validation errors or login failed.

### Set Primary Doctor
- **URL:** `/api/patient/setPrimaryDoctor`
- **Method:** `POST`
- **Description:** Sets the primary doctor for a patient.
- **Request Body:**
  ```json
  {
    "patientId": "string",
    "doctorId": "string"
  }
  ```
- **Responses:**
  - `200 OK`: Primary doctor set successfully.
  - `400 Bad Request`: Validation errors or operation failed.

### Update Primary Doctor
- **URL:** `/api/patient/updatePrimaryDoctor`
- **Method:** `PUT`
- **Description:** Updates the primary doctor for a patient.
- **Request Body:**
  ```json
  {
    "patientId": "string",
    "doctorId": "string"
  }
  ```
- **Responses:**
  - `200 OK`: Primary doctor updated successfully.
  - `400 Bad Request`: Validation errors or operation failed.

## Doctor Routes

### Register Doctor
- **URL:** `/api/doctor/register`
- **Method:** `POST`
- **Description:** Registers a new doctor.
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string",
    "specialization": "string"
  }
  ```
- **Responses:**
  - `201 Created`: Doctor registered successfully.
  - `400 Bad Request`: Validation errors or registration failed.

### Login Doctor
- **URL:** `/api/doctor/login`
- **Method:** `POST`
- **Description:** Logs in an existing doctor.
- **Request Body:**
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
- **Responses:**
  - `200 OK`: Doctor logged in successfully.
  - `400 Bad Request`: Validation errors or login failed.
