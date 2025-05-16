import { typeOrmConfig, dataSourceConfig } from '@/configs/typeorm.config';

describe('typeorm.config', () => {
  const config = typeOrmConfig as any;

  it('should define typeOrmConfig with expected properties', () => {
    expect(config).toBeDefined();
    expect(config.type).toBe('postgres');
    expect(typeof config.host).toBe('string');
    expect(typeof config.port).toBe('number');
    expect(typeof config.username).toBe('string');
    expect(typeof config.password).toBe('string');
    expect(typeof config.database).toBe('string');
    expect(Array.isArray(config.entities)).toBe(true);
    expect(config.entities.length).toBeGreaterThan(0);
    expect(typeof config.synchronize).toBe('boolean');
  });

  it('should define dataSourceConfig similarly', () => {
    expect(dataSourceConfig).toEqual(typeOrmConfig);
  });
});
