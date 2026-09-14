from pydantic import BaseModel


class GoogleAuthRequest(BaseModel):
    id_token: str


class SendOtpRequest(BaseModel):
    phone: str


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


class UserOut(BaseModel):
    id: str
    name: str | None = None
    email: str | None = None
    phone: str | None = None
    auth_provider: str

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    user: UserOut
    token: str
