# Control Room + LMS

Local, non-destructive indexer + learning tracker for G:\My Drive.

## Run
1. Double-click start.bat
2. Browser opens at http://127.0.0.1:5000
3. Click Re-Scan in the sidebar (first run only, then incremental)
4. Browse / search / track progress

## Safety
- Writes ONLY inside 00_CONTROL_ROOM
- Never modifies existing Drive files
- Cloud-only files detected and skipped
- Missing files soft-deleted (progress/notes preserved)
- Server binds to 127.0.0.1 only

## Config
Edit config.json, restart. Key fields:
- root_path   : Drive location
- course_roots: folders treated as LMS courses
- exclude_names: folders to skip during scan

## Logs
- logs/app.log
- logs/scan.log