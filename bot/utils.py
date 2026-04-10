def format_meeting_result(analysis: dict) -> str:
    lines = []

    lines.append("<b>MEETING RESULTS</b>")
    lines.append("")

    if analysis.get("summary"):
        lines.append("<b>Summary:</b>")
        lines.append(analysis["summary"])
        lines.append("")

    if analysis.get("topics"):
        lines.append("<b>Topics:</b>")
        for topic in analysis["topics"]:
            lines.append(f"  - {topic}")
        lines.append("")

    if analysis.get("decisions"):
        lines.append("<b>Decisions:</b>")
        for decision in analysis["decisions"]:
            lines.append(f"  - {decision}")
        lines.append("")

    if analysis.get("action_items"):
        lines.append("<b>Action Items:</b>")
        for item in analysis["action_items"]:
            assignee = f" - {item['assignee']}" if item.get("assignee") else ""
            deadline = f" (by {item['deadline']})" if item.get("deadline") else ""
            lines.append(f"  - {item['text']}{assignee}{deadline}")
        lines.append("")

    return "\n".join(lines)