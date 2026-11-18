export interface AppConfiguration {
  port: number;
  nodeEnv: 'development' | 'test' | 'production';
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

/**
 * Values have already been validated by `validateEnv`, so the fallbacks here
 * only exist to keep the factory's return type non-nullable.
 */
export default (): AppConfiguration => ({
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: (process.env.NODE_ENV ??
    'development') as AppConfiguration['nodeEnv'],
  database: {
    url: process.env.DATABASE_URL ?? '',
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? '',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
  },
});
