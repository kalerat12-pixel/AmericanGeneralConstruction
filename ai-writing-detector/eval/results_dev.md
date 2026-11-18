# Evaluation — dev split — classifier: desklib/ai-text-detector-v1.01

Document flagged as AI when ≥50% of its words are in red sentences.

| Group | Docs | Wrong | Error rate | Mean AI% | Too short |
|---|---:|---:|---:|---:|---:|
| human / esl | 30 | 1 | 3% | 5 | 0 |
| human / student | 60 | 1 | 2% | 6 | 0 |
| human / wiki | 20 | 1 | 5% | 5 | 0 |
| **FALSE POSITIVES (human flagged as AI)** | **110** | **3** | **3%** | | |
| ai / modern | 28 | 5 | 18% | 80 | 0 |
| ai / student_llm | 40 | 9 | 22% | 73 | 0 |
| **MISSED AI (AI not flagged)** | **68** | **14** | **21%** | | |

AUC (combined average score): 0.973   |   AUC (classifier alone, whole doc): 0.983

How often the verdict was wrong at each confidence level (Mixed/unclear verdicts excluded):

| Confidence | Docs with a Likely AI / Likely human verdict | Wrong |
|---|---:|---:|
| High | 92 | 2 (2%) |
| Medium | 55 | 3 (5%) |
| Low | 24 | 8 (33%) |

Verdicts shown in the app: human: Likely AI 3, Likely human 104, Mixed / unclear 3; ai: Likely AI 54, Likely human 10, Mixed / unclear 4
