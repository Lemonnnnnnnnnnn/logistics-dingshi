import { DistanceMark } from '@/modules/dashboard/withDashboard';

export const mark2distance = (value): DistanceMark => {
  const trans = {
    5: 5,
    10: 10,
    15: 20,
    20: 50,
  };
  return trans[value];
};
