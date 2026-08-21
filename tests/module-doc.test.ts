import fs from 'node:fs';
import path from 'node:path';
import { RamAdapter } from '@decaf-ts/core/ram';
import { Repository } from '@decaf-ts/core';
import { SiteService } from '../src/app/services/site.service';
import { ModuleDoc } from '../src/app/models/ModuleDoc';

describe('module-doc seeding', () => {
  const user = 'module-seed-test';
  let service: SiteService;

  beforeAll(() => {
    new RamAdapter({ user });
    service = new SiteService();
    const modulesJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../src/assets/data/modules.json'), 'utf-8')
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => modulesJson,
    }) as unknown as typeof fetch;
  });

  it('seeds ModuleDoc records for every module in modules.json via Repository.forModel', async () => {
    await service.seed('en_us');
    const modules = await service.getModules();
    expect(modules.length).toBeGreaterThanOrEqual(20);
    expect(modules[0]).toBeInstanceOf(ModuleDoc);

    const repo = Repository.forModel(ModuleDoc);
    const decoration = await repo.read('decoration');
    expect(decoration).toBeInstanceOf(ModuleDoc);
    expect(decoration!.name).toBe('decoration');
    expect(decoration!.title).toBe('decoration');
    expect(decoration!.summary).not.toBe('');

    expect(modules.map((m) => m.name)).toContain('logging');
    expect(modules.map((m) => m.name)).toContain('core');
  });

  it('seeds per-locale tutorials for the en_us locale and none for locales without them', async () => {
    await service.seed('en_us');
    const repo = Repository.forModel(ModuleDoc);
    const decoration = await repo.read('decoration');
    expect(decoration!.tutorials.length).toBeGreaterThanOrEqual(2);
    expect(decoration!.tutorials[0].kind).toBe('tutorial');
    expect(decoration!.tutorials[0].code).not.toBe('');
  });
});
