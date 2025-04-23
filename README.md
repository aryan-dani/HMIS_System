<!-- @format -->

# HMIS System - Hospital Management Information System

A web application for managing hospital operations, including patients, doctors, rooms, billing, and pathology records. Built with React, Material UI, and Supabase.

## Features

- **Authentication:** Secure login powered by Supabase Auth.
- **Dashboard:** Overview of key hospital metrics (Placeholder).
- **Patient Management:** Add, view, edit, and delete patient records.
- **Doctor Management:** Manage doctor information (Placeholder/Basic).
- **Room Management:** Track room availability, types, and status. Add, view, edit, and delete rooms.
- **Billing Management:** Handle billing information (Placeholder/Basic).
- **Pathology Management:** Manage pathology reports (Placeholder/Basic).
- **Admin Dashboard:** Separate section for administrative tasks (Placeholder).
- **Responsive Design:** User interface built with Material UI for usability across devices.

## Tech Stack

- **Frontend:**
  - React (via Create React App)
  - React Router v6
  - Material UI (MUI) v5+
  - Axios (for potential future API calls)
- **Backend & Database:**
  - Supabase (Authentication, Database)
- **Deployment:**
  - GitHub Pages

## Getting Started

### Prerequisites

- Node.js and npm (or yarn) installed.
- A Supabase account and project.

### Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <your-repository-url>
    cd HMIS_System/frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up Supabase:**

    - Create a Supabase project at [supabase.com](https://supabase.com/).
    - In your Supabase project dashboard, go to `Project Settings` > `API`.
    - Find your Project **URL** and `anon` **public** key.
    - Create a file named `.env` in the `frontend` directory (`HMIS_System/frontend/.env`).
    - Add your Supabase credentials to the `.env` file:
      ```env
      REACT_APP_SUPABASE_URL=YOUR_SUPABASE_URL
      REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
      ```
    - **Important:** You will also need to set up the necessary database tables (e.g., `patients`, `doctors`, `rooms`, etc.) in your Supabase project according to the application's needs.

4.  **Run the application:**
    ```bash
    npm start
    ```
    This runs the app in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Available Scripts

Inside the `frontend` directory, you can run several commands:

- `npm start`: Runs the app in development mode.
- `npm test`: Launches the test runner (if tests are configured).
- `npm run build`: Builds the app for production to the `build` folder.
- `npm run deploy`: Builds the app and deploys it to GitHub Pages (requires `gh-pages` setup and configuration in `package.json`).

## Deployment

This project is configured for deployment to GitHub Pages. Run the following command from the `frontend` directory:

```bash
npm run deploy
```

This will build the application and push the contents of the `build` folder to the `gh-pages` branch of your repository. Ensure your repository settings are configured to serve from this branch.
