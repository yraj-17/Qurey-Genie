import re
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, EmailStr, field_validator


class DBCredentials(BaseModel):
    host: str
    port: int
    user: str
    password: str = ""
    db_type: Literal["mysql", "postgresql"]


class DBSelection(BaseModel):
    host: str
    port: int
    user: str
    password: str = ""
    database: str
    db_type: Literal["mysql", "postgresql"]


class DBCreate(BaseModel):
    host: str
    port: int
    user: str
    password: str = ""
    database_name: str
    db_type: Literal["mysql", "postgresql"]

    @field_validator("database_name")
    @classmethod
    def validate_db_name(cls, v: str) -> str:
        if not re.match(r"^[a-zA-Z0-9_]{1,63}$", v):
            raise ValueError("Database name must be 1–63 alphanumeric/underscore characters")
        return v


class ChatRequest(BaseModel):
    question: str
    chat_history: List[Dict[str, str]]


class UserCreate(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    phone: Optional[str] = None
    password: str
    otp: str
    gender: str
    username: str

    @field_validator("password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class UserLogin(BaseModel):
    identifier: str
    password: str


class OtpRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class VerifyResetOTPRequest(BaseModel):
    email: EmailStr
    otp: str


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    otp: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class ConfirmSQLRequest(BaseModel):
    user_id: int
    confirm: bool
    sql: str


class UpdateProfileRequest(BaseModel):
    userId: int
    firstName: str
    lastName: str
    username: str
    email: EmailStr
    phone: Optional[str] = None
    gender: str


class ChangePasswordRequest(BaseModel):
    userId: int
    currentPassword: str
    newPassword: str

    @field_validator("newPassword")
    @classmethod
    def password_min_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("New password must be at least 8 characters")
        return v


class SendEmailOTPRequest(BaseModel):
    userId: int
    newEmail: EmailStr


class UpdateEmailRequest(BaseModel):
    userId: int
    newEmail: EmailStr
    otp: str


class StarSessionRequest(BaseModel):
    user_id: int
    is_starred: bool


class RenameSessionRequest(BaseModel):
    user_id: int
    title: str


class CreateSessionRequest(BaseModel):
    user_id: int
    title: str = "Untitled Chat"
    messages: List[Any] = []
    isStarred: bool = False
