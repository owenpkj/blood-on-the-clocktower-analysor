#!/usr/bin/env bash
# Daily cleanup: drop chat history older than 30 days.
# Assumes n8n_chat_histories has a `created_at` timestamptz column
# (add once via: ALTER TABLE n8n_chat_histories ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();).
#
# Install as a single-line cron (script writes its own log):
#   echo "0 3 * * * /opt/botc-agent/tools/onboarding-bot/deploy/cron-cleanup.sh" > /tmp/botc.cron
#   crontab /tmp/botc.cron

set -euo pipefail

CUTOFF_DAYS="${CUTOFF_DAYS:-30}"
CONTAINER="botc-pg"
LOG="/var/log/botc-cleanup.log"

{
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] running cleanup (cutoff=${CUTOFF_DAYS} days)"
  docker exec "$CONTAINER" psql -U n8n -d n8n -c "
    DELETE FROM n8n_chat_histories
    WHERE created_at IS NOT NULL
      AND created_at < NOW() - INTERVAL '${CUTOFF_DAYS} days';
  " 2>&1
  echo "[$(date -u '+%Y-%m-%dT%H:%M:%SZ')] done"
} >> "$LOG" 2>&1
