#include <napi.h>
#include <algorithm>
#include <cstddef>
#include <string>

namespace {

Napi::Value ScanStats(const Napi::CallbackInfo &info) {
  Napi::Env env = info.Env();
  if (info.Length() < 1 || !info[0].IsString()) {
    Napi::TypeError::New(env, "Expected a string").ThrowAsJavaScriptException();
    return env.Null();
  }

  const std::string code = info[0].As<Napi::String>().Utf8Value();
  const std::size_t byteLength = code.size();
  const std::size_t newlineCount =
      static_cast<std::size_t>(std::count(code.begin(), code.end(), '\n'));
  std::size_t lineCount = 0;
  if (!code.empty()) {
    lineCount = 1 + newlineCount;
  }

  Napi::Object result = Napi::Object::New(env);
  result.Set("byteLength", Napi::Number::New(env, static_cast<double>(byteLength)));
  result.Set("lineCount", Napi::Number::New(env, static_cast<double>(lineCount)));
  return result;
}

} // namespace

static Napi::Object Init(Napi::Env env, Napi::Object exports) {
  exports.Set("scanStats", Napi::Function::New(env, ScanStats, "scanStats"));
  return exports;
}

NODE_API_MODULE(cpp_engine, Init)
