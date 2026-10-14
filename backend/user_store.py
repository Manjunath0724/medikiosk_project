import hashlib
import json
import logging
import os
import secrets
import uuid
from datetime import datetime, timezone
import database

logger = logging.getLogger("medikiosk.user_store")
USERS_FILE = os.path.join(os.path.dirname(__file__), "users.json")


def _hash_password(password: str, salt: str) -> str:
    """Compute salted SHA-256 hash."""
    return hashlib.sha256((salt + password).encode("utf-8")).hexdigest()


def _sanitize_user(user: dict) -> dict:
    """Return user dict without sensitive password information."""
    if not user:
        return None
    safe = dict(user)
    safe.pop("password_hash", None)
    safe.pop("salt", None)
    if isinstance(safe.get("created_at"), datetime):
        safe["created_at"] = safe["created_at"].isoformat()
    return safe


# ---------------------------------------------------------------------
# MySQL Implementation
# ---------------------------------------------------------------------

def _mysql_init_default_users():
    """Ensure default demo accounts exist in MySQL."""
    try:
        conn = database.get_connection()
        with conn.cursor() as cur:
            cur.execute("SELECT username FROM users WHERE username IN ('patient', 'doctor')")
            existing = {row["username"].lower() for row in cur.fetchall()}

            if "patient" not in existing:
                salt = secrets.token_hex(8)
                cur.execute(
                    """
                    INSERT INTO users (id, username, email, phone, full_name, password_hash, salt, role, department, abha_id, age, gender)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        f"usr_{uuid.uuid4().hex[:8]}",
                        "patient",
                        "patient@example.com",
                        "9876543210",
                        "Ramesh Kumar",
                        _hash_password("patient123", salt),
                        salt,
                        "patient",
                        "ayush",
                        "91-4521-8893-1029",
                        42,
                        "male",
                    )
                )

            if "doctor" not in existing:
                salt = secrets.token_hex(8)
                cur.execute(
                    """
                    INSERT INTO users (id, username, email, phone, full_name, password_hash, salt, role, department, specialization)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        f"usr_{uuid.uuid4().hex[:8]}",
                        "doctor",
                        "doctor@ayush.gov.in",
                        "9812345678",
                        "Dr. Sunita Sharma",
                        _hash_password("doctor123", salt),
                        salt,
                        "doctor",
                        "ayush",
                        "Ayush / Panchakarma & General Medicine",
                    )
                )
        conn.close()
    except Exception as e:
        logger.error(f"Error seeding default MySQL users: {e}")


def _mysql_create_user(
    full_name: str,
    username: str,
    password: str,
    role: str = "patient",
    email: str = None,
    phone: str = None,
    abha_id: str = None,
    age: int = None,
    gender: str = None,
    department: str = "general",
    specialization: str = None,
    hospital: str = None,
    cabin: str = None,
) -> dict:
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            # Check unique constraints
            cur.execute("SELECT id FROM users WHERE username = %s", (username.strip(),))
            if cur.fetchone():
                raise ValueError(f"Username '{username}' is already taken.")

            if email and email.strip():
                cur.execute("SELECT id FROM users WHERE email = %s", (email.strip(),))
                if cur.fetchone():
                    raise ValueError(f"Email '{email}' is already registered.")

            if phone and phone.strip():
                cur.execute("SELECT id FROM users WHERE phone = %s", (phone.strip(),))
                if cur.fetchone():
                    raise ValueError(f"Phone '{phone}' is already registered.")

            salt = secrets.token_hex(8)
            password_hash = _hash_password(password, salt)
            user_id = f"usr_{uuid.uuid4().hex[:8]}"
            consolidated_role = "doctor" if str(role).lower() == "doctor" else "patient"

            cur.execute(
                """
                INSERT INTO users (id, username, email, phone, full_name, password_hash, salt, role, department, specialization, abha_id, age, gender, hospital, cabin)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    username.strip(),
                    email.strip() if email else None,
                    phone.strip() if phone else None,
                    full_name.strip(),
                    password_hash,
                    salt,
                    consolidated_role,
                    department,
                    specialization,
                    abha_id.strip() if abha_id else None,
                    age,
                    gender,
                    hospital.strip() if hospital else None,
                    cabin.strip() if cabin else None,
                )
            )

            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            created = cur.fetchone()
            return _sanitize_user(created)
    finally:
        conn.close()



def _mysql_authenticate_user(identifier: str, password: str) -> dict:
    clean_id = identifier.strip().lower()
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT * FROM users
                WHERE LOWER(username) = %s OR LOWER(email) = %s OR phone = %s
                LIMIT 1
                """,
                (clean_id, clean_id, identifier.strip())
            )
            user = cur.fetchone()
            if not user:
                return None

            salt = user.get("salt", "")
            expected_hash = user.get("password_hash", "")
            if _hash_password(password, salt) == expected_hash:
                return _sanitize_user(user)
            return None
    finally:
        conn.close()


