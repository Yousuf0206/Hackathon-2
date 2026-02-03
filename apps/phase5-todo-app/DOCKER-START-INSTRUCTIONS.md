# 🐳 How to Start Docker Desktop

## The #1 Most Important Step

**Before you can run the application, Docker Desktop MUST be running.**

---

## Quick Method (Windows)

### Option 1: From Start Menu
1. Press the **Windows key** on your keyboard
2. Type: `Docker Desktop`
3. Click on **Docker Desktop** when it appears
4. Wait 30-60 seconds for Docker to fully initialize
5. Look for the Docker whale icon in your system tray (bottom-right corner)
6. The icon should stop animating and tooltip should say **"Docker Desktop is running"**

### Option 2: From Command Line
```bash
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

Then wait 30-60 seconds for it to start.

### Option 3: From Desktop Shortcut
- If you have a Docker Desktop shortcut on your desktop, double-click it
- Wait for it to fully start

---

## How to Verify Docker is Running

Run this command:
```bash
docker ps
```

**If Docker is running correctly:**
```
CONTAINER ID   IMAGE     COMMAND   CREATED   STATUS    PORTS     NAMES
```
(Empty list is fine - this means Docker is working)

**If Docker is NOT running:**
```
error during connect: Get "http://...": open //./pipe/dockerDesktopLinuxEngine:
The system cannot find the file specified.
```

---

## What Happens When Docker Starts

You'll see these indicators:

1. **System Tray Icon:**
   - Whale icon appears in bottom-right of taskbar
   - Icon animates (swims) while starting
   - Icon stops animating when ready
   - Hover over icon - should say "Docker Desktop is running"

2. **Docker Desktop Window:**
   - Main window may open automatically
   - Shows "Docker Desktop is starting..."
   - Then shows "Docker Desktop is running"
   - You can close this window - Docker stays running

3. **Command Line:**
   - `docker ps` command works without errors
   - `docker-compose --version` shows version number

---

## Troubleshooting Docker Desktop

### Docker Desktop Not Installed
**Error:** "Docker Desktop" not found in Start Menu

**Fix:** Install Docker Desktop:
1. Go to https://www.docker.com/products/docker-desktop/
2. Download Docker Desktop for Windows
3. Run the installer
4. Restart your computer
5. Start Docker Desktop

### Docker Desktop Won't Start
**Symptoms:** Icon appears then disappears, or shows error

**Common Fixes:**

1. **Restart Computer:**
   - Often fixes startup issues
   - Try starting Docker after reboot

2. **Check Windows Features:**
   - Press Windows key + R
   - Type: `optionalfeatures`
   - Enable: "Virtual Machine Platform"
   - Enable: "Windows Subsystem for Linux"
   - Restart computer

3. **Update Docker Desktop:**
   - Open Docker Desktop (if possible)
   - Click gear icon → Software Updates
   - Update if available

4. **Reinstall Docker Desktop:**
   - Uninstall from Windows Settings → Apps
   - Restart computer
   - Reinstall from docker.com

### Docker Desktop Stuck Starting
**Symptoms:** Icon keeps animating, never says "running"

**Fix:**
1. Close Docker Desktop completely
2. Open Task Manager (Ctrl+Shift+Esc)
3. End all Docker-related processes:
   - Docker Desktop.exe
   - com.docker.backend.exe
   - docker.exe
4. Restart Docker Desktop
5. Wait up to 2 minutes

---

## Once Docker is Running

After Docker Desktop shows "running", proceed with deployment:

### Automated Method (Recommended):
```bash
cd C:\Users\user\Desktop\Hackathon 2\apps\phase2
deploy.bat
```

### Manual Method:
```bash
cd C:\Users\user\Desktop\Hackathon 2\apps\phase2
preflight.bat
docker-compose up --build
```

---

## Docker Desktop Settings

For best performance, configure Docker Desktop:

1. Open Docker Desktop
2. Click gear icon (Settings)
3. **Resources → Advanced:**
   - CPUs: 4 (if you have 8+ cores)
   - Memory: 4 GB
   - Swap: 1 GB
4. **General:**
   - ✅ Start Docker Desktop when you log in (optional)
   - ✅ Use WSL 2 based engine
5. Click **Apply & Restart**

---

## Common Questions

**Q: Do I need to keep Docker Desktop window open?**
A: No, you can close the window. Docker continues running in the background.

**Q: How do I stop Docker?**
A: Right-click Docker icon in system tray → Quit Docker Desktop

**Q: Does Docker start automatically?**
A: Only if enabled in Settings → General → "Start Docker Desktop when you log in"

**Q: How much disk space does Docker use?**
A: Initial install: ~2 GB. With images: 5-10 GB. Check in Settings → Resources → Disk Usage

**Q: Can I run Docker and VirtualBox together?**
A: Usually yes, but may conflict. Try disabling Hyper-V or using WSL 2 backend.

---

## Next Steps

Once Docker is running:

1. ✅ Verify: `docker ps` works
2. ✅ Run: `deploy.bat`
3. ✅ Open: http://localhost:3002
4. ✅ Test the application!

---

## Need More Help?

- Docker Desktop Docs: https://docs.docker.com/desktop/
- Docker Forums: https://forums.docker.com/
- Check `START-HERE.md` for application deployment
- Check `DEPLOYMENT-FIXES.md` for technical details
