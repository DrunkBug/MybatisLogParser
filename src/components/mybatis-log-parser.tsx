import React, { useState, useEffect } from 'react';
import { Card } from 'antd';
import { Button } from "antd";
import { Input } from 'antd';
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

  const handleParse = () => {
    const result = parseSQL(sqlLog);
    setParsedSQL(result);
  };

  const handleCopy = async () => {
    try {
      if (parsedSQL) {
        await navigator.clipboard.writeText(parsedSQL);
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

      // 4. 如果解析成功，自动复制回剪贴板
      if (result) {
        await navigator.clipboard.writeText(result);
        setCopyMessage('已自动解析并复制SQL到剪贴板！');
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
    width: '100%', // Considered responsiveness
    height: '50px',
    justifyContent: 'flex-end', // Right aligns the content
    alignItems: 'center' // Vertically centers the content
  };

  const divStyle = {
    color: 'rgb(50, 205, 50)',    // 设置字体颜色
    fontSize: '1.5em',  // 设置字体大小
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
          <label style={divStyle} className="block text-gray-700 text-lg font-medium mb-2">输入MyBatis SQL日志：</label>
          <TextArea
            value={sqlLog}
            onChange={(e) => setSqlLog(e.target.value)}
            rows={12}
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
              className="mr-2"
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

        {/* Output Section */}
        <div className="flex-1 p-4">
          <label style={divStyle} className="block text-green-600 text-lg font-medium mb-2">解析结果：</label>
          <TextArea
            value={parsedSQL}
            readOnly
            rows={12}
            placeholder="解析后的SQL将显示在这里..."
            className="w-full mt-2"
          />
          <div style={elementStyle} className="flex justify-end mt-4">
            <Button
              icon={<CopyOutlined />}
              onClick={handleCopy}
            >
              复制SQL
            </Button>
          </div>
          {copyMessage && (
            <div className="text-sm text-blue-500 text-right mt-2 animate-fade-out">
              {copyMessage}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default MybatisLogParser;