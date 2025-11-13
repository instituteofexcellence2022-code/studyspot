import React from 'react';
import { PolarAngleAxis as RechartsPolarAngleAxis } from 'recharts';

// Workaround for Recharts TypeScript issue with PolarAngleAxis
// This component wraps PolarAngleAxis to make it compatible with React 19

const PolarAngleAxisCompat: React.FC<any> = (props) => {
  // Cast to any to bypass TypeScript's JSX component type checking
  const Component = RechartsPolarAngleAxis as any;
  return <Component {...props} />;
};

export default PolarAngleAxisCompat;

