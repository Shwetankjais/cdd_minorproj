from app.services import git_service


def test_git_status_and_selective_commit_with_local_push(tmp_path, monkeypatch):
    repo = tmp_path / "repo"
    origin = tmp_path / "origin.git"
    repo.mkdir()
    git = git_service.run_git
    git(repo, "init", "-b", "main")
    git(repo, "config", "user.name", "DevPulse Test")
    git(repo, "config", "user.email", "test@example.com")
    git(tmp_path, "init", "--bare", str(origin))
    git(repo, "remote", "add", "origin", str(origin))
    monkeypatch.setattr(git_service, "PROJECT_ROOT", repo)

    (repo / "tracked.txt").write_text("first\n")
    (repo / "removed.txt").write_text("remove this\n")
    git(repo, "add", ".")
    git(repo, "commit", "-m", "Initialize fixture")
    (repo / "tracked.txt").write_text("first\nsecond\n")
    (repo / "removed.txt").unlink()
    (repo / "added.txt").write_text("new file\n")
    git(repo, "add", "tracked.txt")

    entries = {item["path"]: item for item in git_service.status()["files"]}
    assert entries["added.txt"] == {"path": "added.txt", "status": "A", "additions": 1, "deletions": 0}
    assert entries["tracked.txt"]["additions"] == 1
    assert entries["removed.txt"]["deletions"] == 1
    result = git_service.commit_push(None, ["added.txt", "removed.txt"], "Select two paths", "main")
    assert result["pushed"] is True
    assert git(origin, "rev-parse", "refs/heads/main").strip().decode() == result["commit"]
    assert git(repo, "diff", "--cached", "--name-only") == b"tracked.txt\n"
