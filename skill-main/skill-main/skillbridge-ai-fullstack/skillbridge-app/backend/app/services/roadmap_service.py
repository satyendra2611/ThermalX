"""Adaptive roadmap generation from topic-level competency."""

TOPIC_ORDER = ["html", "css", "javascript", "async-js", "js-project", "react"]
TOPIC_NAMES = {
    "html": "HTML", "css": "CSS", "javascript": "JavaScript",
    "async-js": "Async JavaScript", "js-project": "JavaScript Project", "react": "React",
}


def build_roadmap(topic_scores: list[dict]) -> list[dict]:
    """
    IF score < 60          -> priority improvement
    IF 60 <= score < 80     -> learn + practice (current focus)
    IF score >= 80          -> advanced / completed
    Topics not yet assessed remain locked/upcoming in sequence.
    """
    score_by_topic = {t["topicId"]: t for t in topic_scores}
    nodes = []
    current_assigned = False

    for topic_id in TOPIC_ORDER:
        info = score_by_topic.get(topic_id)
        if info is None:
            nodes.append({
                "topicId": topic_id,
                "topicName": TOPIC_NAMES[topic_id],
                "status": "locked",
                "competencyLevel": "locked",
            })
            continue

        level = info["level"]
        if level == "strong":
            status = "completed"
        elif level == "developing":
            status = "current" if not current_assigned else "upcoming"
            current_assigned = True
        else:
            status = "priority"

        nodes.append({
            "topicId": topic_id,
            "topicName": TOPIC_NAMES[topic_id],
            "status": status,
            "competencyLevel": level,
        })

    return nodes
