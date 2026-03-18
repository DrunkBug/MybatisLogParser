import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "sql-formatter";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus, oneLight } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Copy,
  Database,
  Moon,
  Scissors,
  Sun,
  Terminal,
  Trash2,
  X
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert.tsx";
import { Button } from "./ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "./ui/card.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { cn } from "../lib/utils.ts";

type NotificationType = "success" | "error" | "";

interface HistoryItem {
  id: string;
  rawLog: string;
  parsedSQL: string;
  timestamp: number;
}

const HISTORY_KEY = "mybatis-log-parser-history";
const MAX_HISTORY = 50;

function loadHistory(): HistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items));
}

const THEME_KEY = "mybatis-log-parser-theme";

function getInitialTheme(): "light" | "dark" {
  try {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const MybatisLogParser = () => {
  const [sqlLog, setSqlLog] = useState("");
  const [parsedSQL, setParsedSQL] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  }>({ message: "", type: "" });
  const [isCopying, setIsCopying] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>(loadHistory);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  useEffect(() => {
    if (!notification.message) {
      return;
    }

    const timer = setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  const addToHistory = useCallback((rawLog: string, parsed: string) => {
    setHistory((prev) => {
      const item: HistoryItem = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        rawLog,
        parsedSQL: parsed,
        timestamp: Date.now()
      };
      const next = [item, ...prev].slice(0, MAX_HISTORY);
      saveHistory(next);
      return next;
    });
  }, []);

  const removeFromHistory = useCallback((id: string) => {
    setHistory((prev) => {
      const next = prev.filter((h) => h.id !== id);
      saveHistory(next);
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    saveHistory([]);
  }, []);

  const restoreFromHistory = useCallback((item: HistoryItem) => {
    setSqlLog(item.rawLog);
    setParsedSQL(item.parsedSQL);
  }, []);

  const showNotification = (message: string, type: Exclude<NotificationType, "">) => {
    setNotification({ message, type });
  };

  const parseSQL = (text: string) => {
    const statementStartIndex = text.indexOf("Preparing: ");
    if (statementStartIndex === -1) {
      showNotification('未找到有效的 SQL 日志格式（缺少 "Preparing:"）', "error");
      return "";
    }

    const statementEndIndex = text.indexOf("\n", statementStartIndex);
    const statementStr = text.substring(
      statementStartIndex + "Preparing: ".length,
      statementEndIndex === -1 ? text.length : statementEndIndex
    );

    const parametersStartIndex = text.indexOf("Parameters: ");
    if (parametersStartIndex === -1) {
      return statementStr;
    }

    const parametersEndIndex = text.indexOf("\n", parametersStartIndex);
    const parametersStr = text.substring(
      parametersStartIndex + "Parameters: ".length,
      parametersEndIndex === -1 ? text.length : parametersEndIndex
    );

    const parameters = parametersStr.split(",");
    let result = statementStr;

    parameters.forEach((param) => {
      const trimmedParam = param.trim();
      const typeStartIndex = trimmedParam.lastIndexOf("(");
      const typeEndIndex = trimmedParam.lastIndexOf(")");

      if (trimmedParam !== "null" && (typeStartIndex === -1 || typeEndIndex === -1)) {
        return;
      }

      const tempStr = trimmedParam.substring(0, typeStartIndex)?.trim();
      const typeStr = trimmedParam.substring(typeStartIndex + 1, typeEndIndex);

      if (typeStr === "String" || typeStr === "Timestamp" || typeStr === "Date") {
        result = result.replace("?", `'${tempStr}'`);
      } else if (trimmedParam === "null") {
        result = result.replace("?", "NULL");
      } else {
        result = result.replace("?", tempStr);
      }
    });

    return result;
  };

  const formatSQL = (sql: string) => {
    try {
      return format(sql, {
        language: "mysql",
        keywordCase: "upper"
      });
    } catch {
      return sql;
    }
  };

  const formattedSQL = useMemo(() => formatSQL(parsedSQL), [parsedSQL]);

  const handleParse = () => {
    if (!sqlLog.trim()) {
      setParsedSQL("");
      showNotification("请输入日志内容", "error");
      return;
    }

    const result = parseSQL(sqlLog);
    if (!result) {
      setParsedSQL("");
      return;
    }

    setParsedSQL(result);
    addToHistory(sqlLog, result);
    showNotification("SQL 解析成功", "success");
  };

  const handleCopy = async () => {
    try {
      if (!formattedSQL) {
        showNotification("没有可复制的 SQL", "error");
        return;
      }

      await navigator.clipboard.writeText(formattedSQL);
      showNotification("SQL 已复制到剪贴板", "success");
    } catch {
      showNotification("复制失败，请手动复制", "error");
    }
  };

  const handleClear = () => {
    setSqlLog("");
    setParsedSQL("");
    showNotification("已清空所有内容", "success");
  };

  const handleAutoPaste = async () => {
    setIsCopying(true);

    try {
      const clipboardText = await navigator.clipboard.readText();
      setSqlLog(clipboardText);

      const result = parseSQL(clipboardText);
      if (!result) {
        setParsedSQL("");
        return;
      }

      setParsedSQL(result);
      const formatted = formatSQL(result);
      await navigator.clipboard.writeText(formatted);
      addToHistory(clipboardText, result);
      showNotification("已自动解析并复制", "success");
    } catch {
      showNotification("无法读取剪贴板，请检查权限", "error");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* History Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-full flex-col border-r border-border/50 bg-card/80 shadow-sm backdrop-blur-xl dark:border-border/40 dark:bg-card/60 dark:shadow-[inset_-1px_0_0_0_rgba(255,255,255,0.06)] transition-[width] duration-300",
          sidebarOpen ? "w-72" : "w-0"
        )}
      >
        {sidebarOpen && (
          <>
            <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">历史记录</span>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                  {history.length}
                </span>
              </div>
              {history.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearHistory} className="h-7 px-2 text-xs text-muted-foreground hover:text-red-600 dark:hover:text-red-300">
                  清空
                </Button>
              )}
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 pt-12 text-muted-foreground">
                  <Clock className="h-8 w-8 opacity-30" />
                  <p className="text-xs">暂无历史记录</p>
                </div>
              ) : (
                <ul className="space-y-1.5">
                  {history.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => restoreFromHistory(item)}
                        className="group relative w-full rounded-md border border-transparent px-3 py-2.5 text-left transition-colors hover:border-border/70 hover:bg-secondary/50"
                      >
                        <p className="line-clamp-2 font-mono text-xs leading-5 text-foreground/80">
                          {item.parsedSQL}
                        </p>
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          {new Date(item.timestamp).toLocaleString()}
                        </p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => { e.stopPropagation(); removeFromHistory(item.id); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); removeFromHistory(item.id); } }}
                          className="absolute right-1.5 top-1.5 hidden rounded p-0.5 text-muted-foreground hover:text-red-600 dark:hover:text-red-300 group-hover:block"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </aside>

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen((v) => !v)}
        className={cn(
          "fixed top-1/2 z-50 flex h-10 w-5 -translate-y-1/2 items-center justify-center rounded-r-md border border-l-0 border-border/50 bg-card/80 text-muted-foreground shadow-sm backdrop-blur-xl dark:border-border/40 dark:bg-card/60 dark:shadow-none transition-[left,color] duration-300 hover:text-foreground",
          sidebarOpen ? "left-72" : "left-0"
        )}
      >
        {sidebarOpen ? <ChevronLeft className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
      </button>

      {/* Main Content */}
      <main
        className={cn(
          "min-h-screen flex-1 p-4 transition-[margin] duration-300 md:p-8",
          sidebarOpen ? "ml-72" : "ml-0"
        )}
      >
        <div className="mx-auto max-w-6xl space-y-6">
          <header className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
                MyBatis Log Parser
              </h1>
              <p className="text-sm text-muted-foreground md:text-base">
                粘贴 MyBatis 日志，一键解析参数并格式化 SQL。
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={toggleTheme} className="shrink-0">
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </header>

          <section className="flex flex-col gap-6 lg:flex-row">
            <Card
              className={cn(
                "flex h-[620px] min-w-0 flex-col border-border/50 bg-card/80 shadow-sm backdrop-blur-xl dark:border-border/40 dark:bg-card/60 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-[width,opacity] duration-500 ease-in-out w-full",
                formattedSQL ? "lg:w-[calc(35%-0.75rem)] lg:opacity-80" : "lg:w-[calc(50%-0.75rem)] lg:opacity-100"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex shrink-0 items-center gap-2">
                    <Terminal className="h-5 w-5 text-primary" />
                    <CardTitle>Input Log</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={handleParse} className={cn("items-center justify-center overflow-hidden transition-[width,padding,gap] duration-500", formattedSQL ? "w-9 gap-0 px-0" : "gap-2")}>
                      <Code2 className="h-4 w-4 shrink-0" />
                      <span className={cn("whitespace-nowrap transition-[opacity,max-width] duration-500", formattedSQL ? "max-w-0 opacity-0" : "max-w-[6rem] opacity-100")}>解析 SQL</span>
                    </Button>
                    <Button
                      onClick={handleAutoPaste}
                      disabled={isCopying}
                      variant="secondary"
                      className={cn("items-center justify-center overflow-hidden transition-[width,padding,gap] duration-500", formattedSQL ? "w-9 gap-0 px-0" : "gap-2")}
                    >
                      <Scissors className="h-4 w-4 shrink-0" />
                      <span className={cn("whitespace-nowrap transition-[opacity,max-width] duration-500", formattedSQL ? "max-w-0 opacity-0" : "max-w-[8rem] opacity-100")}>{isCopying ? "处理中..." : "自动粘贴解析"}</span>
                    </Button>
                    <Button onClick={handleClear} variant="outline" size="icon" className="shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col">
                <Textarea
                  value={sqlLog}
                  onChange={(e) => setSqlLog(e.target.value)}
                  placeholder="粘贴 MyBatis 日志，例如：Preparing: ...  Parameters: ..."
                  className="h-full resize-none bg-muted/50 font-mono text-sm leading-6 text-foreground"
                  spellCheck={false}
                />
              </CardContent>
            </Card>

            <Card
              className={cn(
                "flex h-[620px] min-w-0 flex-col border-border/50 bg-card/80 shadow-sm backdrop-blur-xl dark:border-border/40 dark:bg-card/60 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] transition-[width,box-shadow] duration-500 ease-in-out w-full",
                formattedSQL ? "lg:w-[calc(65%-0.75rem)] shadow-lg shadow-accent/10" : "lg:w-[calc(50%-0.75rem)]"
              )}
            >
              <CardHeader>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-accent" />
                    <CardTitle>Parsed SQL</CardTitle>
                  </div>
                  <Button
                    onClick={handleCopy}
                    variant="outline"
                    className="gap-2"
                    disabled={!formattedSQL}
                  >
                    <Copy className="h-4 w-4" />
                    复制 SQL
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="relative flex-1 min-h-0">
                <div className="h-full overflow-auto rounded-lg border border-input bg-muted/50">
                  {formattedSQL ? (
                    <SyntaxHighlighter
                      language="sql"
                      style={theme === "dark" ? vscDarkPlus : oneLight}
                      showLineNumbers
                      wrapLines
                      customStyle={{
                        margin: 0,
                        height: "100%",
                        background: "transparent",
                        fontSize: "14px",
                        lineHeight: "1.6"
                      }}
                    >
                      {formattedSQL}
                    </SyntaxHighlighter>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
                      <Code2 className="h-12 w-12 opacity-35" />
                      <p className="text-sm">解析结果会显示在这里</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {notification.message && (
          <div className="fixed bottom-6 left-1/2 z-50 w-[92vw] max-w-md -translate-x-1/2 animate-in slide-in-from-bottom-2 duration-300">
            <Alert
              className={cn(
                "border shadow-2xl backdrop-blur-md bg-card/80 dark:bg-transparent",
                notification.type === "success"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200"
                  : "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-200"
              )}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-300" />
              )}
              <AlertTitle>{notification.type === "success" ? "操作成功" : "操作失败"}</AlertTitle>
              <AlertDescription>{notification.message}</AlertDescription>
            </Alert>
          </div>
        )}
      </main>
    </div>
  );
};

export default MybatisLogParser;
