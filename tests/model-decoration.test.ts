import 'reflect-metadata';
import { Metadata } from '@decaf-ts/decoration';
import { Model } from '@decaf-ts/decorator-validation';
import { WebApp } from '../src/app/structure/WebApp';
import { WebAppPage } from '../src/app/structure/WebAppPage';
import { Section } from '../src/app/structure/Section';
import { SiteItem } from '../src/app/models/SiteItem';
import { ModuleDoc } from '../src/app/models/ModuleDoc';

type AnyClass = new (...args: never[]) => unknown;

describe('web-page model decoration', () => {
  it('decorates WebApp as a @uimodel container with the app-web-app tag', () => {
    expect(WebApp.prototype).toBeInstanceOf(Model);
    const ui = Metadata.get(WebApp as unknown as AnyClass, 'ui.uimodel') as {
      tag: string;
      props: Record<string, unknown>;
    };
    expect(ui).toBeDefined();
    expect(ui.tag).toBe('app-web-app');
    expect(ui.props).toEqual({ label: 'site.app.label' });
  });

  it('decorates WebAppPage as a @uimodel container with the app-web-app-page tag', () => {
    const ui = Metadata.get(WebAppPage as unknown as AnyClass, 'ui.uimodel') as { tag: string };
    expect(ui).toBeDefined();
    expect(ui.tag).toBe('app-web-app-page');
  });

  it('decorates Section as a @uimodel container with the app-site-section tag', () => {
    const ui = Metadata.get(Section as unknown as AnyClass, 'ui.uimodel') as { tag: string };
    expect(ui).toBeDefined();
    expect(ui.tag).toBe('app-site-section');
  });

  it('decorates ModuleDoc as a @uimodel container with the app-module-doc tag', () => {
    const ui = Metadata.get(ModuleDoc as unknown as AnyClass, 'ui.uimodel') as { tag: string };
    expect(ui).toBeDefined();
    expect(ui.tag).toBe('app-module-doc');
  });

  it('decorates SiteItem as a @uilistmodel leaf item (not a container)', () => {
    const ui = Metadata.get(SiteItem as unknown as AnyClass, 'ui.uimodel');
    expect(ui).toBeUndefined();
    const listMeta = Metadata.get(SiteItem as unknown as AnyClass, 'ui.uilistmodel') as {
      item: { tag: string };
    };
    expect(listMeta).toBeDefined();
    expect(listMeta.item.tag).toBe('app-site-item');
  });

  it('marks the segmented hierarchy via @list clazz references', () => {
    const clazz = (cls: AnyClass, prop: string): string | undefined => {
      const all = Metadata.get(cls) as Record<string, unknown>;
      const validation = (all as { validation?: Record<string, { list?: { clazz?: unknown[] } }> })
        .validation;
      const thunk = validation?.[prop]?.list?.clazz?.[0] as
        | (() => { name?: string })
        | undefined;
      return typeof thunk === 'function' ? thunk()?.name : undefined;
    };

    expect(clazz(WebApp as unknown as AnyClass, 'nav')).toBe('Section');
    expect(clazz(WebApp as unknown as AnyClass, 'pages')).toBe('WebAppPage');
    expect(clazz(WebAppPage as unknown as AnyClass, 'header')).toBe('Section');
    expect(clazz(WebAppPage as unknown as AnyClass, 'sections')).toBe('Section');
    expect(clazz(WebAppPage as unknown as AnyClass, 'footer')).toBe('Section');
    expect(clazz(Section as unknown as AnyClass, 'items')).toBe('SiteItem');
    expect(clazz(SiteItem as unknown as AnyClass, 'children')).toBe('SiteItem');
    expect(clazz(ModuleDoc as unknown as AnyClass, 'examples')).toBe('SiteItem');
    expect(clazz(ModuleDoc as unknown as AnyClass, 'tutorials')).toBe('SiteItem');
  });

  it('marks the identity columns with @pk cartridges', () => {
    const pk = (cls: AnyClass, prop: string): unknown =>
      (Metadata.get(cls) as Record<string, unknown>).pk?.[prop] ??
      (Metadata.get(cls) as Record<string, unknown>).sequence?.[prop];

    expect(pk(WebApp as unknown as AnyClass, 'id')).toBeDefined();
    expect(pk(WebAppPage as unknown as AnyClass, 'id')).toBeDefined();
    expect(pk(Section as unknown as AnyClass, 'id')).toBeDefined();
    expect(pk(SiteItem as unknown as AnyClass, 'id')).toBeDefined();
    expect(pk(ModuleDoc as unknown as AnyClass, 'name')).toBeDefined();
  });

  it('builds model instances with decorated property metadata', () => {
    const app = new WebApp({ id: 'en_us', locale: 'en_us' });
    expect(app).toBeInstanceOf(WebApp);
    expect(app.nav).toEqual([]);
    expect(app.pages).toEqual([]);

    const page = new WebAppPage({ id: 'index', sections: [new Section({ kind: 'hero' })] });
    expect(page.sections).toHaveLength(1);
    expect(page.sections[0].kind).toBe('hero');

    const item = new SiteItem({ id: 'x', kind: 'card', title: 'T', children: [new SiteItem()] });
    expect(item.children).toHaveLength(1);
    expect(item.children[0]).toBeInstanceOf(SiteItem);
  });
});
