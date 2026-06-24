# Secret Rotation and History Purge Playbook

This document lists step-by-step instructions to rotate exposed secrets and purge them from git history safely.

1) Rotate the exposed Firebase API key (do this first):
   - In Firebase Console > Project Settings > General > Web API Key: create a new key or restrict and rotate.
   - Restrict key by HTTP referrer to your GitHub Pages domain.
   - Revoke the old key once the new key is in place.

2) Add new keys to GitHub repository secrets:
   - Settings → Secrets and variables → Actions → New repository secret
   - Add the `REACT_APP_FIREBASE_*` values listed in `.env.example`.

3) Purge the old secret from git history (coordinate with collaborators):
   Option A — BFG (simpler):
   - Install BFG: `brew install bfg` or download jar from https://rtyley.github.io/bfg-repo-cleaner/
   - Create a file `secrets.txt` containing the exact secret string to remove.
   - Run:
     ```bash
     git clone --mirror https://github.com/YOUR-ORG/AO-AI-Tracking.io.git
     java -jar bfg.jar --replace-text secrets.txt AO-AI-Tracking.io.git
     cd AO-AI-Tracking.io.git
     git reflog expire --expire=now --all
     git gc --prune=now --aggressive
     git push --force
     ```

   Option B — git-filter-repo (recommended for flexibility):
   - Install: `pip install git-filter-repo` or use your package manager.
   - Run:
     ```bash
     git clone https://github.com/YOUR-ORG/AO-AI-Tracking.io.git
     cd AO-AI-Tracking.io
     git filter-repo --replace-text replacements.txt
     # where replacements.txt contains lines like:
     #    AZIA_SY_OLD_KEY==>REDACTED
     git push --force
     ```

Notes:
 - Rewriting history requires all collaborators to reclone or reset their local copies.
 - Coordinate a maintenance window; inform downstream consumers.

4) After purge: rotate keys again if needed, and verify no copies remain (search again).

5) Monitoring and prevention:
   - Add secret scanning in CI (gitleaks/trufflehog).
   - Add pre-commit hook (husky) to block committing obvious secrets.
