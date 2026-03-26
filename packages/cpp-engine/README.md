# C++ engine (Module K)

Native **N-API** addon for high-performance analysis. Default build uses **node-gyp** + `binding.gyp` (CMake + **cmake-js** is optional if you have CMake installed).

## Prerequisites

- **Node.js** (same major as the VS Code extension host when you load this from the extension)
- **Python 3** (node-gyp)
- A C++ toolchain: **g++/clang**, **make**

Optional, only for `npm run build:cmake`:

- **CMake** 3.15+ ([cmake.org](https://cmake.org/download/))

## Build (opt-in)

Root `npm run build` does **not** compile this package (no compiler required for the rest of the monorepo).

From the repository root:

```bash
npm run build -w @bughunter/cpp-engine
```

This runs `node-gyp rebuild` and writes the addon under `build/Release/cpp_engine.node` (the `build/` tree is gitignored).

With CMake installed, you can alternatively run:

```bash
npm run build:cmake -w @bughunter/cpp-engine
```

That uses [CMakeLists.txt](./CMakeLists.txt) and cmake-js; output layout follows cmake-js defaults (still under `build/`).

## API

- `scanStats(code: string)` → `{ byteLength, lineCount }` — lightweight native stub used to validate the N-API bridge; deeper AST/complexity work will extend this module.

## Layout

| File              | Role                                     |
| ----------------- | ---------------------------------------- |
| `binding.gyp`     | Primary build (node-gyp)                 |
| `CMakeLists.txt`  | Optional cmake-js build                  |
| `src/binding.cpp` | N-API exports (`node-addon-api`)         |
| `index.mjs`       | ESM loader (`bindings` resolves `.node`) |
