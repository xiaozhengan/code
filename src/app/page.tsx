"use client";

import { useState, useCallback, useEffect } from "react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Copy,
  Check,
  Shield,
  ShieldAlert,
  ShieldCheck,
  ShieldPlus,
  Lock,
} from "lucide-react";

interface CharOptions {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}

type StrengthLevel = "weak" | "medium" | "strong" | "very-strong";

interface StrengthInfo {
  level: StrengthLevel;
  label: string;
  color: string;
  bgColor: string;
  percentage: number;
  icon: React.ElementType;
}

const CHAR_SETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
};

function generatePassword(length: number, options: CharOptions): string {
  let charset = "";
  const guaranteed: string[] = [];

  if (options.uppercase) {
    charset += CHAR_SETS.uppercase;
    guaranteed.push(
      CHAR_SETS.uppercase[Math.floor(Math.random() * CHAR_SETS.uppercase.length)]
    );
  }
  if (options.lowercase) {
    charset += CHAR_SETS.lowercase;
    guaranteed.push(
      CHAR_SETS.lowercase[Math.floor(Math.random() * CHAR_SETS.lowercase.length)]
    );
  }
  if (options.numbers) {
    charset += CHAR_SETS.numbers;
    guaranteed.push(
      CHAR_SETS.numbers[Math.floor(Math.random() * CHAR_SETS.numbers.length)]
    );
  }
  if (options.symbols) {
    charset += CHAR_SETS.symbols;
    guaranteed.push(
      CHAR_SETS.symbols[Math.floor(Math.random() * CHAR_SETS.symbols.length)]
    );
  }

  if (charset === "") return "";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  const password: string[] = guaranteed.slice(0, length);
  for (let i = password.length; i < length; i++) {
    password.push(charset[array[i] % charset.length]);
  }

  // Shuffle using Fisher-Yates
  for (let i = password.length - 1; i > 0; i--) {
    const j = array[i] % (i + 1);
    [password[i], password[j]] = [password[j], password[i]];
  }

  return password.join("");
}

function evaluateStrength(
  length: number,
  options: CharOptions
): StrengthInfo {
  const activeTypes = Object.values(options).filter(Boolean).length;
  let score = 0;

  // Length scoring
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;
  if (length >= 24) score += 1;

  // Type diversity scoring
  score += activeTypes;

  // Bonus for symbols
  if (options.symbols && length >= 12) score += 1;

  if (score <= 2) {
    return {
      level: "weak",
      label: "弱",
      color: "#ef4444",
      bgColor: "rgba(239, 68, 68, 0.15)",
      percentage: 25,
      icon: ShieldAlert,
    };
  } else if (score <= 4) {
    return {
      level: "medium",
      label: "中",
      color: "#f59e0b",
      bgColor: "rgba(245, 158, 11, 0.15)",
      percentage: 50,
      icon: Shield,
    };
  } else if (score <= 6) {
    return {
      level: "strong",
      label: "强",
      color: "#10b981",
      bgColor: "rgba(16, 185, 129, 0.15)",
      percentage: 75,
      icon: ShieldCheck,
    };
  } else {
    return {
      level: "very-strong",
      label: "极强",
      color: "#06b6d4",
      bgColor: "rgba(6, 182, 212, 0.15)",
      percentage: 100,
      icon: ShieldPlus,
    };
  }
}

