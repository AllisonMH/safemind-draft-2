# SafeMind - Youth Safety Monitoring Application

A comprehensive application designed to recognize and detect harmful language and unsafe conversational patterns in generative AI conversations, specifically monitoring interactions of youth ages 17 and younger.

## Features

- **Real-time Harmful Language Detection**: Uses Detoxify (Hugging Face) to detect:
  - Threats or intentions for self-harm or harming others
  - Racism and sexism
  - Violence and graphic conversations
  - Toxic and offensive language

- **Crisis Alert System**: Automatically alerts a trusted network when concerning patterns are detected

- **Email Notifications**: SendGrid integration for immediate alerts to guardians/counselors

- **Multi-platform Monitoring**: Supports monitoring across ChatGPT, Gemini, and other generative AI platforms

## Tech Stack

### Frontend
- **React** with TypeScript
- Modern UI for dashboard and monitoring
- Real-time alerts and notifications

### Backend
- **Node.js** with Express and TypeScript
- RESTful API architecture
- PostgreSQL database
- Redis for caching and session management

### ML Service
- **Python** with FastAPI
- **Detoxify** model from Hugging Face
- Microservice architecture for scalability

### Infrastructure
- **Docker** and Docker Compose
- **PostgreSQL** for data persistence
- **Redis** for caching
- **SendGrid** for email notifications

## Project Structure

```
safemind-draft-2/
├── client/              # React frontend
├── server/              # Node.js/Express backend
├── ml-service/          # Python/FastAPI ML service
├── docker-compose.yml   # Docker orchestration
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- Docker and Docker Compose
- SendGrid API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd safemind-draft-2
```

2. Set up environment variables:
```bash
# In /server directory
cp .env.example .env
# Add your SendGrid API key and other credentials

# In /ml-service directory
cp .env.example .env

# In /client directory
cp .env.example .env
```

3. Start services with Docker:
```bash
docker-compose up -d
```

4. Or run services individually:

**Backend:**
```bash
cd server
npm install
npm run dev
```

**ML Service:**
```bash
cd ml-service
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd client
npm install
npm start
```

## API Endpoints

### Backend Server (Port 3001)
- `POST /api/analyze` - Submit conversation for analysis
- `GET /api/alerts` - Retrieve alerts for a user
- `POST /api/users` - Register a user/youth
- `GET /api/reports` - Generate safety reports

### ML Service (Port 8000)
- `POST /api/v1/analyze` - Analyze text for harmful content
- `GET /api/v1/health` - Service health check

## Development

### Running Tests
```bash
# Backend tests
cd server && npm test

# ML service tests
cd ml-service && pytest

# Frontend tests
cd client && npm test
```

### Building for Production
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Security & Privacy

- All data is encrypted at rest and in transit
- GDPR and COPPA compliant
- User consent and parental authorization required
- Minimal data retention policy
- Secure API authentication

## Important Considerations

This application is designed to help protect youth online. It should be:
- Used transparently with appropriate consent
- Part of a broader safety strategy including education and open communication
- Monitored by trained professionals who can provide appropriate intervention
- Compliant with local laws regarding youth monitoring and privacy

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please contact the development team or open an issue in the repository.

## Acknowledgments

- Detoxify model by Unitaryai
- Hugging Face for model hosting
- SendGrid for email infrastructure
