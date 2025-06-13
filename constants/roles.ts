export type UserRole = 'user' | 'admin';

export const roles = [
  {
    id: 'user',
    name: 'Regular User',
    description: 'Access to basic trading features with time limitations',
    features: ['Basic trading (24-hour limit)', 'Pre-made strategies', 'Portfolio tracking']
  },
  {
    id: 'admin',
    name: 'Admin',
    description: 'Full access to all features and user management',
    features: ['User management', 'Strategy creation', 'Exchange management', 'Unlimited trading', 'Analytics']
  }
];