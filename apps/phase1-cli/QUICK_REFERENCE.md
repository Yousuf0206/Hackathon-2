# Todo App - Quick Reference Card

## 🚀 Start Application
```bash
uv run python src/main.py
```

---

## 📋 Commands

### Add Task
```
> add
Enter title: [your title]
Enter description: [optional description]
```

### List Tasks
```
> list
```
**Output**: `[x] 1. Title — Description`
- `[x]` = complete, `[ ]` = incomplete

### Complete Task
```
> complete
Enter task ID: [number]
```

### Incomplete Task
```
> incomplete
Enter task ID: [number]
```

### Update Task
```
> update
Enter task ID: [number]
Enter new title: [new title]
Enter new description: [new description]
```

### Delete Task
```
> delete
Enter task ID: [number]
```
⚠️ **Permanent** - cannot be undone

### Help
```
> help
```

### Exit
```
> exit
```

---

## ✅ Validation Rules

| Field | Requirements |
|-------|--------------|
| **Title** | 1-100 chars, required |
| **Description** | 0-500 chars, optional |
| **Task ID** | Positive integer, must exist |
| **Commands** | Case-insensitive (add/ADD/Add) |

---

## 🎯 Quick Examples

```bash
# Add and complete
> add
Title: Buy milk
Description: 2 gallons
> complete
Task ID: 1

# List and update
> list
[ ] 1. Buy milk — 2 gallons
> update
Task ID: 1
New title: Buy milk and eggs
New description: 2 gallons milk, 1 dozen eggs

# Delete
> delete
Task ID: 1
```

---

## ⚠️ Key Features

- ✅ IDs **never reused** (even after delete)
- ✅ Tasks in **creation order**
- ✅ **No persistence** - data lost on exit
- ✅ Errors **don't crash** app - just retry
- ✅ **Whitespace auto-trimmed**

---

## 🐛 Common Errors

| Error | Fix |
|-------|-----|
| `Title cannot be empty` | Enter a non-empty title |
| `Title exceeds 100 characters` | Shorten your title |
| `Invalid task ID` | Use number from `list` command |
| `Task not found` | Check ID with `list` command |
| `Unknown command` | Type `help` for valid commands |

---

## 💡 Pro Tips

1. Use `list` to see all task IDs
2. Commands work in any case (add/ADD/Add)
3. Description is optional - press Enter to skip
4. Ctrl+C for emergency exit
5. Run `help` anytime for command list

---

**📖 Full docs**: See COMMANDS.md or README.md
