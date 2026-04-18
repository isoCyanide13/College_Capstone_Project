"use client";

import { Play, RotateCcw, Copy, Check } from "lucide-react";
import { useState } from "react";

export default function CodeEditor() {
  const [code, setCode] = useState(
    `class Solution {
  public boolean isMatch(String text, String pattern) {
    if (pattern.isEmpty()) return text.isEmpty();
    boolean firstMatch = (!text.isEmpty() && 
                         (pattern.charAt(0) == text.charAt(0) || pattern.charAt(0) == '.'));
    
    if (pattern.length() >= 2 && pattern.charAt(1) == '*') {
        return (isMatch(text, pattern.substring(2)) || 
               (firstMatch && isMatch(text.substring(1), pattern)));
    } else {
        return firstMatch && isMatch(text.substring(1), pattern.substring(1));
    }
  }
}`
  );

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-code-bg border-l border-border">
      {/* Editor Header — lighter chrome to match design system */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-surface-alt border-b border-border">
        <div className="flex items-center gap-3">
          <span className="font-headline text-sm font-medium text-ink">
            Solution.java
          </span>
          <span className="font-typewriter text-[10px] text-ink-faint uppercase tracking-wider">
            Java
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            id="copy-code-btn"
            onClick={handleCopy}
            className="p-1.5 rounded-sm snap-transition text-ink-muted hover:text-ink hover:bg-surface"
            title="Copy Code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
          <button
            id="reset-code-btn"
            className="p-1.5 rounded-sm snap-transition text-ink-muted hover:text-ink hover:bg-surface"
            title="Reset to default"
            onClick={() => setCode("class Solution {\n  \n}")}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Body (Dark — convention) */}
      <div className="flex-1 relative font-mono text-sm leading-relaxed overflow-hidden">
        {/* Line Numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-[#1e1e1e] border-r border-[#333] flex flex-col items-end py-4 pr-3 text-[#6e6e6e] select-none text-xs">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="leading-relaxed">
              {i + 1}
            </div>
          ))}
        </div>
        <textarea
          id="code-editor-textarea"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full bg-transparent text-[#d4d4d4] pl-16 py-4 pr-4 resize-none outline-none focus:ring-0 whitespace-pre font-mono"
        />
      </div>

      {/* Console Output */}
      <div className="h-44 border-t border-[#333] bg-[#1e1e1e] flex flex-col">
        <div className="flex items-center justify-between px-4 py-2 bg-surface-alt border-b border-border">
          <span className="font-headline text-xs text-ink-muted uppercase tracking-wider font-semibold">
            Console Output
          </span>
          <button
            id="run-code-btn"
            className="flex items-center gap-1.5 bg-ink text-surface-raised px-3 py-1 rounded-sm text-xs font-headline font-medium snap-transition hover:bg-accent-hover"
          >
            <Play className="w-3 h-3" fill="currentColor" /> Run Code
          </button>
        </div>
        <div className="flex-1 p-4 font-mono text-xs text-[#ccc] overflow-y-auto">
          <div className="text-[#6a9955] mb-1">▶ Output</div>
          <div>Test case 1 passed. Time: 2ms</div>
          <div>Test case 2 passed. Time: 1ms</div>
        </div>
      </div>
    </div>
  );
}
