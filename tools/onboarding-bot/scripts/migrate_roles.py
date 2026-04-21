#!/usr/bin/env python3
"""
一次性迁移脚本：
- 读 knowledge/plays/{暗流涌动,暗月初升,梦陨春宵}.md
- 抽出每个 #### <角色名> 章节
- 去重合并（同角色出现在多剧本时，保留首个内容，合并"出现在"列表）
- 输出 knowledge/roles/<角色名>.md
- 瘦身 knowledge/plays/*.md（替换"角色详解"整节为"角色清单"摘要）

跑法：python3 tools/onboarding-bot/scripts/migrate_roles.py
"""
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
PLAYS_DIR = ROOT / "knowledge" / "plays"
ROLES_DIR = ROOT / "knowledge" / "roles"

PLAY_FILES = ["暗流涌动.md", "暗月初升.md", "梦陨春宵.md"]

TYPE_HEADINGS = {
    "善良阵营-镇民": "townsfolk",
    "善良阵营-外来者": "outsider",
    "邪恶阵营-爪牙": "minion",
    "邪恶阵营-恶魔": "demon",
}
TYPE_ORDER = ["善良阵营-镇民", "善良阵营-外来者", "邪恶阵营-爪牙", "邪恶阵营-恶魔"]


def parse_play(md_text):
    """返回 [(type_cn, role_name, role_body)]"""
    out = []
    m = re.search(r"(?m)^## 角色详解\s*$", md_text)
    if not m:
        return out
    roles_section = md_text[m.end():]
    # 截到下一个 ## 标题（但不包括 ### / #### 子标题）
    next_h2 = re.search(r"(?m)^## (?!角色详解)", roles_section)
    if next_h2:
        roles_section = roles_section[:next_h2.start()]

    # 按 ### 切分 type 块
    type_parts = re.split(r"(?m)^### ", roles_section)
    for tp in type_parts[1:]:
        type_lines = tp.split("\n", 1)
        type_name = type_lines[0].strip()
        if type_name not in TYPE_HEADINGS:
            continue
        type_body = type_lines[1] if len(type_lines) > 1 else ""
        # 按 #### 切分 role 块
        role_parts = re.split(r"(?m)^#### ", type_body)
        for rp in role_parts[1:]:
            role_lines = rp.split("\n", 1)
            role_name = role_lines[0].strip()
            role_body = (role_lines[1] if len(role_lines) > 1 else "").rstrip()
            # 去掉末尾的 --- 分隔
            role_body = re.sub(r"(?m)^---\s*$", "", role_body).rstrip()
            out.append((type_name, role_name, role_body))
    return out


def build_role_doc(role_name, type_cn, body, scripts):
    scripts_list = "\n".join(f"- {s}" for s in sorted(scripts))
    return (
        f"# {role_name}\n\n"
        f"## 角色类型\n"
        f"{type_cn}\n\n"
        f"## 出现在剧本\n"
        f"{scripts_list}\n\n"
        f"{body.strip()}\n"
    )


def preserve_scaffold(full_text, role_list_md):
    """把 `## 角色详解` 整节（到下一个 ## 为止）替换成 role_list_md。"""
    m_start = re.search(r"(?m)^## 角色详解\s*$", full_text)
    if not m_start:
        return full_text
    after = full_text[m_start.start():]
    m_next = re.search(r"(?m)\n## (?!角色详解)", after)
    if m_next:
        end_pos = m_start.start() + m_next.start() + 1  # +1 保留前面的 \n
    else:
        end_pos = len(full_text)
    return full_text[:m_start.start()] + role_list_md + full_text[end_pos:]


def main():
    ROLES_DIR.mkdir(parents=True, exist_ok=True)

    # role_name -> {"type": ..., "body": ..., "scripts": set, "conflicts": []}
    roles_map = {}
    # script_name -> {type: [role_names]}
    script_roles = defaultdict(lambda: defaultdict(list))

    for pf in PLAY_FILES:
        script_name = pf.replace(".md", "")
        text = (PLAYS_DIR / pf).read_text(encoding="utf-8")
        parsed = parse_play(text)
        for (type_cn, role_name, body) in parsed:
            script_roles[script_name][type_cn].append(role_name)
            if role_name in roles_map:
                roles_map[role_name]["scripts"].add(script_name)
                # 若 body 和已有不同，记录冲突
                if roles_map[role_name]["body"].strip() != body.strip():
                    roles_map[role_name]["conflicts"].append(script_name)
            else:
                roles_map[role_name] = {
                    "type": type_cn,
                    "body": body,
                    "scripts": {script_name},
                    "conflicts": [],
                }

    # 写 roles/
    print(f"\n=== 写入 {len(roles_map)} 个角色文件 ===")
    for role_name, info in sorted(roles_map.items()):
        content = build_role_doc(role_name, info["type"], info["body"], info["scripts"])
        (ROLES_DIR / f"{role_name}.md").write_text(content, encoding="utf-8")
        conflict_note = f"  ⚠ 冲突：{info['conflicts']}" if info["conflicts"] else ""
        print(f"  roles/{role_name}.md ({len(info['scripts'])} 剧本){conflict_note}")

    # 瘦身 plays/
    print(f"\n=== 瘦身 {len(PLAY_FILES)} 个剧本文件 ===")
    for pf in PLAY_FILES:
        script_name = pf.replace(".md", "")
        text = (PLAYS_DIR / pf).read_text(encoding="utf-8")

        by_type = script_roles[script_name]
        lines = ["## 角色清单", ""]
        for type_cn in TYPE_ORDER:
            if type_cn in by_type:
                names = "、".join(by_type[type_cn])
                lines.append(f"**{type_cn}（{len(by_type[type_cn])}）**：{names}")
                lines.append("")
        lines.append("> 每个角色的完整技能描述和规则澄清见 `knowledge/roles/<角色名>.md`")
        lines.append("")
        role_list_md = "\n".join(lines)

        thin = preserve_scaffold(text, role_list_md)
        (PLAYS_DIR / pf).write_text(thin, encoding="utf-8")
        print(f"  plays/{pf} 瘦身完成")

    print("\n=== 完成 ===")
    conflicts = [n for n, i in roles_map.items() if i["conflicts"]]
    if conflicts:
        print(f"⚠ 以下角色在多个剧本里内容不一致，需人工 review 选哪份：")
        for n in conflicts:
            print(f"    - {n} (分歧剧本: {roles_map[n]['conflicts']})")


if __name__ == "__main__":
    main()
