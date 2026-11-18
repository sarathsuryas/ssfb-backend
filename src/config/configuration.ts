export interface AppConfiguration {
  port: number;
  nodeEnv: 'development' | 'test' | 'production';
  database: {
    url: string;
  };
  jwt: {
    secret: string;
    expiresIn: string;
    refreshTtlSeconds: number;
  };
  cookies: {
    secure: boolean;
  };
  cors: {
    origins: string[];
  };
}

/**
 * Values have already been validated by `validateEnv`, so the fallbacks here
 * only exist to keep the factory's return type non-nullable.
 */
export default (): AppConfiguration => {
  const nodeEnv = (process.env.NODE_ENV ??
    'development') as AppConfiguration['nodeEnv'];

  return {
    port: Number(process.env.PORT ?? 3000),
    nodeEnv,
    database: {
      url: process.env.DATABASE_URL ?? '',
    },
    jwt: {
      secret: process.env.JWT_SECRET ?? '',
      expiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
      refreshTtlSeconds: Number(
        process.env.REFRESH_TOKEN_TTL_SECONDS ?? 604800,
      ),
    },
    cookies: {
      secure: nodeEnv === 'production',
    },
    cors: {
      origins: (process.env.CORS_ORIGINS ?? 'http://localhost:4200')
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    },
  };
};
