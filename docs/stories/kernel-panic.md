# Segmentation Fault (Kernel Panic)

## Summary

It’s 2:00 AM on a Sunday. You’re on-call when a Telegram alert violently wakes you up: the main production database server is hitting 100% CPU spikes. You connect through SSH. The console greets you with an unusual message: `[!] CRITICAL: /dev/sda1 wipe initiated. 45 cycles remaining.`

An extremely sophisticated rootkit has injected a wipe script. The attacker obfuscated the executable by hiding it, binding it to ghost processes, and using fake symbolic links. You have **45 turns (commands)** before the `dd` command overwrites the disks with zeros.

**Available commands:** `ls`, `ls -a`, `ls -l`, `cd`, `cat`, `ps`, `kill`, `rm`
**Victory condition:** Stop the in-memory process and delete the hidden executable in ≤ 45 turns.

**Defeat condition:** Run out of turns or delete the executable *without* killing the process first (which causes the rootkit to instantly clone itself).

---

## The Happy Path

The player must act with pure sysadmin logic. If they start deleting things blindly, they lose. It requires analyzing processes, following symbolic links, and finding hidden files (those starting with `.`).

| Step | Command                         | Result                                                                                                        |
| ---- | ------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 1    | `ps`                            | Lists processes. One stands out: `PID 8842: /var/run/kworker_sys`.                                            |
| 2    | `cd /var/run`                   | Current directory: `/var/run#`.                                                                               |
| 3    | `ls`                            | Shows normal files. No sign of `kworker_sys`.                                                                 |
| 4    | `ls -l`                         | Shows permissions and symlinks. Reveals: `kworker_sys -> /etc/cron.d/.update_daemon`.                         |
| 5    | `cd /etc/cron.d`                | Current directory: `/etc/cron.d#`.                                                                            |
| 6    | `ls`                            | The directory appears empty.                                                                                  |
| 7    | `ls -a`                         | Reveals hidden files: `.`, `..`, and `.update_daemon`.                                                        |
| 8    | `cat .update_daemon`            | Displays the script: `Executing binary at /usr/lib/.sys/payload.sh. If the file is deleted, restart process.` |
| 9    | `kill 8842`                     | `[+] SIGKILL signal sent. Process 8842 terminated.` (Vital to do this before deleting anything).              |
| 10   | `cd /usr/lib`                   | Current directory: `/usr/lib#`.                                                                               |
| 11   | `ls -a`                         | Reveals the hidden directory `.sys`.                                                                          |
| 12   | `cd .sys`                       | Current directory: `/usr/lib/.sys#`.                                                                          |
| 13   | `rm payload.sh`                 | FILE DELETED.                                                                                                 |
| 14   | `rm /etc/cron.d/.update_daemon` | YOU STOPPED THE PURGE → System Secured.                                                                       |

**Ending:**
The cascade of errors on the screen suddenly stops. The cursor calmly blinks green again: `root@prod-db-01:~#`. You throw your headset onto the desk and rub your face with trembling hands. You just prevented the loss of petabytes of customer data. On Monday you’ll ask for a raise. If they deny it, you quit.

---

## The Terror Path

The player panics and makes fatal mistakes, the worst being trying to delete the file or symbolic link without killing the in-memory resident process first (`PID`).

| Phase              | What happens                                                                                                                                                                                                               |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Premature deletion | If the player runs `rm .update_daemon` before `kill 8842`, the engine returns: `[ERROR] Permission denied. File is in use by an active process.` And 5 turns are instantly deducted as a penalty for alerting the rootkit. |
| Time limit         | As you approach turn 45, the engine interrupts `ls` commands with asynchronous status messages: `kernel: dd[8842]: writing to '/dev/sda'... 74% complete`.                                                                 |
| Turn > 45          | The wipe command finishes its work.                                                                                                                                                                                        |

**Ending:**
The system stops responding to your keyboard commands. You type `ls`, but nothing happens. The SSH connection abruptly dies: `Connection closed by remote host`. You try to ping the server. Nothing. You open the AWS recovery console and see that the 4TB hard drive now reports 0 bytes used. A Slack message appears: *"Hey, the website is down and the mobile app is returning 500 errors, can you check it?"* Your career is over. **GAME OVER.**

---

## The Lost Path (The Rabbit Hole)

Instead of an infinite forest loop, the player becomes trapped inside Linux’s virtual filesystem (`/proc` or recursive symbolic links), a maze designed by the hacker to waste time.

| Behavior           | Detail                                                                                                                                                                                                                 |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recursive symlinks | If the player `cd`s into a fake symlink left by the hacker (example: `/var/log/sys_error_link`), it points to another folder, which points to another, creating a useless maze (`/var/log/dump/old/dump/old/...`).     |
| `cat` distraction  | Reading gigantic log files (`cat syslog`). The text scrolls upward at insane speed, filling the screen with hexadecimal garbage (perfect for your `useTypewriter` hook), wasting a turn and hiding useful information. |
| Decoy files        | Finding an obvious executable like `/tmp/virus.sh`. Attempting to delete it returns: `Permission denied. Immutable file (chattr +i)`. It’s a dead end designed to cause frustration.                                   |

**Console outputs during panic (For the engine):**

1. `ls -l` → `lrwxrwxrwx 1 root root 11 Nov 12 02:14 backup -> /dev/null` (Your backups have been redirected into nothingness!).
2. Mistyping a command (example: `kkill 8842`) → `bash: kkill: command not found. (1 cycle wasted)`.
3. `cat /proc/cpuinfo` → `Core temperature exceeds 90°C. The fan screams through the walls of the datacenter.`

---

## Architecture Expansion (Parser and Handlers)

To let your engine process this level of interactivity, the responsibility chain in `handlers.ts` and `parser.ts` needs to scale.

### 1. Parser Tokenization

The player will input commands like `ls -a /etc` or `kill 8842`. The parser should return a structured object:

```typescript
interface ParsedCommand {
  verb: string;        // 'ls', 'rm', 'kill'
  flags: string[];     // ['-a', '-l']
  target: string;      // '/etc' or '8842'
}
```

### 2. Virtual File System (VFS)

Instead of simple “location” nodes, this story’s `GameState` needs a small simulated JSON tree:

```typescript
const fileSystem = {
  "/var/run": {
    files: {
      "kworker_sys": {
        type: "symlink",
        target: "/etc/cron.d/.update_daemon",
        hidden: false
      }
    }
  },
  "/etc/cron.d": {
    files: {
      ".update_daemon": {
        type: "file",
        content: "...",
        hidden: true
      }
    }
  }
};
```

### 3. Command-Specific Handlers

You’ll want an `lsHandler` that checks `flags.includes('-a')` to decide whether hidden files (`hidden: true`) should appear in the current directory listing.

And a `killHandler` that modifies a boolean variable like `isProcessAlive` inside the `GameState`.
