# Smart Driver Assistant - Frontend

A modern React-based frontend application for the Smart Driver Assistant system, built with Vite and Tailwind CSS.

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## Project Structure

```
frontend/
├── public/              # Static assets
├── src/
│   ├── assets/          # Images, fonts, etc.
│   ├── components/      # Reusable components
│   │   └── layout/      # Layout components (Sidebar, Navbar, MainLayout)
│   ├── pages/           # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Alerts.jsx
│   │   ├── DriverProfile.jsx
│   │   └── Settings.jsx
│   ├── services/        # API service layer
│   │   └── api.js
│   ├── context/         # React context for state management
│   ├── utils/           # Utility functions
│   ├── App.jsx          # Main app component with routes
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind directives
├── .env                 # Environment variables (local)
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

Create a production build:
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

Preview the production build locally:
```bash
npm run preview
```

## Available Routes

- `/` - Login page
- `/dashboard` - Main dashboard
- `/alerts` - Alerts and notifications
- `/driver-profile` - Driver profile information
- `/settings` - Application settings

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL (default: `http://localhost:5000/api`)

## API Integration

The API service layer is located in `src/services/api.js`. All backend API calls should be made through this service to maintain consistency and make it easier to manage API endpoints.

Example usage:
```javascript
import api from './services/api';

// In your component
const fetchData = async () => {
  try {
    const data = await api.getDashboardData();
    console.log(data);
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
};
```

## Contributing

When working on this project:
1. Follow the existing folder structure
2. Use Tailwind CSS for styling
3. Make API calls through the `api` service
4. Keep components focused and reusable
5. Update this README when adding new features or routes

## Notes

- This is the base structure. Business logic and detailed UI implementations are to be added.
- No mock data or hardcoded backend responses are included.
- The application is designed to work with the existing Python backend via REST APIs.