def _mysql_get_user_by_id(user_id: str) -> dict:
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            user = cur.fetchone()
            return _sanitize_user(user)
    finally:
        conn.close()


def _mysql_list_users() -> list:
    conn = database.get_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM users ORDER BY created_at DESC")
            users = cur.fetchall()
            return [_sanitize_user(u) for u in users]
    finally:
        conn.close()


# ---------------------------------------------------------------------
# JSON File Fallback (When MySQL server is not started)
# ---------------------------------------------------------------------

def _json_load_users() -> list:
    if not os.path.exists(USERS_FILE):
        return []
    try:
        with open(USERS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _json_save_users(users: list) -> None:
    tmp_file = f"{USERS_FILE}.tmp"
    with open(tmp_file, "w", encoding="utf-8") as f:
        json.dump(users, f, indent=2, ensure_ascii=False)
    os.replace(tmp_file, USERS_FILE)


def _json_init_default_users() -> None:
    users = _json_load_users()
    usernames = {u.get("username", "").lower() for u in users}
    changed = False

    if "patient" not in usernames:
        salt = secrets.token_hex(8)
        users.append({
            "id": f"usr_{uuid.uuid4().hex[:8]}",
            "username": "patient",
            "email": "patient@example.com",
            "phone": "9876543210",
            "full_name": "Ramesh Kumar",
            "password_hash": _hash_password("patient123", salt),
            "salt": salt,
            "role": "patient",
            "abha_id": "91-4521-8893-1029",
            "age": 42,
            "gender": "male",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        changed = True

    if "doctor" not in usernames:
        salt = secrets.token_hex(8)
        users.append({
            "id": f"usr_{uuid.uuid4().hex[:8]}",
            "username": "doctor",
            "email": "doctor@ayush.gov.in",
            "phone": "9812345678",
            "full_name": "Dr. Sunita Sharma",
            "password_hash": _hash_password("doctor123", salt),
            "salt": salt,
            "role": "doctor",
            "specialization": "Ayush / Panchakarma & General Medicine",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        changed = True

    if changed or not os.path.exists(USERS_FILE):
        _json_save_users(users)


# ---------------------------------------------------------------------
# Public Dispatchers
# ---------------------------------------------------------------------

def init_default_users() -> None:
    if database.init_database():
        _mysql_init_default_users()
    else:
        _json_init_default_users()


def create_user(*args, **kwargs) -> dict:
    if database.is_mysql_available() and database.init_database():
        return _mysql_create_user(*args, **kwargs)
    
    # Fallback to local file
    users = _json_load_users()
    username = kwargs.get("username") or args[1]
    email = kwargs.get("email") if "email" in kwargs else (args[4] if len(args) > 4 else None)
    clean_username = username.strip().lower()

    for u in users:
        if u.get("username", "").lower() == clean_username:
            raise ValueError(f"Username '{username}' is already taken.")
        if email and u.get("email", "").lower() == email.strip().lower():
            raise ValueError(f"Email '{email}' is already registered.")

    full_name = kwargs.get("full_name") or args[0]
    password = kwargs.get("password") or args[2]
    raw_role = kwargs.get("role", "patient")
    role = "doctor" if str(raw_role).lower() == "doctor" else "patient"
    salt = secrets.token_hex(8)
    user_id = f"usr_{uuid.uuid4().hex[:8]}"

    new_user = {
        "id": user_id,
        "username": username.strip(),
        "email": email.strip() if email else "",
        "phone": kwargs.get("phone", ""),
        "full_name": full_name.strip(),
        "password_hash": _hash_password(password, salt),
        "salt": salt,
        "role": role,
        "abha_id": kwargs.get("abha_id"),
        "age": kwargs.get("age"),
        "gender": kwargs.get("gender"),
        "department": kwargs.get("department", "general"),
        "specialization": kwargs.get("specialization"),
        "hospital": kwargs.get("hospital"),
        "cabin": kwargs.get("cabin"),
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users.append(new_user)
    _json_save_users(users)
    return _sanitize_user(new_user)



def authenticate_user(identifier: str, password: str) -> dict:
    if database.is_mysql_available() and database.init_database():
        return _mysql_authenticate_user(identifier, password)
    
    _json_init_default_users()
    users = _json_load_users()
    clean_id = identifier.strip().lower()

    for u in users:
        if clean_id in (u.get("username", "").lower(), u.get("email", "").lower(), u.get("phone", "").strip()):
            if _hash_password(password, u.get("salt", "")) == u.get("password_hash", ""):
                return _sanitize_user(u)
    return None


def get_user_by_id(user_id: str) -> dict:
    if database.is_mysql_available() and database.init_database():
        return _mysql_get_user_by_id(user_id)
    
    for u in _json_load_users():
        if u.get("id") == user_id:
            return _sanitize_user(u)
    return None


def list_users() -> list:
    if database.is_mysql_available() and database.init_database():
        return _mysql_list_users()
    _json_init_default_users()
    return [_sanitize_user(u) for u in _json_load_users()]


# Auto-initialize on import
init_default_users()
