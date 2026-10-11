from pydantic import BaseModel, Field
from typing import List, Optional

class DecisionContractRequest(BaseModel):
    scenario: str = Field(..., description="Natural language operational scenario across any industry")

class ActionStep(BaseModel):
    id: str = Field(..., description="Unique step identifier, e.g. step-1")
    title: str = Field(..., description="Actionable execution task title")
    suggested_role: str = Field("Operations Lead", description="Suggested role responsible for the action")
    status: str = Field("pending", description="Task execution status: pending, in_progress, completed")

class FallbackStep(BaseModel):
    id: str = Field(..., description="Unique fallback step identifier, e.g. fallback-step-1")
    title: str = Field(..., description="Actionable fallback task title")
    status: str = Field("pending", description="Status: pending, completed")

class FallbackPlan(BaseModel):
    title: str = Field(..., description="Title or summary of the prepared fallback plan")
    action_steps: List[FallbackStep] = Field(default_factory=list, description="Concrete fallback action steps")

class Dependency(BaseModel):
    id: str = Field(..., description="Unique dependency identifier, e.g. dependency-1")
    label: str = Field(..., description="Description of the critical condition, resource, or service required")
    status: str = Field("unknown", description="Dependency status: unknown, available, unavailable")
    critical: bool = Field(True, description="Whether failure of this dependency blocks the active plan")

class Alternative(BaseModel):
    id: str = Field(..., description="Alternative identifier: A, B, or C")
    title: str = Field(..., description="Strategy title")
    description: str = Field(..., description="Detailed description of the proposed alternative")
    reasoning: str = Field(..., description="Strategic reasoning for choosing this alternative")
    action_steps: List[ActionStep] = Field(..., description="Sequential action steps for execution")
    dependencies: List[Dependency] = Field(..., description="Critical dependencies and guardrails")
    failure_triggers: List[str] = Field(default_factory=list, description="Conditions that would cause this plan to fail")
    fallback_plan: FallbackPlan = Field(..., description="Prepared fallback plan if active plan fails")
    assumptions: List[str] = Field(default_factory=list, description="Explicit operational assumptions")

class DecisionContractResponse(BaseModel):
    domain: str = Field(..., description="Detected industry domain, e.g. IT Operations, Logistics, Event Management, Manufacturing")
    problem_summary: str = Field(..., description="Concise summary of the operational disruption or challenge")
    objectives: List[str] = Field(default_factory=list, description="Primary operational objectives")
    constraints: List[str] = Field(default_factory=list, description="Identified operational constraints")
    alternatives: List[Alternative] = Field(..., description="Exactly three alternative decision plans")
