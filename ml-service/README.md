# SafeMind ML Service

Machine Learning microservice for harmful language detection using Detoxify model from Hugging Face.

## Features

- **Detoxify Model Integration**: Uses the Detoxify library with BERT-based models
- **Real-time Analysis**: Fast inference for text toxicity detection
- **Multi-label Classification**: Detects multiple types of harmful content:
  - Toxicity
  - Severe Toxicity
  - Obscene language
  - Threats
  - Insults
  - Identity-based attacks
- **Redis Caching**: Caches results for improved performance
- **RESTful API**: FastAPI-based endpoints for easy integration

## Installation

### Local Development

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Run the service:
```bash
uvicorn main:app --reload --port 8000
```

### Docker

```bash
docker build -t safemind-ml-service .
docker run -p 8000:8000 safemind-ml-service
```

## API Endpoints

### POST /api/v1/analyze

Analyze text for harmful content.

**Request:**
```json
{
  "text": "Text to analyze",
  "user_id": "optional_user_id",
  "conversation_id": "optional_conversation_id"
}
```

**Response:**
```json
{
  "text": "Text to analyze",
  "scores": {
    "toxicity": 0.85,
    "severe_toxicity": 0.42,
    "obscene": 0.33,
    "threat": 0.71,
    "insult": 0.55,
    "identity_attack": 0.28
  },
  "is_harmful": true,
  "risk_level": "high",
  "categories_exceeded": ["toxicity", "threat"],
  "timestamp": "2024-01-11T10:30:00Z"
}
```

### GET /api/v1/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "model": "unitary/toxic-bert",
  "version": "1.0.0"
}
```

## Models

### Detoxify

Detoxify provides pre-trained models for toxicity classification:

- **original**: Standard model trained on Wikipedia comments
- **unbiased**: Model trained to reduce bias
- **multilingual**: Supports multiple languages

Current implementation uses the `original` model for English text.

## Testing

Run tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

## Performance

- Average inference time: ~50-100ms per request
- Batch processing supported for multiple texts
- Redis caching for repeated queries

## Security

- Input validation and sanitization
- Rate limiting (implemented at backend level)
- No storage of analyzed text content
- Anonymized logging

## Environment Variables

See `.env.example` for all configuration options.

## License

MIT
