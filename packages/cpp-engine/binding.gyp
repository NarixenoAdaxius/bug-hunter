{
  "targets": [
    {
      "target_name": "cpp_engine",
      "dependencies": [
        "<!(node -p \"require('path').join(require('path').dirname(require.resolve('node-addon-api')), 'node_addon_api.gyp')\"):node_addon_api"
      ],
      "sources": ["src/binding.cpp"],
      "include_dirs": ["<!@(node -p \"require('node-addon-api').include\")"],
      "cflags!": ["-fno-exceptions"],
      "cflags_cc!": ["-fno-exceptions"]
    }
  ]
}
