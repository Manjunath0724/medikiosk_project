-- =====================================================================
-- MediKiosk National Ayush Mission OPD Workstation - MySQL Schema
-- Database: medikiosk_db
-- =====================================================================

CREATE DATABASE IF NOT EXISTS `medikiosk_db`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE `medikiosk_db`;

-- ---------------------------------------------------------------------
-- Table 1: users (Authentication, Doctors, Patients & Staff)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `username` VARCHAR(100) NOT NULL UNIQUE,
    `email` VARCHAR(255) NULL,
    `phone` VARCHAR(30) NULL,
    `full_name` VARCHAR(255) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,
    `salt` VARCHAR(64) NOT NULL,
    `role` ENUM('patient', 'doctor', 'staff', 'admin') NOT NULL DEFAULT 'patient',
    `department` VARCHAR(100) DEFAULT 'ayush',
    `specialization` VARCHAR(255) NULL,
    `abha_id` VARCHAR(100) NULL,
    `age` INT NULL,
    `gender` VARCHAR(20) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_username` (`username`),
    INDEX `idx_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------
-- Table 2: sessions (Patient Clinical Intake, Transcript, Summary & Queue)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
    `session_id` VARCHAR(64) NOT NULL PRIMARY KEY,
    `token_number` VARCHAR(50) NOT NULL,
    `patient_name` VARCHAR(255) NOT NULL DEFAULT 'Guest Patient',
    `department` VARCHAR(50) NOT NULL DEFAULT 'ayush',
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

