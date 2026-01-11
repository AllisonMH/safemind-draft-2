import pytest
from app.analyzer import DetoxifyAnalyzer


@pytest.fixture
def analyzer():
    return DetoxifyAnalyzer()


def test_analyzer_initialization(analyzer):
    """Test that analyzer initializes correctly."""
    assert analyzer.model is not None
    assert analyzer.thresholds is not None


def test_analyze_safe_text(analyzer):
    """Test analysis of safe, non-toxic text."""
    text = "Hello, how are you today? I hope you're having a great day!"
    result = analyzer.analyze(text)

    assert result["is_harmful"] is False
    assert result["risk_level"] == "low"
    assert len(result["categories_exceeded"]) == 0
    assert "scores" in result
    assert "toxicity" in result["scores"]


def test_analyze_toxic_text(analyzer):
    """Test analysis of toxic text."""
    text = "You are a terrible person and I hate you!"
    result = analyzer.analyze(text)

    assert "scores" in result
    assert result["scores"]["toxicity"] > 0


def test_analyze_with_user_id(analyzer):
    """Test analysis with user ID."""
    text = "This is a test message."
    result = analyzer.analyze(text, user_id="test-user-123")

    assert result is not None
    assert "scores" in result


def test_analyze_empty_text(analyzer):
    """Test analysis with empty text."""
    with pytest.raises(Exception):
        analyzer.analyze("")


def test_risk_level_calculation(analyzer):
    """Test risk level calculation."""
    # Test safe text
    safe_result = analyzer.analyze("Have a nice day!")
    assert safe_result["risk_level"] == "low"

    # Test potentially harmful text
    harmful_result = analyzer.analyze("This is awful and disgusting!")
    assert harmful_result["risk_level"] in ["low", "medium", "high", "critical"]


def test_categories_exceeded(analyzer):
    """Test that categories_exceeded is correctly populated."""
    text = "Hello world"
    result = analyzer.analyze(text)

    assert isinstance(result["categories_exceeded"], list)


def test_scores_range(analyzer):
    """Test that all scores are in valid range [0, 1]."""
    text = "This is a test message with various content."
    result = analyzer.analyze(text)

    for category, score in result["scores"].items():
        assert 0 <= score <= 1, f"{category} score {score} is out of range"