export default function PasswordGenerator() {
  const [length, setLength] = useState<number>(16);
  const [options, setOptions] = useState<CharOptions>({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
  });
  const [password, setPassword] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const strength = evaluateStrength(length, options);

  const handleGenerate = useCallback(() => {
    const hasAnyOption = Object.values(options).some(Boolean);
    if (!hasAnyOption) return;

    setIsGenerating(true);
    const newPassword = generatePassword(length, options);
    setPassword(newPassword);
    setCopied(false);

    setTimeout(() => setIsGenerating(false), 300);
  }, [length, options]);

  // Generate on mount and when options change
  useEffect(() => {
    handleGenerate();
  }, [handleGenerate]);

  const handleCopy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = password;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const toggleOption = (key: keyof CharOptions) => {
    const activeCount = Object.values(options).filter(Boolean).length;
    // Prevent unchecking the last option
    if (options[key] && activeCount <= 1) return;
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const StrengthIcon = strength.icon;

  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 mb-4">
            <Lock className="w-7 h-7 text-emerald-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] tracking-tight">
            安全密码生成器
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-2">
            生成高强度随机密码，保护您的账户安全
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-2xl p-5 sm:p-6 shadow-2xl shadow-black/20">
          {/* Password Display */}
          <div className="relative mb-6">
            <div
              className="bg-[var(--background)] border border-[var(--border)] rounded-xl p-4 flex items-center gap-3 group"
              style={{
                borderColor:
                  isGenerating ? strength.color : "var(--border)",
                transition: "border-color 0.3s ease",
              }}
            >
              <div
                className="flex-1 font-mono text-lg sm:text-xl font-semibold tracking-wider break-all leading-relaxed"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: strength.color,
                  transition: "color 0.3s ease",
                }}
              >
                {password || "选择字符类型..."}
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
                title="复制密码"
                aria-label="复制密码"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors" />
                )}
              </button>
            </div>
            {/* Copy success toast */}
            {copied && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-3 py-1 bg-emerald-500/90 text-white text-xs rounded-full animate-in fade-in slide-in-from-top-1 duration-200">
                已复制到剪贴板
              </div>
            )}
          </div>

          {/* Strength Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--muted-foreground)]">
                密码强度
              </span>
              <div className="flex items-center gap-1.5">
                <StrengthIcon
                  className="w-3.5 h-3.5"
                  style={{ color: strength.color }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: strength.color }}
                >
                  {strength.label}
                </span>
              </div>
            </div>
            <div className="h-2 bg-[var(--muted)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${strength.percentage}%`,
                  backgroundColor: strength.color,
                  boxShadow: `0 0 8px ${strength.bgColor}`,
                }}
              />
            </div>
          </div>

          {/* Length Control */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-[var(--foreground)]">
                密码长度
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={4}
                  max={128}
                  value={length}
                  onChange={(e) => {
                    const val = Math.min(
                      128,
                      Math.max(4, parseInt(e.target.value) || 4)
                    );
                    setLength(val);
                  }}
                  className="w-16 h-8 bg-[var(--background)] border border-[var(--border)] rounded-lg text-center text-sm font-mono text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-[var(--muted-foreground)] w-4">
                4
              </span>
              <Slider
                min={4}
                max={128}
                step={1}
                value={[length]}
                onValueChange={(val: number[]) => setLength(val[0])}
                className="flex-1"
              />
              <span className="text-xs text-[var(--muted-foreground)] w-6">
                128
              </span>
            </div>
          </div>

          {/* Character Type Options */}
          <div className="mb-6">
            <label className="text-sm font-medium text-[var(--foreground)] block mb-3">
              字符类型
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { key: "uppercase" as const, label: "大写字母", desc: "A-Z" },
                  { key: "lowercase" as const, label: "小写字母", desc: "a-z" },
                  { key: "numbers" as const, label: "数字", desc: "0-9" },
                  {
                    key: "symbols" as const,
                    label: "特殊符号",
                    desc: "!@#$%",
                  },
                ] as const
              ).map((item) => (
                <label
                  key={item.key}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    options[item.key]
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted-foreground)]/30"
                  }`}
                >
                  <Checkbox
                    checked={options[item.key]}
                    onCheckedChange={() => toggleOption(item.key)}
                    className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <div className="flex flex-col">
                    <span className="text-sm text-[var(--foreground)]">
                      {item.label}
                    </span>
                    <span className="text-xs text-[var(--muted-foreground)] font-mono">
                      {item.desc}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98]"
          >
            <RefreshCw
              className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`}
            />
            生成密码
          </Button>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
          密码在本地生成，不会传输到任何服务器
        </p>
      </div>
    </div>
  );
}
