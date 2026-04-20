# onboarding-bot 部署手册

## 前置准备

- **一台香港 VPS**（推荐 2C4G / 40G SSD，阿里云 / 腾讯云轻量约 60 元/月）
  - 系统：Ubuntu 24.04 LTS
  - 开放端口：22（SSH）/ 80 / 443
- **一个自有域名**（任意注册商；不需要备案，因为机器在 HK）
  - 一条 A 记录：`botc.<yourdomain>` → VPS 公网 IP
- **DeepSeek API Key**（用户自备）

## 部署步骤

### 1. VPS 首次初始化（root）

SSH 到 VPS，一条命令装 Docker / 防火墙 / swap：

```bash
# 先把代码拉下来再跑（或直接 pipe 到 bash —— 看你信任程度）
git clone <你的仓库> /opt/血染钟楼Agent
cd /opt/血染钟楼Agent/tools/onboarding-bot/deploy
bash install.sh
```

### 2. 配置环境变量

```bash
cp .env.example .env
vi .env  # 或 nano
```

必填：
- `DOMAIN` — 你的域名（如 `botc.example.com`），Caddy 会用这个自动申请证书
- `PG_PASSWORD` — Postgres 密码，用 `openssl rand -hex 32` 生成
- `N8N_ENCRYPTION_KEY` — n8n Credentials 加密密钥，同上生成，**设定后不能再改**
- `VALID_INVITE_CODES` — 邀请码，逗号分隔

### 3. 起栈

```bash
docker compose up -d --build
```

Caddy 会在首次请求时自动申请 Let's Encrypt 证书（确保 DNS 已经解析到本机、80/443 开放）。

### 4. 验证

- `https://<DOMAIN>` — 应该看到登录页
- `docker compose logs -f` — 看各个服务启动状态
- `docker compose ps` — 确认全部 `healthy / running`

### 5. 配置 n8n Credentials 与 workflow

n8n 默认不对公网暴露。配置有两种方式：

**方式 A — SSH tunnel（推荐、安全）**

本机跑：
```bash
ssh -L 5678:localhost:5678 user@<VPS-IP>
```

本机浏览器开 http://localhost:5678，进 n8n：
1. 注册 owner 账号（仅此 n8n 实例用）
2. Credentials 菜单：
   - 加 **OpenAI API**：名称 `DeepSeek`，Key = 你的 DeepSeek key，Base URL = `https://api.deepseek.com`
   - 加 **Postgres**：Host `postgres`，DB `n8n`，User `n8n`，Password 同 `.env` 里的 `PG_PASSWORD`
3. 导入 workflow：`tools/onboarding-bot/n8n/workflow-v0.3.json`，确认每个节点的 credential 引用正确
4. 右上角激活 workflow

**方式 B — 暴露 n8n 编辑器 subdomain**（便于多人协作）

在 `.env` 里加：
```
N8N_EDITOR_BASE_URL=https://n8n.<DOMAIN>/
```

取消 `Caddyfile` 里 n8n 段落的注释，设置 basic_auth。

### 6. 冒烟测试

打开 `https://<DOMAIN>`，用邀请码登录，看 POTCC 开场白流式吐出。问几个问题（基础规则 / 占卜师 / 怎么玩），确认：
- 流式工作
- 意图分支正确
- Markdown 渲染正常

## 运维

### 升级代码

```bash
cd /opt/血染钟楼Agent
git pull
cd tools/onboarding-bot/deploy
docker compose up -d --build
```

### 修改邀请码

```bash
vi .env
docker compose restart web
```

### 备份 Postgres

```bash
# 加到 crontab，每日凌晨跑
docker exec botc-pg pg_dump -U n8n n8n | gzip > /root/backup/pg_$(date +%F).sql.gz
# 可再 rsync 到阿里云 OSS 或本地
```

### 查看日志

```bash
docker compose logs -f web       # Next.js
docker compose logs -f n8n        # n8n
docker compose logs -f caddy      # HTTPS / proxy
docker compose logs -f postgres  # DB
```

## 常见问题

### Caddy 证书申请失败
- 检查 DOMAIN 的 A 记录已生效：`dig <DOMAIN> @8.8.8.8`
- 检查 80/443 已开：`sudo ufw status`
- 查 Caddy 日志看 ACME 错误

### n8n workflow 激活失败
- 检查 Credentials 全部连通（节点右上角测试按钮）
- 看 `docker compose logs n8n`

### 前端报 "加载历史失败"
- 检查 `POSTGRES_*` 环境变量和实际 Postgres 一致
- `docker compose exec postgres psql -U n8n -d n8n -c "\d n8n_chat_histories"` 确认表已被 n8n 建出

### DeepSeek 限流 / 慢
- DeepSeek 本身偶尔慢，前端会显示 typing indicator 等
- 若长时间无响应，重启 n8n 容器
