import pytest
from httpx import AsyncClient
from main import app


@pytest.mark.asyncio
async def test_root_endpoint():
    """Test root endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/")
        assert response.status_code == 200
        assert "service" in response.json()


@pytest.mark.asyncio
async def test_health_endpoint():
    """Test health check endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "model" in data


@pytest.mark.asyncio
async def test_api_health_endpoint():
    """Test API health check endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/health")
        assert response.status_code == 200
        assert "status" in response.json()


@pytest.mark.asyncio
async def test_analyze_endpoint():
    """Test analyze endpoint with valid text."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {
            "text": "Hello, this is a test message.",
            "user_id": "test-user",
            "conversation_id": "test-conv",
        }
        response = await client.post("/api/v1/analyze", json=payload)
        assert response.status_code == 200

        data = response.json()
        assert "scores" in data
        assert "is_harmful" in data
        assert "risk_level" in data
        assert "categories_exceeded" in data


@pytest.mark.asyncio
async def test_analyze_endpoint_missing_text():
    """Test analyze endpoint with missing text field."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {"user_id": "test-user"}
        response = await client.post("/api/v1/analyze", json=payload)
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_analyze_endpoint_empty_text():
    """Test analyze endpoint with empty text."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {"text": ""}
        response = await client.post("/api/v1/analyze", json=payload)
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_analyze_endpoint_long_text():
    """Test analyze endpoint with very long text."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        payload = {"text": "a" * 15000}  # Exceeds max length
        response = await client.post("/api/v1/analyze", json=payload)
        assert response.status_code == 422  # Validation error


@pytest.mark.asyncio
async def test_thresholds_endpoint():
    """Test thresholds endpoint."""
    async with AsyncClient(app=app, base_url="http://test") as client:
        response = await client.get("/api/v1/thresholds")
        assert response.status_code == 200

        data = response.json()
        assert "toxicity" in data
        assert "threat" in data
        assert "insult" in data
