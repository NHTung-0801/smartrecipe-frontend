// Chạy trước mọi file test (khai báo ở vite.config.js -> test.setupFiles).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// Tháo DOM sau từng test để component của test trước không lẫn sang test sau.
afterEach(() => {
  cleanup();
});
