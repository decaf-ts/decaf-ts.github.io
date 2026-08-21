import { loadWorkspaceModule } from "../workspace-target";
import {
  buildSite,
  SeedSiteData,
} from "../../src/app/seed/site.seed";
import { SITE_LOCALES, SiteLocale } from "../../src/app/seed/i18n-data";
import { ensureSiteReady } from "../../src/app/services/site.service";

describe("web-page library surface", () => {
  let workspaceModule: {
    VERSION: string;
    SITE_LOCALES: readonly SiteLocale[];
    buildSite: (locale: SiteLocale) => SeedSiteData;
    ensureSiteReady: (locale: SiteLocale) => Promise<void>;
  };

  beforeAll(async () => {
    workspaceModule = await loadWorkspaceModule();
  });

  it("exports the site library surface", () => {
    expect(workspaceModule.VERSION).toBeTruthy();
    expect(workspaceModule.SITE_LOCALES).toEqual(SITE_LOCALES);
    expect(typeof workspaceModule.buildSite).toBe("function");
    expect(typeof workspaceModule.ensureSiteReady).toBe("function");
    expect(typeof ensureSiteReady === "function").toBe(true);
  });

  it("builds a site for every exported locale", () => {
    for (const locale of workspaceModule.SITE_LOCALES) {
      const site = workspaceModule.buildSite(locale);
      expect(site.id).toBe(locale);
      expect(site.pages.map((p) => p.id)).toContain("index");
    }
  });
});
