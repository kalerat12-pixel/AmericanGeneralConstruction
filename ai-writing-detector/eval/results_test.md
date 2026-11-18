# Evaluation — test split — classifier: fakespot-ai/roberta-base-ai-text-detection-v1

Document flagged as AI when ≥50% of its words are in red sentences.

| Group | Docs | Wrong | Error rate | Mean AI% | Too short |
|---|---:|---:|---:|---:|---:|
| human / esl | 30 | 0 | 0% | 7 | 0 |
| human / student | 60 | 2 | 3% | 6 | 0 |
| human / wiki | 20 | 4 | 20% | 23 | 0 |
| **FALSE POSITIVES (human flagged as AI)** | **110** | **6** | **5%** | | |
| ai / claude_student | 8 | 3 | 38% | 68 | 0 |
| ai / modern | 28 | 6 | 21% | 69 | 0 |
| ai / student_llm | 40 | 19 | 48% | 52 | 0 |
| **MISSED AI (AI not flagged)** | **76** | **28** | **37%** | | |

AUC (combined average score): 0.857   |   AUC (classifier alone, whole doc): 0.861

Verdicts shown in the app: human: Likely AI 6, Likely human 93, Mixed / unclear 11; ai: Likely AI 48, Likely human 20, Mixed / unclear 8