-- ---------------------------------------------------------------------
-- Table 3: token_sequence (Sequential OPD Token Generator)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `token_sequence` (
    `id` INT NOT NULL PRIMARY KEY,
    `current_token` INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `token_sequence` (`id`, `current_token`)
VALUES (1, 4)
ON DUPLICATE KEY UPDATE `id` = `id`;

-- ---------------------------------------------------------------------
-- Seed Default Demo Accounts
-- Passwords:
--   patient -> patient123
--   doctor  -> doctor123
-- ---------------------------------------------------------------------
INSERT INTO `users` (`id`, `username`, `email`, `phone`, `full_name`, `password_hash`, `salt`, `role`, `department`, `specialization`, `abha_id`, `age`, `gender`, `created_at`)
VALUES
(
    'usr_demo_patient',
    'patient',
    'patient@example.com',
    '9876543210',
    'Ramesh Kumar',
    SHA2(CONCAT('a1b2c3d4e5f60718', 'patient123'), 256),
    'a1b2c3d4e5f60718',
    'patient',
    'ayush',
    NULL,
    '91-4521-8893-1029',
    42,
    'male',
    NOW()
),
(
    'usr_demo_doctor',
    'doctor',
    'doctor@ayush.gov.in',
    '9812345678',
    'Dr. Sunita Sharma',
    SHA2(CONCAT('b2c3d4e5f60718a1', 'doctor123'), 256),
    'b2c3d4e5f60718a1',
    'doctor',
    'ayush',
    'Ayush / Panchakarma & General Medicine',
    NULL,
    45,
    'female',
    NOW()
)
ON DUPLICATE KEY UPDATE `username` = `username`;

-- ---------------------------------------------------------------------
-- Seed 4 Realistic Clinical Demo Cases (Ayush OPD Queue)
-- ---------------------------------------------------------------------
INSERT INTO `sessions`
(`session_id`, `token_number`, `patient_name`, `department`, `language`, `abha_id`, `consent`, `turn_count`, `interview_complete`, `red_flag`, `red_flag_reason`, `messages`, `transcript`, `documents`, `summary`, `created_at`)
VALUES
(
    '00000000-0000-0000-0000-000000000001',
    '1',
    'Asha Devi',
    'ayush',
    'hi',
    '91-4523-8819-2041',
    TRUE,
    8,
    TRUE,
    FALSE,
    NULL,
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Severe bilateral knee pain and morning stiffness for 6 months, aggravated in cold weather (Sandhigata Vata)',
        'qa_pairs', JSON_ARRAY(),
        'red_flags', JSON_ARRAY(),
        'ayush_notes', JSON_OBJECT()
    ),
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Bilateral knee joint pain and morning stiffness for 6 months (Sandhigata Vata).',
        'hpi', '52-year-old female presents with progressive pain in bilateral knees, worse on climbing stairs and during cold mornings. Reports stiffness lasting 25-30 minutes upon waking. Relieved moderately by warm oil massage (Abhyanga) and warm compresses.',
        'past_medical_surgical', 'No history of diabetes or cardiac disease. Menopause 4 years ago.',
        'drug_allergy_history', 'No known drug allergies.',
        'family_history', 'Mother had severe joint arthritis.',
        'personal_history', 'Non-vegetarian, sedentary daily routine, irregular meal hours.',
        'review_of_systems', 'Mild weight gain noted. No chest pain or respiratory distress.',
        'prior_investigations_summary', 'X-ray bilateral knees shows reduced medial joint space and marginal osteophytes consistent with Grade II Osteoarthritis.',
        'ayush_assessment', JSON_OBJECT(
            'prakriti_assessment', 'Vata-Kapha Prakriti',
            'vikriti_assessment', 'Vata Vriddhi with Dhatu Kshaya (Asthi & Majja Dhatu)',
            'agni_status', 'Manda Agni (sluggish digestion with frequent bloating)',
            'koshtha_status', 'Krura Koshtha (tendency towards hard, irregular bowel movements)',
            'ahara_vihara_analysis', 'Habitual intake of dry, stale foods, irregular meal schedules, lack of daily physical activity.',
            'nidana_factors', 'Ativyayama followed by sudden sedentary habits, Sheeta Ahara-Vihara (exposure to cold air).',
            'dashavidha_pariksha', JSON_OBJECT(
                'sara', 'Madhyama',
                'samhanana', 'Avara',
                'pramana', 'Madhyama',
                'satmya', 'Mixed',
                'sattva', 'Madhyama',
                'ahara_shakti', 'Avara',
                'vyayama_shakti', 'Avara',
                'vaya', 'Pravriddha Vaya (52 years)'
            )
        )
    ),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000002',
    '2',
    'Rajesh Sharma',
    'general',
    'en',
    '91-8834-1290-7712',
    TRUE,
    8,
    TRUE,
    FALSE,
    NULL,
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Fasting blood sugar 195 mg/dL, frequent night urination and daytime fatigue for 3 weeks',
        'qa_pairs', JSON_ARRAY(),
        'red_flags', JSON_ARRAY(),
        'ayush_notes', JSON_OBJECT()
    ),
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Elevated fasting blood sugar (195 mg/dL) with polyuria and lethargy for 3 weeks.',
        'hpi', '45-year-old IT executive reporting new-onset nocturia (3-4 times/night), polydipsia, and unrefreshed sleep. Recorded OPD blood pressure is 144/92 mmHg.',
        'past_medical_surgical', 'Diagnosed with pre-diabetes 18 months ago, not on regular pharmacological therapy.',
        'drug_allergy_history', 'Allergic to Penicillin (causes urticaria).',
        'family_history', 'Both parents have Type 2 Diabetes Mellitus.',
        'personal_history', 'Sedentary desk work, high screen time, high carbohydrate diet.',
        'review_of_systems', 'No vision blurring, no chest discomfort, no lower extremity edema.',
        'prior_investigations_summary', 'Recent Fasting Blood Sugar: 195 mg/dL (Abnormal, Ref: 70-100). HbA1c: 8.4% (Abnormal, Ref: <5.7%).',
        'ayush_assessment', JSON_OBJECT(
            'prakriti_assessment', 'Kapha-Pitta Prakriti',
            'vikriti_assessment', 'Kapha-Meda Dushti manifesting as Prameha Purvarupa',
            'agni_status', 'Manda Agni with Ama accumulation',
            'koshtha_status', 'Madhyama Koshtha',
            'ahara_vihara_analysis', 'Excessive intake of sweet, refined carbohydrates, dairy, and daytime sleep (Divasvapna).',
            'dashavidha_pariksha', JSON_OBJECT(
                'sara', 'Madhyama',
                'samhanana', 'Madhyama',
                'pramana', 'Sthula (Overweight BMI 28.2)',
                'satmya', 'Madhura Satmya',
                'sattva', 'Pravara',
                'ahara_shakti', 'Madhyama',
                'vyayama_shakti', 'Avara',
                'vaya', 'Madhyama Vaya (45 years)'
            )
        )
    ),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000003',
    '3',
    'Meera Patel',
    'integrated',
    'en',
    '91-6211-9043-4481',
    TRUE,
    8,
    TRUE,
    FALSE,
    NULL,
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Severe acid reflux, retrosternal burning and sour belching after spicy meals (Amlapitta)',
        'qa_pairs', JSON_ARRAY(),
        'red_flags', JSON_ARRAY(),
        'ayush_notes', JSON_OBJECT()
    ),
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Heartburn and sour regurgitation for 2 months (Amlapitta).',
        'hpi', '29-year-old female presents with severe epigastric and retrosternal burning sensation occurring 30-45 minutes postprandially, exacerbated by fried foods, tomatoes, and lying flat at night.',
        'past_medical_surgical', 'No prior surgeries. Mild migraine headaches managed with paracetamol.',
        'drug_allergy_history', 'No known drug allergies.',
        'family_history', 'Father has GERD and peptic ulcer history.',
        'personal_history', 'High intake of tea/coffee (4 cups daily), late-night dinners.',
        'review_of_systems', 'No dysphagia, no melena, no hematemesis, no unintentional weight loss.',
        'prior_investigations_summary', 'H. pylori stool antigen: Negative. Upper GI Endoscopy: Grade A Reflux Esophagitis.',
        'ayush_assessment', JSON_OBJECT(
            'prakriti_assessment', 'Pitta-Vata Prakriti',
            'vikriti_assessment', 'Pitta Dosha Prakopa with Vidagdha Ajirna (Amlapitta)',
            'agni_status', 'Tikshna Agni (intense hunger with rapid acid formation)',
            'koshtha_status', 'Mridu Koshtha (tendency to loose stools with spicy food)',
            'ahara_vihara_analysis', 'Katu-Amla-Lavana Rasa excessive consumption, irregular eating intervals.',
            'dashavidha_pariksha', JSON_OBJECT(
                'sara', 'Madhyama',
                'samhanana', 'Madhyama',
                'pramana', 'Madhyama',
                'satmya', 'Mixed',
                'sattva', 'Madhyama',
                'ahara_shakti', 'Madhyama',
                'vyayama_shakti', 'Madhyama',
                'vaya', 'Yuva Vaya (29 years)'
            )
        )
    ),
    NOW()
),
(
    '00000000-0000-0000-0000-000000000004',
    '4',
    'Vikram Singh',
    'ayush',
    'hi',
    '91-3145-7729-6500',
    TRUE,
    8,
    TRUE,
    FALSE,
    NULL,
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Resting tremor in right hand and sleep onset insomnia for 4 months (Kampavata)',
        'qa_pairs', JSON_ARRAY(),
        'red_flags', JSON_ARRAY(),
        'ayush_notes', JSON_OBJECT()
    ),
    '[]',
    JSON_OBJECT(
        'chief_complaint', 'Right hand tremor and chronic sleep disruption (Kampavata / Vata Vyadhi).',
        'hpi', '61-year-old male reporting progressive involuntary rhythmic tremor of right fingers at rest, disappearing with purposeful action. Accompanied by muscle stiffness and disturbed sleep (Nidranasha).',
        'past_medical_surgical', 'Hypertension on Amlodipine 5mg for 5 years.',
        'drug_allergy_history', 'No known allergies.',
        'family_history', 'No Parkinsonian disorders reported.',
        'personal_history', 'Retired government clerk, vegetarian, non-smoker.',
        'review_of_systems', 'No postural lightheadedness, no visual hallucinations.',
        'prior_investigations_summary', 'Brain MRI: Age-related cerebral atrophy without focal acute infarction.',
        'ayush_assessment', JSON_OBJECT(
            'prakriti_assessment', 'Vata Pradhana Prakriti',
            'vikriti_assessment', 'Vata Prakopa localized to Majjadhatu and Siras (Kampavata)',
            'agni_status', 'Vishama Agni (unpredictable digestive capacity)',
            'koshtha_status', 'Krura Koshtha with chronic flatulence',
            'ahara_vihara_analysis', 'Vata-vitiating dry diet, mental anxiety, insufficient liquid nourishment.',
            'dashavidha_pariksha', JSON_OBJECT(
                'sara', 'Avara',
                'samhanana', 'Madhyama',
                'pramana', 'Madhyama',
                'satmya', 'Mixed',
                'sattva', 'Madhyama',
                'ahara_shakti', 'Avara',
                'vyayama_shakti', 'Avara',
                'vaya', 'Vriddha Vaya (61 years)'
            )
        )
    ),
    NOW()
)
ON DUPLICATE KEY UPDATE `session_id` = `session_id`;
