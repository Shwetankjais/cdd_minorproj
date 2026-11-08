import re

RULES = (
    (r"assert\s+(\d{3})\s*==\s*(\d{3})", "Test",
     "A test compared HTTP {0} with HTTP {1} and the status codes differed.",
     "Check the test's expected status and verify its credentials, fixtures, and environment."),
    (r"AssertionError|\bassert .+ ==", "Test",
     "A test received a result that did not match its assertion.",
     "Open the failing test and compare the expected and actual values before changing the assertion."),
    (r"ModuleNotFoundError: No module named ['\"]([^'\"]+)", "Install",
     "Python could not import the {0} module.",
     "Install the backend requirements in the active environment and verify the import name."),
    (r"SyntaxError|IndentationError", "Build",
     "The compiler found invalid syntax or indentation.",
     "Open the reported file and line and check punctuation, brackets, and indentation."),
    (r"failed to solve|docker.*exit code|executor failed", "Docker",
     "A Docker image build command failed.",
     "Inspect the failing Dockerfile instruction and rebuild with plain progress output."),
    (r"npm ERR!|vite.*error|rollup.*failed|failed to resolve import", "Build",
     "The frontend toolchain could not install or compile the application.",
     "Run npm ci and npm run build locally, then check the first reported error."),
)


def analyze(log, stage=None):
    for pattern, inferred_stage, reason, fix in RULES:
        match = re.search(pattern, log, re.IGNORECASE)
        if match:
            return {"failed_stage": stage or inferred_stage,
                    "plain_english_reason": reason.format(*match.groups()), "suggested_fix": fix}
    return {"failed_stage": stage or "Build",
            "plain_english_reason": "The job reported a failure without a recognized error in the available logs.",
            "suggested_fix": "Open the failed job in GitHub Actions and inspect the first failing step."}
