1. ✅ Syntax Difference
    - const fs = require('fs');
    -	import fs from 'fs';

- require is a function. and CommonJS (require)
- import is a keyword (part of ES6/ES2015 syntax).

2. ⚙️ How They Load Modules
    - require:
    1. Loads modules synchronously (one after the other).
    2. Runs as soon as it's read
    3. ✅ Yes! You can use require() anywhere.

    - import:
    1. Loads statically at the top before any code runs.
    2. Must be at the top level
    3. ❌ No (by default). It must be static (top-level only).
    - But you can use dynamic import() like:
    - if (condition) const module = await import('./math.js')

### 🔁 require – Synchronous (Blocking)
- When you use require(), the code waits for the module to load before moving to the next line.
This is blocking – it runs one line at a time.

### 📦 import – Asynchronous (Non-blocking / Static)
- When you use top-level import, it does not block line-by-line execution.
- Instead, all imports are resolved before the script starts running.
- “Preload all modules first, then run the script.”