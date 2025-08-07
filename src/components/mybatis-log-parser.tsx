import React, { useState } from 'react';
import { Card, Button, Input } from 'antd';
import { format } from 'sql-formatter';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { CodeOutlined, DeleteOutlined, CopyOutlined, ScissorOutlined } from '@ant-design/icons';
const { TextArea } = Input;

const MybatisLogParser = () => {
  const [sqlLog, setSqlLog] = useState('');
  const [parsedSQL, setParsedSQL] = useState('');
  const [copyMessage, setCopyMessage] = useState('');
  const [isCopying, setIsCopying] = useState(false);

  const parseSQL = (text) => {
    // Get SQL statement with question marks
    const statementStartIndex = text.indexOf('Preparing: ');
    if (statementStartIndex === -1) {
      setCopyMessage('未找到有效的SQL日志格式！');
      setTimeout(() => setCopyMessage(''), 3000);
      return '';
    }

    const statementEndIndex = text.indexOf('\n', statementStartIndex);
    const statementStr = text.substring(
      statementStartIndex + 'Preparing: '.length,
      statementEndIndex === -1 ? text.length : statementEndIndex
    );

    // Get parameters
    const parametersStartIndex = text.indexOf('Parameters: ');
    if (parametersStartIndex === -1) return statementStr;

    const parametersEndIndex = text.indexOf('\n', parametersStartIndex);
    const parametersStr = text.substring(
      parametersStartIndex + 'Parameters: '.length,
      parametersEndIndex === -1 ? text.length : parametersEndIndex
    );

    const parameters = parametersStr.split(',');

    // Replace parameters in SQL
    let result = statementStr;
    parameters.forEach(param => {
      const trimmedParam = param.trim();
      const typeStartIndex = trimmedParam.lastIndexOf('(');
      const typeEndIndex = trimmedParam.lastIndexOf(')');

      if (trimmedParam !== 'null' && (typeStartIndex === -1 || typeEndIndex === -1)) return;

      const tempStr = trimmedParam.substring(0, typeStartIndex)?.trim();
      const typeStr = trimmedParam.substring(typeStartIndex + 1, typeEndIndex);

      if (typeStr === 'String' || typeStr === 'Timestamp' || typeStr === 'Date') {
        result = result.replace('?', `'${tempStr}'`);
      } else if (trimmedParam === 'null') {
        result = result.replace('?', null);
      } else {
        result = result.replace('?', tempStr);
      }
    });

    return result;
  };

  const formatSQL = (sql) => {
    try {
      return format(sql, {
        language: 'mysql'
      });
    } catch (error) {
      return sql; // 如果格式化失败，返回原始SQL
    }
  };

  const handleParse = () => {
    const result = parseSQL(sqlLog);
    setParsedSQL(result);
  };

  // 格式化 SQL
  const formattedSQL = formatSQL(parsedSQL);

  const handleCopy = async () => {
    try {
      if (formattedSQL) {
        await navigator.clipboard.writeText(formattedSQL);
        setCopyMessage('SQL已复制到剪贴板！');
        setTimeout(() => setCopyMessage(''), 3000);
      } else {
        setCopyMessage('没有可复制的SQL！');
        setTimeout(() => setCopyMessage(''), 3000);
      }
    } catch (err) {
      setCopyMessage('复制失败，请手动复制');
      setTimeout(() => setCopyMessage(''), 3000);
    }
  };

  const handleClear = () => {
    setSqlLog('');
    setParsedSQL('');
    setCopyMessage('');
  };

  const handleAutoPaste = async () => {
    setIsCopying(true);
    try {
      // 1. 读取剪贴板内容
      const clipboardText = await navigator.clipboard.readText();

      // 2. 设置到输入框
      setSqlLog(clipboardText);

      // 3. 解析SQL
      const result = parseSQL(clipboardText);
      setParsedSQL(result);

      // 4. 如果解析成功，格式化SQL并复制回剪贴板
      if (result) {
        const formatted = formatSQL(result);
        await navigator.clipboard.writeText(formatted);
        setCopyMessage('已自动解析并复制格式化SQL到剪贴板！');
      } else {
        setCopyMessage('解析失败，请检查日志格式！');
      }

      setTimeout(() => setCopyMessage(''), 3000);
    } catch (err) {
      setCopyMessage('自动粘贴失败，请检查浏览器权限！');
      setTimeout(() => setCopyMessage(''), 3000);
    } finally {
      setIsCopying(false);
    }
  };

  const elementStyle = {
    display: 'flex',
    border: '0px deepskyblue solid',
    width: '100%',
    height: '50px',
    justifyContent: 'flex-end',
    alignItems: 'center'
  };

  const divStyle = {
    color: 'rgba(56, 142, 30, 1)',
    fontSize: '1em',
    fontWeight: 'bold'
  };

  const autoPasteButtonStyle = {
    backgroundColor: '#1890ff',
    color: 'white',
    fontWeight: 'bold',
    marginRight: '8px'
  };

  return (
    <div className="h-screen p-4 bg-gray-50">
      <Card className="h-full flex">
        {/* Input Section */}
        <div className="flex-1 p-4" style={divStyle}>
          <label style={divStyle} className="block text-green-600 text-lg font-medium mb-2">输入MyBatis SQL日志：</label>
          <TextArea
            value={sqlLog}
            onChange={(e) => setSqlLog(e.target.value)}
            rows={6}
            placeholder="请粘贴MyBatis日志..."
            className="w-full mt-2"
          />
          <div style={elementStyle} className="flex justify-end mt-4" >
            <Button
              type="primary"
              icon={<ScissorOutlined />}
              onClick={handleAutoPaste}
              loading={isCopying}
              style={autoPasteButtonStyle}
            >
              一键粘贴解析复制
            </Button>
            <Button
              icon={<DeleteOutlined />}
              onClick={handleClear}
              style={{ marginRight: '10px' }}
            >
              清空
            </Button>
            <Button
              type="primary"
              icon={<CodeOutlined />}
              onClick={handleParse}
            >
              解析SQL
            </Button>
          </div>
        </div>

        {/* Output Section with SQL Syntax Highlighting */}
        <div className="flex-1 p-4">
          <label style={divStyle} className="block text-green-600 text-lg font-medium mb-2">解析结果：</label>
          <div className="w-full mt-2 border rounded" style={{ height: '450px', overflow: 'auto' }}>
            {formattedSQL ? (
              <SyntaxHighlighter
                language="sql"
                style={prism}
                showLineNumbers={true}
                wrapLines={true}
                customStyle={{
                  margin: 0,
                  borderRadius: '6px',
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}
              >
                {formattedSQL}
              </SyntaxHighlighter>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 bg-gray-50 rounded">
                解析后的SQL将显示在这里...
              </div>
            )}
          </div>
          <div style={elementStyle} className="flex justify-end mt-4">
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
            >
              复制SQL
            </Button>
          </div>
          {copyMessage && (
            <div className="text-sm text-blue-500 text-right mt-2">
              {copyMessage}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MybatisLogParser;