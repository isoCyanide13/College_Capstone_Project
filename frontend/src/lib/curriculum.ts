/**
 * Curriculum Map — Domain → Subject Mapping
 * ============================================
 * Used by the Question Practice hub to auto-select
 * relevant subjects when a domain is chosen.
 */

export const curriculumMap: Record<string, string[]> = {
  "Web Development": [
    "Data Structures & Algorithms",
    "Database Management Systems",
    "Computer Networks",
    "System Design",
    "Web Technologies & API Design",
  ],
  "Mobile App Development": [
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Operating Systems",
    "Web Technologies & API Design",
  ],
  "Artificial Intelligence & Machine Learning": [
    "Data Structures & Algorithms",
    "Deep Learning Architectures",
    "Statistics & Probability",
    "System Design",
    "Database Management Systems",
  ],
  "Data Science & Analytics": [
    "Database Management Systems",
    "Statistics & Probability",
    "Data Structures & Algorithms",
  ],
  "Cyber Security & InfoSec": [
    "Computer Networks",
    "Operating Systems",
    "Cryptography & Network Security",
    "Database Management Systems",
  ],
  "Cloud Computing & DevOps": [
    "Computer Networks",
    "Operating Systems",
    "Cloud Architecture & Deployment",
    "System Design",
  ],
  "Systems & Low-Level Programming": [
    "Operating Systems",
    "Data Structures & Algorithms",
    "Object-Oriented Programming",
    "Computer Networks",
  ],
  "Competitive Programming": [
    "Data Structures & Algorithms",
    "Discrete Mathematics",
  ],
};

export const allDomains = Object.keys(curriculumMap);

export const allSubjects = Array.from(
  new Set(Object.values(curriculumMap).flat())
);
