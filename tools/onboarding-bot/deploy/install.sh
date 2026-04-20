#!/usr/bin/env bash
# Bootstrap an Ubuntu 22.04/24.04 VPS for onboarding-bot deployment.
# Run ONCE as root (or via sudo).

set -euo pipefail

echo ">> updating apt packages"
apt-get update -y
apt-get install -y curl ca-certificates gnupg ufw git

if ! command -v docker &>/dev/null; then
  echo ">> installing Docker"
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -y
  apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
  systemctl enable --now docker
else
  echo ">> Docker already installed, skipping"
fi

echo ">> configuring firewall"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Small VPS (<2G RAM) helper — add swap to survive n8n + Next.js build
TOTAL_MEM_KB=$(awk '/MemTotal/ {print $2}' /proc/meminfo)
if [[ "$TOTAL_MEM_KB" -lt 2097152 ]] && [[ ! -f /swapfile ]]; then
  echo ">> adding 2GB swap"
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

echo ">> done. Next steps:"
echo "  1. git clone <repo> && cd <repo>/tools/onboarding-bot/deploy"
echo "  2. cp .env.example .env  &&  edit .env"
echo "  3. docker compose up -d --build"
echo "  4. In n8n UI, add Credentials: DeepSeek + Postgres, then import n8n/workflow-v0.3.json"
