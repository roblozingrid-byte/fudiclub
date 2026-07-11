# RTK (Rust Token Killer) Configuration

## Golden Rule for AI Agents

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

Use `rtk` for commands like `npm`, `pnpm`, `cargo`, `tsc`, `lint`, `prettier`, `test`, `git`, `docker`, etc.
