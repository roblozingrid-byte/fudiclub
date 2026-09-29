import { describe, it, expect, beforeEach } from 'vitest';
import { setupCounter } from '../src/counter.js';

describe('setupCounter', () => {
  let button;

  beforeEach(() => {
    button = document.createElement('button');
    document.body.appendChild(button);
  });

  it('initializes button text with Count is 0', () => {
    setupCounter(button);
    expect(button.innerHTML).toBe('Count is 0');
  });

  it('increments count on click', () => {
    setupCounter(button);
    button.click();
    expect(button.innerHTML).toBe('Count is 1');
    button.click();
    expect(button.innerHTML).toBe('Count is 2');
  });
});
