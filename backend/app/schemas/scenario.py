from pydantic import BaseModel, Field
from typing import List

class ScenarioExtractionRequest(BaseModel):
    text: str

class AlternativeDecision(BaseModel):
    decision: str = Field(..., description="A brief description of the alternative decision")
    reasoning: str = Field(..., description="Why this decision is a viable alternative")

class ScenarioExtractionResponse(BaseModel):
    event_type: str = Field(..., description="The type of event being analyzed")
    disruption: str = Field(..., description="The specific unexpected disruption")
    delay_duration: str = Field("Unknown", description="The duration of the delay, if specified")
    attendee_count: str = Field("Unknown", description="Number of attendees, if specified")
    constraints: List[str] = Field(default_factory=list, description="Any constraints like time limits")
    objectives: List[str] = Field(default_factory=list, description="Goals or objectives to meet")
    alternative_decisions: List[AlternativeDecision] = Field(..., description="Three feasible alternative decisions")
    explicit_assumptions: List[str] = Field(default_factory=list, description="Assumptions made about the scenario")
    cached: bool = Field(default=False, description="Whether this response was served from cache")
    latency_seconds: float = Field(default=0.0, description="Inference latency in seconds")
    model_used: str = Field(default="", description="The exact Gemma 4 model used for inference")
