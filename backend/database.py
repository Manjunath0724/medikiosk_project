import json
import logging
import os
import pymysql
from pymysql.cursors import DictCursor

logger = logging.getLogger("medikiosk.database")
logging.basicConfig(level=logging.INFO)

MYSQL_HOST = os.getenv("MYSQL_HOST", "localhost")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", "3306"))
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DATABASE = os.getenv("MYSQL_DATABASE", "medikiosk_db")

_DB_INITIALIZED = False
_MYSQL_AVAILABLE = None


def is_mysql_available() -> bool:
    """Check if MySQL server is reachable."""
    global _MYSQL_AVAILABLE
    if _MYSQL_AVAILABLE is not None:
        return _MYSQL_AVAILABLE
    try:
        conn = pymysql.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD,
            connect_timeout=3,
        )
        conn.close()
        _MYSQL_AVAILABLE = True
    except Exception as e:
        logger.warning(
            f"MySQL not reachable at {MYSQL_HOST}:{MYSQL_PORT} ({e}). "
            f"Please verify your credentials in .env or run docker-compose."
        )
        _MYSQL_AVAILABLE = False
    return _MYSQL_AVAILABLE


def get_connection(with_db: bool = True):
    """Obtain a new PyMySQL connection with DictCursor."""
    return pymysql.connect(
        host=MYSQL_HOST,
        port=MYSQL_PORT,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DATABASE if with_db else None,
        charset="utf8mb4",
        cursorclass=DictCursor,
        autocommit=True,
        connect_timeout=5,
    )


def init_database() -> bool:
    """Initialize database and tables if not already present."""
    global _DB_INITIALIZED, _MYSQL_AVAILABLE
    if _DB_INITIALIZED:
        return True

    try:
        # Step 1: Connect to server without database and create if needed
        conn = get_connection(with_db=False)
        with conn.cursor() as cur:
            cur.execute(f"CREATE DATABASE IF NOT EXISTS `{MYSQL_DATABASE}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;")
        conn.close()

        # Step 2: Run schema creation
        conn = get_connection(with_db=True)
        with conn.cursor() as cur:
            # Users table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS `users` (
                `id` VARCHAR(64) NOT NULL PRIMARY KEY,
                `username` VARCHAR(100) NOT NULL UNIQUE,
                `email` VARCHAR(255) NULL,
                `phone` VARCHAR(30) NULL,
                `full_name` VARCHAR(255) NOT NULL,
                `password_hash` VARCHAR(255) NOT NULL,
                `salt` VARCHAR(64) NOT NULL,
                `role` ENUM('patient', 'doctor') NOT NULL DEFAULT 'patient',
                `department` VARCHAR(100) DEFAULT 'general',
                `specialization` VARCHAR(255) NULL,
                `abha_id` VARCHAR(100) NULL,
                `age` INT NULL,
                `gender` VARCHAR(20) NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                INDEX `idx_username` (`username`),
                INDEX `idx_role` (`role`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)

            # Sessions table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS `sessions` (
                `session_id` VARCHAR(64) NOT NULL PRIMARY KEY,
                `token_number` VARCHAR(50) NOT NULL,
                `patient_name` VARCHAR(255) NOT NULL DEFAULT 'Guest Patient',
                `department` VARCHAR(50) NOT NULL DEFAULT 'general',
                `language` VARCHAR(10) NOT NULL DEFAULT 'en',
                `abha_id` VARCHAR(100) NULL,
                `consent` BOOLEAN NOT NULL DEFAULT TRUE,
                `turn_count` INT NOT NULL DEFAULT 0,
                `interview_complete` BOOLEAN NOT NULL DEFAULT FALSE,
                `red_flag` BOOLEAN NOT NULL DEFAULT FALSE,
                `red_flag_reason` TEXT NULL,
                `messages` JSON NULL,
                `transcript` JSON NULL,
                `documents` JSON NULL,
                `summary` JSON NULL,
                `narrative_summary` JSON NULL,
                `route` JSON NULL,
                `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
                `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX `idx_token` (`token_number`),
                INDEX `idx_dept` (`department`),
                INDEX `idx_created` (`created_at`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
            """)

            # Token sequence table
            cur.execute("""
            CREATE TABLE IF NOT EXISTS `token_sequence` (
                `id` INT NOT NULL PRIMARY KEY,
                `current_token` INT NOT NULL DEFAULT 0
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
            """)
            cur.execute(
                "UPDATE `users` SET `role` = 'patient' WHERE `role` NOT IN ('patient', 'doctor')"
            )
            cur.execute(
                "ALTER TABLE `users` MODIFY `role` ENUM('patient', 'doctor') NOT NULL DEFAULT 'patient'"
            )
            cur.execute("""
            INSERT INTO `token_sequence` (`id`, `current_token`)
            VALUES (1, 4)
            ON DUPLICATE KEY UPDATE `id` = `id`;
            """)

            # Schema migrations for multi-specialty doctors, privacy and waiting room
            migration_statements = [
                "ALTER TABLE `users` ADD COLUMN `hospital` VARCHAR(255) NULL;",
                "ALTER TABLE `users` ADD COLUMN `cabin` VARCHAR(50) NULL;",
                "ALTER TABLE `sessions` ADD COLUMN `consulting_doctor` JSON NULL;",
                "ALTER TABLE `sessions` ADD COLUMN `status` VARCHAR(50) NOT NULL DEFAULT 'waiting';",
                "ALTER TABLE `sessions` ADD COLUMN `demonstration_active` BOOLEAN NOT NULL DEFAULT TRUE;",
                "ALTER TABLE `sessions` ADD COLUMN `attached_records` JSON NULL;",
                "ALTER TABLE `sessions` ADD COLUMN `share_past_history` BOOLEAN NOT NULL DEFAULT TRUE;",
                "ALTER TABLE `sessions` ADD COLUMN `ayurveda_profile` JSON NULL;",
                "ALTER TABLE `sessions` ADD COLUMN `called_at` VARCHAR(50) NULL;",
                "ALTER TABLE `sessions` ADD COLUMN `past_diagnoses` JSON NULL;",
            ]
            for stmt in migration_statements:
                try:
                    cur.execute(stmt)
                except Exception:
                    pass  # Column already exists


        conn.close()
        _DB_INITIALIZED = True
        _MYSQL_AVAILABLE = True
        logger.info(f"Connected to MySQL database '{MYSQL_DATABASE}' on {MYSQL_HOST}:{MYSQL_PORT}.")
        return True
    except Exception as e:
        logger.warning(f"MySQL initialization notice: {e}")
        _MYSQL_AVAILABLE = False
        return False
