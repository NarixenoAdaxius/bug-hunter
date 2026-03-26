# `@bughunter/cpp-engine`

Optional **N-API** native addon for higher-performance or deeper analysis paths. **Not** part of the default `npm run build` at the repo root — opt in when you need a compiled module.

## Prerequisites

- **Node.js** (match the major version used by the extension host when you load this from the extension).
- **Python 3** (for node-gyp).
- A C++ toolchain: **g++** / **clang**, **make**.

Optional, only for `npm run build:cmake`:

- **CMake** 3.15+ — [cmake.org](https://cmake.org/download/)

## Build (opt-in)

Root `npm run build` does **not** compile this package (no compiler required for the rest of the monorepo).

From the repository root:

```bash
npm run build -w @bughunter/cpp-engine
```

This runs `node-gyp rebuild` and writes the addon under `build/Release/` (the `build/` tree is gitignored).

With CMake installed, you can alternatively run:

```bash
npm run build:cmake -w @bughunter/cpp-engine
```

That uses [CMakeLists.txt](./CMakeLists.txt) and cmake-js; output follows cmake-js defaults (still under `build/`).

## API

- **`scanStats(code: string)`** → `{ byteLength, lineCount }` — lightweight native stub to validate the N-API bridge; future work can extend this with deeper analysis.

## Layout

| File              | Role                                     |
| ----------------- | ---------------------------------------- |
| `binding.gyp`     | Primary build (node-gyp)                 |
| `CMakeLists.txt`  | Optional cmake-js build                  |
| `src/binding.cpp` | N-API exports (`node-addon-api`)         |
| `index.mjs`       | ESM loader (`bindings` resolves `.node`) |

## See also

- [Analyzers](../analyzers/README.md) — primary JS/TS analysis pipeline today.
- [Root README](../../README.md) — monorepo overview.
