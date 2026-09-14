"""Assessment scoring and topic-wise competency classification."""

DEMO_QUESTIONS = [
    {"id": "q1", "topicId": "html", "topicName": "HTML", "questionType": "mcq",
     "question": "Which tag creates a hyperlink in HTML?",
     "options": ["<link>", "<a>", "<href>", "<nav>"], "correct": "<a>"},
    {"id": "q2", "topicId": "css", "topicName": "CSS", "questionType": "mcq",
     "question": "Which property controls spacing outside an element?",
     "options": ["padding", "margin", "gap", "border"], "correct": "margin"},
    {"id": "q3", "topicId": "javascript", "topicName": "JavaScript", "questionType": "conceptual",
     "question": "What does 'hoisting' mean in JavaScript?",
     "options": ["Variable declarations move to the top of scope", "CSS loads before JS", "The DOM re-renders", "Functions run twice"],
     "correct": "Variable declarations move to the top of scope"},
    {"id": "q4", "topicId": "javascript", "topicName": "JavaScript", "questionType": "scenario",
     "question": "A button click should wait for an API response before updating the UI. What do you reach for?",
     "options": ["async/await with a promise", "A CSS transition", "A synchronous loop", "setInterval"],
     "correct": "async/await with a promise"},
    {"id": "q5", "topicId": "react", "topicName": "React", "questionType": "conceptual",
     "question": "What triggers a React component to re-render?",
     "options": ["State or prop changes", "Refreshing CSS", "Browser resize only", "Nothing, it is static"],
     "correct": "State or prop changes"},
]


def classify_level(score: float) -> str:
    if score >= 80:
        return "strong"
    if score >= 60:
        return "developing"
    return "needs_focus"


def score_submission(answers: list[dict]) -> dict:
    """answers: [{questionId, answer}] -> per-topic + overall scoring."""
    answer_map = {a["questionId"]: a["answer"] for a in answers}
    topic_totals: dict[str, list[int]] = {}

    for q in DEMO_QUESTIONS:
        given = answer_map.get(q["id"])
        correct = 1 if given == q["correct"] else 0
        topic_totals.setdefault(q["topicId"], []).append(correct)

    topic_scores = []
    overall_correct = 0
    overall_total = 0
    topic_names = {q["topicId"]: q["topicName"] for q in DEMO_QUESTIONS}

    for topic_id, results in topic_totals.items():
        pct = round(sum(results) / len(results) * 100, 1)
        overall_correct += sum(results)
        overall_total += len(results)
        topic_scores.append({
            "topicId": topic_id,
            "topicName": topic_names[topic_id],
            "score": pct,
            "level": classify_level(pct),
        })

    overall = round((overall_correct / overall_total) * 100, 1) if overall_total else 0.0
    return {"overallScore": overall, "topicScores": topic_scores}
