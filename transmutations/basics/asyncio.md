# Python Concurrency: The Ultimate Paradigm Guide 🚀

Understanding how to juggle multiple tasks is the secret to high-performance Python. 

---

## 1. The Three Paradigms

| Feature | **AsyncIO** | **Threading** | **Multiprocessing** |
| :--- | :--- | :--- | :--- |
| **Core Concept** | Cooperative Multitasking | Context Switching | True Parallelism |
| **Units** | Coroutines / Tasks | OS Threads | OS Processes |
| **Memory** | Shared | Shared | Separate |
| **GIL Status** | Single-threaded (Subject to GIL) | Multi-threaded (Subject to GIL) | **Bypasses GIL** |
| **Overhead** | Ultra-Low | Medium | High |

---

## 2. Deep Dive: Pros, Cons & Scenarios

### ⚡ AsyncIO (The Network Specialist)
- **Pros:** Handles 10,000+ concurrent connections easily; very low memory footprint; no race conditions (usually).
- **Cons:** One "rude" function blocking the loop stalls everything; requires `async`/`await` ecosystem libraries.
- **Scenario:** High-concurrency web servers (FastAPI), Scrapers, WebSockets, Chat apps.

### 🧵 Threading (The Legacy I/O)
- **Pros:** Preemptive (OS handles switching); share memory easily; great for I/O that doesn't have `async` drivers.
- **Cons:** Limited by GIL (only one thread runs Python bytecode at a time); risk of Race Conditions and Deadlocks.
- **Scenario:** Simple scripts with blocking I/O (e.g., `requests`), Legacy GUI apps.

### 🚜 Multiprocessing (The CPU Beast)
- **Pros:** Uses all CPU cores; perfect for heavy math; crashed processes don't kill the main app.
- **Cons:** Memory intensive (copies everything); slow Communication between processes (IPC).
- **Scenario:** Image processing, Machine Learning inference, Video encoding, Data crunching.

---

## 3. Coroutines vs. Normal Functions

Calling a coroutine **is not** the same as executing it.

```python
def sync_fn():
    return "I am done!"

async def async_fn():
    await asyncio.sleep(1)
    return "I am done (eventually)!"

# 1. Normal Function
res = sync_fn()      # Runs immediately. res = "I am done!"

# 2. Coroutine
coro = async_fn()    # Returns a Coroutine Object. NOTHING happens yet.
res = await coro     # Schedule on the loop. Suspends current task until finished.
```

| Check | Normal Function (`def`) | Coroutine (`async def`) |
| :--- | :--- | :--- |
| **Invocation** | Returns the **result**. | Returns a **coroutine object**. |
| **Suspension** | Cannot be paused mid-way. | Can **yield control** back to the loop (`await`). |
| **Execution** | Runs to completion. | Handled by an **Event Loop**. |

---

## 4. Best Practices: Sync in Async 🧪

**Rule #1: Never Block the Loop.** If you call `time.sleep(5)` inside an `async` function, the entire application freezes for 5 seconds.

### When you MUST use a normal function:

#### A. For I/O Bound Tasks (e.g., `requests`, File System)
Use `asyncio.to_thread()` (Python 3.9+). It runs the sync function in a separate thread so the loop stays free.

```python
import asyncio
import requests

def blocking_get(url):
    return requests.get(url).status_code

async def main():
    # This runs the blocking code in a thread, but we 'await' its completion.
    status = await asyncio.to_thread(blocking_get, "https://google.com")
    print(f"Status: {status}")
```

#### B. For CPU Bound Tasks (e.g., Heavy Math)
Use `loop.run_in_executor()` with a `ProcessPoolExecutor`.

```python
from concurrent.futures import ProcessPoolExecutor
import asyncio

def compute_pi(digits):
    # Imagine some heavy math here...
    return 3.14159

async def main():
    loop = asyncio.get_running_loop()
    with ProcessPoolExecutor() as pool:
        # Offload to a different PROCESS to bypass the GIL
        result = await loop.run_in_executor(pool, compute_pi, 1000)
        print(f"Pi: {result}")
```

### Pro-Tips:
1. **Prefer `to_thread`**: It's cleaner for most common cases.
2. **Naming**: If a function/method is sync, don't use `async` in the name.
3. **Purity**: Try to use `async`-native libraries (like `httpx` instead of `requests`) whenever possible.
