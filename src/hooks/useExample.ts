import { useState } from 'react';

export function useExample(initial: string) {
  const [value, setValue] = useState(initial);
  return { value, setValue };
} 