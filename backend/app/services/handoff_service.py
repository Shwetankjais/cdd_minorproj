"""Translate GitHub job and step states into the dashboard's four stages."""

import re

STAGES = (
    ("Checkout & Install", "Dev", 0, 25),
    ("Build", "CI Team", 25, 50),
    ("Test", "QA Testing Team", 50, 80),
    ("Docker & Deploy", "CD Release Team", 80, 100),
)
COMPLETE = {"success", "skipped", "neutral"}


def stage_index(name):
    name = name.lower()
    if re.search(r"docker|deploy|release|publish|container", name):
        return 3
    if re.search(r"test|lint|qa\b|verify", name):
        return 2
    if re.search(r"checkout|install|setup|prepare|dependencies", name):
        return 0
    return 1


def progress_snapshot(fractions):
    stages = []
    alert = None
    progress = 0
    current_stage = STAGES[0][0]
    for index, (name, team, start, end) in enumerate(STAGES):
        fraction = fractions[index]
        stages.append({"name": name, "team": team, "progress": round(fraction * 100),
                       "status": "completed" if fraction == 1 else "in_progress" if fraction else "pending"})
        # Later parallel work is visible per stage, but never skips an unfinished gate.
        if progress == start:
            progress = round(start + (end - start) * fraction)
            current_stage = name
        if 0.75 <= fraction < 1 and index + 1 < len(STAGES):
            next_team = STAGES[index + 1][1]
            alert = {"from_team": team, "to_team": next_team, "stage": name,
                     "stage_progress": round(fraction * 100),
                     "message": f"{next_team}: {name} is almost complete."}
    return {"progress": progress, "current_stage": current_stage, "stages": stages,
            "handoff_alert": alert}


def job_progress(jobs, conclusion=None):
    if conclusion == "success":
        return progress_snapshot([1, 1, 1, 1])
    groups = [[], [], [], []]
    last_active = 0
    for job in jobs:
        index = stage_index(job["name"])
        if job.get("status") not in {"queued", "pending", "waiting", "requested"}:
            last_active = max(last_active, index)
        steps = job.get("steps") or []
        preparation = [step for step in steps if stage_index(step["name"]) == 0]
        if index == 1 and preparation:
            groups[0].extend(float(step.get("conclusion") in COMPLETE) for step in preparation)
            steps = [step for step in steps if step not in preparation]
        if job.get("conclusion") in COMPLETE:
            groups[index].append(1)
        elif steps:
            groups[index].append(sum(step.get("conclusion") in COMPLETE for step in steps) / len(steps))
        else:
            groups[index].append(0)
    snapshot = progress_snapshot([
        sum(group) / len(group) if group else float(i < last_active)
        for i, group in enumerate(groups)
    ])
    if snapshot["progress"] == 100:
        snapshot["progress"] = 99
    return snapshot


def simulation_progress(percent):
    return progress_snapshot([min(1, max(0, (percent - start) / (end - start)))
                              for _, _, start, end in STAGES])
