from typing import Optional

from pydantic import BaseModel, Field


class SessionStartRequest(BaseModel):
    language: str = Field(default="en", description="'en' or 'hi'")
    name: Optional[str] = None
    token: Optional[str] = None
    abha_id: Optional[str] = None
    department: Optional[str] = Field(default="ayush", description="'ayush', 'general', 'integrated', 'cardiology', 'orthopedics', etc.")
    chief_complaint: Optional[str] = None
    consent: bool = True
    consulting_doctor: Optional[dict] = None


class SessionStartResponse(BaseModel):
    session_id: str
    department: str
    token_number: str
    consulting_doctor: Optional[dict] = None


class ConverseRequest(BaseModel):
    session_id: str
    patient_message: Optional[str] = None


class SummarizeRequest(BaseModel):
    session_id: str


class RouteRequest(BaseModel):
    session_id: str
    physician_edits: Optional[dict] = None


class AttachRecordsRequest(BaseModel):
    session_id: Optional[str] = None
    attached_records: list[dict] = []
    share_past_history: bool = True


class ToggleDemonstrationRequest(BaseModel):
    session_id: Optional[str] = None
    demonstration_active: bool = True


class CallPatientRequest(BaseModel):
    session_id: Optional[str] = None
    doctor_id: Optional[str] = None
    doctor_name: Optional[str] = None
    hospital: Optional[str] = None
    cabin: Optional[str] = None
    specialization: Optional[str] = None


class UpdateStatusRequest(BaseModel):
    session_id: Optional[str] = None
    status: str = "waiting"


class ChatMessage(BaseModel):
    role: str
    content: str


class DoctorChatRequest(BaseModel):
    messages: list[ChatMessage]
    model: Optional[str] = "anthropic/claude-3.5-sonnet"
    api_key: Optional[str] = None
    session_id: Optional[str] = None


class DoctorChatResponse(BaseModel):
    model_config = {"protected_namespaces": ()}
    response: str
    model_used: str
    detected_condition: Optional[str] = None


class QuickBookRequest(BaseModel):
    name: Optional[str] = "Walk-in Patient"
    department: Optional[str] = "ayush"
    language: Optional[str] = "en"
    abha_id: Optional[str] = None
    chief_complaint: Optional[str] = None
    consulting_doctor: Optional[dict] = None


class SignupRequest(BaseModel):
    full_name: str
    username: str
    password: str
    role: Optional[str] = "patient"
    email: Optional[str] = None
    phone: Optional[str] = None
    abha_id: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    department: Optional[str] = "general"
    specialization: Optional[str] = None
    hospital: Optional[str] = None
    cabin: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


class AuthResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    token: Optional[str] = None




