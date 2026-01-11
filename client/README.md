# SafeMind Client

React-based dashboard for monitoring youth safety in generative AI conversations.

## Features

- **Real-time Dashboard**: Monitor conversations and alerts in real-time
- **Alert Management**: View and manage safety alerts
- **User Management**: Manage youth profiles and trusted contacts
- **Analytics**: Visualize safety metrics and trends
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **React Router** for navigation
- **Recharts** for data visualization
- **Axios** for API communication

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API URL
```

3. Start development server:
```bash
npm start
```

The application will open at [http://localhost:3000](http://localhost:3000).

### Available Scripts

- `npm start` - Run development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
├── components/         # Reusable UI components
│   ├── common/        # Common components (buttons, inputs, etc.)
│   ├── dashboard/     # Dashboard-specific components
│   ├── alerts/        # Alert components
│   └── users/         # User management components
├── pages/             # Page components
├── services/          # API services
├── hooks/             # Custom React hooks
├── contexts/          # React contexts
├── types/             # TypeScript type definitions
├── utils/             # Utility functions
├── styles/            # Global styles
└── App.tsx            # Main application component
```

## Key Features

### Dashboard
- Overview of monitored youth
- Recent alerts and incidents
- Safety score trends
- Quick actions

### Alert System
- Real-time alert notifications
- Alert severity levels
- Detailed alert information
- Alert acknowledgment and resolution

### User Management
- Add/edit youth profiles
- Manage trusted contacts
- Set monitoring preferences
- View user activity logs

### Analytics
- Conversation safety trends
- Category breakdown (threats, toxicity, etc.)
- Time-based analysis
- Export reports

## Environment Variables

See `.env.example` for all available configuration options.

## Testing

Run tests:
```bash
npm test
```

Run tests with coverage:
```bash
npm test -- --coverage
```

## Building for Production

```bash
npm run build
```

Builds the app for production to the `build` folder.

## Docker

Build and run with Docker:
```bash
docker build -t safemind-client .
docker run -p 3000:3000 safemind-client
```

## Contributing

Please follow the existing code style and ensure all tests pass before submitting pull requests.

## License

MIT
