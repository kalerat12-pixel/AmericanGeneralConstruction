# Evaluation — dev split — classifier: desklib/ai-text-detector-v1.01

Document flagged as AI when ≥50% of its words are in red sentences.

| Group | Docs | Wrong | Error rate | Mean AI% | Too short |
|---|---:|---:|---:|---:|---:|
| human / esl | 30 | 1 | 3% | 6 | 0 |
| human / student | 60 | 1 | 2% | 12 | 0 |
| human / wiki | 20 | 1 | 5% | 4 | 0 |
| **FALSE POSITIVES (human flagged as AI)** | **110** | **3** | **3%** | | |
| ai / modern | 28 | 8 | 29% | 69 | 0 |
| ai / student_llm | 40 | 10 | 25% | 69 | 0 |
| **MISSED AI (AI not flagged)** | **68** | **18** | **26%** | | |

AUC (combined average score): 0.956   |   AUC (classifier alone, whole doc): 0.983

Verdicts shown in the app: human: Likely AI 3, Likely human 95, Mixed / unclear 12; ai: Likely AI 50, Likely human 11, Mixed / unclear 7
