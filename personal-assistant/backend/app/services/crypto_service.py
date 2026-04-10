import base64
import json
from cryptography.fernet import Fernet
from app.config import settings


def _get_fernet() -> Fernet:
    key = settings.encryption_key
    if not key:
        # Generate a default key for dev (not secure for production)
        key = base64.urlsafe_b64encode(b"dev-key-32-bytes-long-padding!!!")
    if isinstance(key, str):
        key = key.encode()
    return Fernet(key)


def encrypt_credentials(data: dict) -> str:
    f = _get_fernet()
    return f.encrypt(json.dumps(data).encode()).decode()


def decrypt_credentials(encrypted: str) -> dict:
    f = _get_fernet()
    return json.loads(f.decrypt(encrypted.encode()).decode())
