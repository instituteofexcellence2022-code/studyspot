import React from 'react';
import { PolarAngleAxis as RechartsPolarAngleAxis } from 'recharts';

export type PolarAngleAxisCompatProps = React.ComponentProps<typeof RechartsPolarAngleAxis>;

const PolarAngleAxisCompat: React.FC<PolarAngleAxisCompatProps> = (props) => (
  // eslint-disable-next-line react/jsx-props-no-spreading
  <RechartsPolarAngleAxis {...props} />
);

export default PolarAngleAxisCompat;
