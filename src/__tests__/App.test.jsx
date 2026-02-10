import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock framer-motion to simplify rendering
vi.mock('framer-motion', () => {
  const motion = new Proxy({}, {
    get: (_, tag) => React.forwardRef((props, ref) => {
      const { initial, animate, exit, transition, whileHover, whileTap, ...rest } = props;
      return React.createElement(tag, { ...rest, ref });
    }),
  });
  return {
    motion,
    AnimatePresence: ({ children }) => React.createElement(React.Fragment, null, children),
  };
});

import App from '../App';

describe('App - Season Over', () => {
  it('renders the thank you page with correct messaging', () => {
    render(React.createElement(App));

    expect(screen.getByText('Super Bowl LX')).toBeInTheDocument();
    expect(screen.getByText('Thank you for using my dashboard')).toBeInTheDocument();
    expect(screen.getByText(/See you again next year at the SoFi/)).toBeInTheDocument();
    expect(screen.getByText(/Super Bowl LXI/)).toBeInTheDocument();
    expect(screen.getByText(/SoFi Stadium/)).toBeInTheDocument();
  });
});
