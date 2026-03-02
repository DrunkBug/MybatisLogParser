import React, { useEffect, useMemo, useState } from "react";
import { format } from "sql-formatter";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Copy,
  Database,
  Scissors,
  Terminal,
  Trash2
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "./ui/alert.tsx";
import { Button } from "./ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card.tsx";
import { Textarea } from "./ui/textarea.tsx";
import { cn } from "../lib/utils.ts";

type NotificationType = "success" | "error" | "";

const MybatisLogParser = () => {
  const [sqlLog, setSqlLog] = useState("");
  const [parsedSQL, setParsedSQL] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    type: NotificationType;
  }>({ message: "", type: "" });
  const [isCopying, setIsCopying] = useState(false);

  useEffect(() => {
    if (!notification.message) {
      return;
    }

    const timer = setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

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
      showNotification("已自动解析并复制", "success");
    } catch {
      showNotification("无法读取剪贴板，请检查权限", "error");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">
            MyBatis Log Parser
          </h1>
          <p className="text-sm text-slate-300 md:text-base">
            粘贴 MyBatis 日志，一键解析参数并格式化 SQL。
          </p>
        </header>

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="flex h-[620px] flex-col border-border/70 bg-card/85 backdrop-blur-sm">
            <CardHeader className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-primary" />
                  <CardTitle>Input Log</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleAutoPaste}
                    disabled={isCopying}
                    variant="secondary"
                    className="gap-2"
                  >
                    <Scissors className="h-4 w-4" />
                    {isCopying ? "处理中..." : "自动粘贴解析"}
                  </Button>
                  <Button onClick={handleClear} variant="outline" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardDescription>支持包含 Preparing 与 Parameters 的日志片段。</CardDescription>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-4">
              <Textarea
                value={sqlLog}
                onChange={(e) => setSqlLog(e.target.value)}
                placeholder="粘贴 MyBatis 日志，例如：Preparing: ...  Parameters: ..."
                className="h-full resize-none bg-slate-950/55 font-mono text-sm leading-6 text-slate-100"
                spellCheck={false}
              />

              <Button onClick={handleParse} className="h-11 gap-2 text-sm font-semibold">
                <Code2 className="h-4 w-4" />
                解析 SQL
              </Button>
            </CardContent>
          </Card>

          <Card className="flex h-[620px] flex-col border-border/70 bg-card/85 backdrop-blur-sm">
            <CardHeader className="space-y-4">
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
              <CardDescription>自动格式化关键字，便于排查和执行。</CardDescription>
            </CardHeader>

            <CardContent className="relative flex-1">
              <div className="h-full overflow-hidden rounded-lg border border-input bg-slate-950/70">
                {formattedSQL ? (
                  <SyntaxHighlighter
                    language="sql"
                    style={vscDarkPlus}
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
              "border shadow-2xl backdrop-blur-md",
              notification.type === "success"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                : "border-red-500/40 bg-red-500/10 text-red-200"
            )}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-300" />
            )}
            <AlertTitle>{notification.type === "success" ? "操作成功" : "操作失败"}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        </div>
      )}
    </main>
  );
};

export default MybatisLogParser;
