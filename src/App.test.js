import { render, screen } from '@testing-library/react';
import MybatisLogParser from './components/mybatis-log-parser.tsx';

test('renders parser title', () => {
  render(<MybatisLogParser />);
  const titleElement = screen.getByText(/MyBatis Log Parser/i);
  expect(titleElement).toBeInTheDocument();
});
