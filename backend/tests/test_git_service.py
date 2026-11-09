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


def test_rejected_push_returns_saved_commit_and_git_error(tmp_path, monkeypatch):
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

    readme = repo / "README.md"
    readme.write_text("initial\n")
    git(repo, "add", "README.md")
    git(repo, "commit", "-m", "Initialize fixture")
    git(repo, "push", "origin", "main")
    git(repo, "commit", "--allow-empty", "-m", "Advance remote")
    git(repo, "push", "origin", "main")
    git(repo, "reset", "--hard", "HEAD^")

    readme.write_text("selected update\n")
    (repo / "notes.txt").write_text("unselected\n")
    result = git_service.commit_push(None, ["README.md"], "Update README", "main")
    assert not result["pushed"]
    assert "rejected" in result["push_error"]
    assert result["commit_sha"] == git(repo, "rev-parse", "HEAD").strip().decode()
    assert result["files"] == ["README.md"]
    assert (repo / "notes.txt").read_text() == "unselected\n"
