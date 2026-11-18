# Evaluation — test split — classifier: desklib/ai-text-detector-v1.01

Document flagged as AI when ≥50% of its words are in red sentences.

| Group | Docs | Wrong | Error rate | Mean AI% | Too short |
|---|---:|---:|---:|---:|---:|
| human / esl | 30 | 0 | 0% | 2 | 0 |
| human / student | 60 | 2 | 3% | 9 | 0 |
| human / wiki | 20 | 0 | 0% | 0 | 0 |
| **FALSE POSITIVES (human flagged as AI)** | **110** | **2** | **2%** | | |
| ai / claude_student | 8 | 2 | 25% | 70 | 0 |
| ai / modern | 28 | 11 | 39% | 61 | 0 |
| ai / student_llm | 40 | 13 | 32% | 69 | 0 |
| **MISSED AI (AI not flagged)** | **76** | **26** | **34%** | | |

AUC (combined average score): 0.965   |   AUC (classifier alone, whole doc): 0.985

How often the verdict was wrong at each confidence level (Mixed/unclear verdicts excluded):

| Confidence | Docs with a Likely AI / Likely human verdict | Wrong |
|---|---:|---:|
| High | 89 | 2 (2%) |
| Medium | 50 | 4 (8%) |
| Low | 27 | 12 (44%) |

Verdicts shown in the app: human: Likely AI 2, Likely human 98, Mixed / unclear 10; ai: Likely AI 50, Likely human 16, Mixed / unclear 10
