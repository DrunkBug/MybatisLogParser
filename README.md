# MyBatis Log Parser

A React-based web application for parsing and formatting MyBatis SQL logs. This tool extracts SQL statements and their parameters from MyBatis log output and converts them into executable, formatted SQL queries.

## Features

- Parse MyBatis log format to extract SQL statements with parameter placeholders
- Replace parameter placeholders with actual values based on parameter types
- Format SQL output for better readability using sql-formatter
- Syntax highlighting for SQL code with react-syntax-highlighter
- One-click functionality to automatically paste, parse, and copy formatted SQL
- Manual parsing and clearing capabilities
- Responsive UI with Ant Design components

## Technology Stack

- **Frontend Framework**: React (v19.0.0)
- **UI Components**: Ant Design (v5.23.0) and Ant Design Icons (v5.5.2)
- **Styling**: Tailwind CSS (v3.4.17) with PostCSS (v8.4.49) and Autoprefixer (v10.4.20)
- **SQL Processing**: sql-formatter (v15.6.5) for SQL formatting
- **Code Display**: react-syntax-highlighter (v15.6.1) for SQL syntax highlighting
- **Build Tools**: react-scripts (v5.0.1), react-app-rewired (v2.2.1)

## Project Structure

```
MybatisLogParser/
├── public/                 # Static assets and HTML template
├── src/
│   ├── components/         # React components
│   │   ├── mybatis-log-parser.tsx  # Main application component
│   │   └── ss.css          # Component-specific styles
│   ├── App.js              # Main App component
│   ├── index.js            # Application entry point
│   └── ...                 # Other React boilerplate files
├── package.json            # Dependencies and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── postcss.config.js       # PostCSS configuration
└── onfig-overrides.js      # Webpack configuration overrides
```

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

## How to Use

1. Copy MyBatis log output containing SQL statements
2. Click "自动粘贴并解析" (Auto Paste and Parse) to automatically paste from clipboard and parse the SQL
3. The formatted SQL will appear in the output area with syntax highlighting
4. Click "复制" (Copy) to copy the formatted SQL to clipboard
5. Use "清空" (Clear) to reset the input and output areas

## Configuration

- Uses react-app-rewired with custom webpack configuration in `onfig-overrides.js`
- Tailwind CSS with customized theme settings
- SQL formatting with mysql language specification
- Automatic clipboard operations for enhanced user experience
