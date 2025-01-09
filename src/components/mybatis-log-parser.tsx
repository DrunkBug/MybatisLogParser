import React, { useState } from 'react';
import { Card } from 'antd';
import { Button } from "antd";
import { Input } from 'antd';
import { CodeOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
const { TextArea } = Input;

const MybatisLogParser = () => {
  const [sqlLog, setSqlLog] = useState('');
  const [parsedSQL, setParsedSQL] = useState('');
  const [copyMessage, setCopyMessage] = useState('');

  const parseSQL = (text) => {
    // Get SQL statement with question marks
    const statementStartIndex = text.indexOf('Preparing: ');
    if (statementStartIndex === -1) return '';

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
      const tempStr = param.substring(0, param.indexOf('('))?.trim();
      const typeStr = param.substring(
        param.indexOf('(') + 1,
        param.indexOf(')')
      );

      if (typeStr === 'String' || typeStr === 'Timestamp') {
        result = result.replace('?', `'${tempStr}'`);
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
      await navigator.clipboard.writeText(parsedSQL);
      setCopyMessage('SQL已复制到剪贴板！');
      setTimeout(() => setCopyMessage(''), 3000);
    } catch (err) {
      setCopyMessage('复制失败，请手动复制');
    }
  };

  const handleClear = () => {
    setSqlLog('');
    setParsedSQL('');
    setCopyMessage('');
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
  fontWeight:'bold'
};
  return (
    <div className="h-screen p-4 bg-gray-50">
    <Card className="h-full flex">
      {/* Input Section */}
      <div className="flex-1 p-4"  style={divStyle}>
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
            icon={<DeleteOutlined />}
            onClick={handleClear}
            className="mr-2"
          >
            清空
          </Button>
          <div  style={elementStyle} />
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
        <label  style={divStyle} className="block text-green-600 text-lg font-medium mb-2">解析结果：</label>
        <TextArea
          value={parsedSQL}
          readOnly
          rows={12}
          placeholder="解析后的SQL将显示在这里..."
          className="w-full mt-2"
        />
        <div  style={elementStyle}  className="flex justify-end mt-4">
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