# CRUSH Configuration for MybatisLogParser

## Project Overview
React application for parsing and formatting MyBatis SQL logs. Uses Ant Design components and SQL formatter.

## Build Commands
- `npm run build` - Build production bundle
- `npm start` - Start development server
- `npm run test` - Run all tests
- `npm run test -- --testNamePattern="test-name"` - Run specific test

## Code Style Guidelines
- Use TypeScript with explicit typing
- Functional components with React hooks
- Ant Design component library
- Tailwind CSS for utility classes
- SQL formatting with sql-formatter library
- Syntax highlighting with react-syntax-highlighter

## Naming Conventions
- Camel case for variables and functions
- Pascal case for components
- Descriptive function names (handleX, parseX, formatX)
- Constants in UPPER_SNAKE_CASE

## Import Organization
1. React and React hooks
2. External libraries
3. Ant Design components
4. Internal components
5. CSS/SCSS files

## Error Handling
- Try-catch blocks for operations that can fail
- User-friendly error messages
- Timeout for message display
- Graceful degradation when parsing fails

## Testing
- Jest and React Testing Library
- Test files named *.test.js
- Place tests next to components they test

## Formatting
- Prettier with default settings
- 2 space indentation
- Line width 80 characters
- Trailing commas in objects/arrays

## Additional Notes
- Uses react-app-rewired for configuration overrides
- Tailwind CSS configured for styling
- Monaco editor for code editing features