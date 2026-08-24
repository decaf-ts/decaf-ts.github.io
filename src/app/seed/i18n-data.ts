/* eslint-disable */
// AUTO-GENERATED from www-mock/locales - do not hand edit. Re-run scripts/data-transform.cjs
/**
 * @module app/seed/i18n-data
  * @description Auto-generated per-locale site content (brands, cards, faq, tutorials and
  * feature modules) extracted from the www-mock locale JSON files. Footer slogans are now
  * stored directly in each locale file under the `banner.slogans` key, not in a separate catalog.
 * @summary Exposes the plain-data content types and the per-locale site seed used by
 * {@link app/seed/site.seed} to build the site graph and by the site services/pages to
 * render module features, tutorials and examples.
 */

/**
 * @description A brand logo entry of the homepage logo cloud.
 * @interface SeedBrandItem
 * @memberOf module:app/seed/i18n-data
 */
export interface SeedBrandItem { name: string; src: string }
/**
 * @description A feature card of the homepage features grid.
 * @interface SeedFeatureCard
 * @memberOf module:app/seed/i18n-data
 */
export interface SeedFeatureCard { title: string; description: string; icon?: string }
/**
 * @description A FAQ question/answer entry of the homepage FAQ section.
 * @interface SeedFaqItem
 * @memberOf module:app/seed/i18n-data
 */
export interface SeedFaqItem { title: string; body: string }
/**
 * @description A tutorial entry for a module documentation page.
 * @interface SeedTutorialItem
 * @memberOf module:app/seed/i18n-data
 */
export interface SeedTutorialItem { title: string; summary?: string; code?: string }
/**
 * @description A module feature-group entry of the features pages, mirroring the module docs.
 * @interface SeedFeaturesModule
 * @memberOf module:app/seed/i18n-data
 */
export interface SeedFeaturesModule { title?: string; summary?: string; features?: { title: string; description: string }[] }

/**
 * @const SITE_EN_EN
 * @description English (`en_en`) locale site content.
 * @type {{
 *   brands: SeedBrandItem[],
 *   cards: SeedFeatureCard[],
 *   faq: SeedFaqItem[],
 *   tutorials: Object,
 *   featureModules: Object
 * }}
 * @memberOf module:app/seed/i18n-data
 */
export const SITE_EN_EN: {
  brands: SeedBrandItem[];
  cards: SeedFeatureCard[];
  faq: SeedFaqItem[];
  tutorials: Record<string, { items: SeedTutorialItem[] }>;
  featureModules: Record<string, SeedFeaturesModule>;
} = {
      "brands": [
    {
     "name": "Transistor",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
    },
    {
     "name": "Reform",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
    },
    {
     "name": "Tuple",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
    },
    {
     "name": "SavvyCal",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
    },
    {
     "name": "Statamic",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
    }
   ],
   "cards": [
    {
     "title": "Seamless Styling",
     "description": "Unlock the full potential of your projects with Decaf's modular tools.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Sliders\"><g id=\"Group\"><circle cx=\"6.8\" cy=\"16.5\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"15.6\" cy=\"10.7\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"24.3\" cy=\"20.4\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M6.8 4.9V13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 4.9V17.5\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 4.9V7.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M6.8 19.4V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 23.3V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 13.6V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></g></svg>"
    },
    {
     "title": "Headless & Modular",
     "description": "Browse our complete list of modules to find the perfect solution",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"ListChecks\"><path d=\"M15.6 7.8H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 15.6H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 23.3H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 7.8L6.8 9.7L10.7 5.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 15.6L6.8 17.5L10.7 13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 23.3L6.8 25.3L10.7 21.4\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></svg>"
    },
    {
     "title": "Optimised Performance",
     "description": "Start integrating Decaf modules today to optimise your development workflow.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Rocket\"><path d=\"M16 2L26 12L20 18L12 10L16 2Z\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/></g></svg>"
    }
   ],
   "faq": [
    {
     "title": "What is Vanilla CMS?",
     "body": "Vanilla CMS is a powerful Headless CMS designed to help developers and content teams manage and deliver content seamlessly across multiple platforms. It provides a flexible API-based approach for ultimate customisation."
    },
    {
     "title": "What types of projects is Vanilla CMS best suited for?",
     "body": "Vanilla CMS is ideal for websites, mobile apps, e-commerce platforms, SaaS applications, and any digital product that requires a structured and scalable content management solution."
    },
    {
     "title": "Can I integrate Vanilla CMS with my existing tech stack?",
     "body": "Absolutely! Vanilla CMS is API-first, making it compatible with React, Vue, Next.js, Nuxt.js, Svelte, Flutter, and more. You can fetch content via REST or GraphQL APIs."
    },
    {
     "title": "How is Vanilla CMS different from traditional CMS platforms?",
     "body": "Unlike traditional CMSs, Vanilla CMS decouples the backend from the frontend, giving developers the freedom to use any technology to display content. This makes it more scalable, faster, and adaptable for modern applications."
    },
    {
     "title": "Does Vanilla CMS support multiple users and roles?",
     "body": "Yes! Vanilla CMS comes with Role-Based Access Control (RBAC), allowing you to define permissions for different team members, ensuring security and content integrity."
    },
    {
     "title": "Is Vanilla CMS scalable for large enterprises?",
     "body": "Yes! Our architecture is cloud-based and built for scalability, ensuring your content performs well whether you're a startup or a large enterprise with high traffic demands."
    }
   ],
   "tutorials": {
    "decoration": {
     "items": [
      {
       "title": "Add metadata to a class",
       "summary": "Record a description on a class and read it from the Metadata store.",
       "code": "import { description, Metadata } from \"@decaf-ts/decoration\";\n\n@description(\"User entity\")\nclass User {\n  @description(\"Primary email address\")\n  email!: string;\n}\n\nconsole.log(Metadata.description(User)); // \"User entity\"\nconsole.log(Metadata.description(User, 'email')); // \"Primary email address\""
      },
      {
       "title": "Add metadata to a property",
       "summary": "Use @prop and Metadata.set to annotate property types and custom metadata.",
       "code": "import { prop, Metadata } from \"@decaf-ts/decoration\";\n\nclass Article {\n  @prop()\n  title!: string;\n}\n\nconsole.log(Metadata.type(Article, 'title') === String); // true"
      }
     ]
    },
    "decorator-validation": {
     "items": [
      {
       "title": "Create and decorate a model class",
       "summary": "Define a model class and decorate properties with common validators (required, min, max, pattern).",
       "code": "import { required, min, max, pattern } from '@decaf-ts/decorator-validation';\nclass Product {\n  @required()\n  id!: string;\n\n  @min(0)\n  price!: number;\n\n  @pattern(/^[A-Z]+$/)\n  code!: string;\n}"
      }
     ]
    }
   },
   "featureModules": {}
  };

/**
 * @const SITE_EN_US
 * @description English (`en_us`) locale site content. See the {@link SITE_EN_EN} typedef
 * for the full shape.
 * @memberOf module:app/seed/i18n-data
 */
export const SITE_EN_US: {
  brands: SeedBrandItem[];
  cards: SeedFeatureCard[];
  faq: SeedFaqItem[];
  tutorials: Record<string, { items: SeedTutorialItem[] }>;
  featureModules: Record<string, SeedFeaturesModule>;
} = {
      "brands": [
    {
     "name": "Transistor",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
    },
    {
     "name": "Reform",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
    },
    {
     "name": "Tuple",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
    },
    {
     "name": "SavvyCal",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
    },
    {
     "name": "Statamic",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
    }
   ],
   "cards": [
    {
     "title": "Seamless Styling",
     "description": "Unlock the full potential of your projects with Decaf's modular tools.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Sliders\"><g id=\"Group\"><circle cx=\"6.8\" cy=\"16.5\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"15.6\" cy=\"10.7\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"24.3\" cy=\"20.4\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M6.8 4.9V13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 4.9V17.5\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 4.9V7.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M6.8 19.4V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 23.3V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 13.6V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></g></svg>"
    },
    {
     "title": "Headless & Modular",
     "description": "Browse our complete list of modules to find the perfect solution",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"ListChecks\"><path d=\"M15.6 7.8H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 15.6H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 23.3H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 7.8L6.8 9.7L10.7 5.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 15.6L6.8 17.5L10.7 13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 23.3L6.8 25.3L10.7 21.4\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></svg>"
    },
    {
     "title": "Optimized Performance",
     "description": "Start integrating Decaf modules today to optimize your development workflow.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Rocket\"><path d=\"M16 2L26 12L20 18L12 10L16 2Z\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/></g></svg>"
    }
   ],
   "faq": [
    {
     "title": "What is Vanilla CMS?",
     "body": "Vanilla CMS is a powerful Headless CMS designed to help developers and content teams manage and deliver content seamlessly across multiple platforms. It provides a flexible API-based approach for ultimate customization."
    },
    {
     "title": "What types of projects is Vanilla CMS best suited for?",
     "body": "Vanilla CMS is ideal for websites, mobile apps, e-commerce platforms, SaaS applications, and any digital product that requires a structured and scalable content management solution."
    },
    {
     "title": "Can I integrate Vanilla CMS with my existing tech stack?",
     "body": "Absolutely! Vanilla CMS is API-first, making it compatible with React, Vue, Next.js, Nuxt.js, Svelte, Flutter, and more. You can fetch content via REST or GraphQL APIs."
    },
    {
     "title": "How is Vanilla CMS different from traditional CMS platforms?",
     "body": "Unlike traditional CMSs, Vanilla CMS decouples the backend from the frontend, giving developers the freedom to use any technology to display content. This makes it more scalable, faster, and adaptable for modern applications."
    },
    {
     "title": "Does Vanilla CMS support multiple users and roles?",
     "body": "Yes! Vanilla CMS comes with Role-Based Access Control (RBAC), allowing you to define permissions for different team members, ensuring security and content integrity."
    },
    {
     "title": "Is Vanilla CMS scalable for large enterprises?",
     "body": "Yes! Our architecture is cloud-based and built for scalability, ensuring your content performs well whether you're a startup or a large enterprise with high traffic demands."
    }
   ],
   "tutorials": {
    "decoration": {
     "items": [
      {
       "title": "Add metadata to a class",
       "summary": "Record a description on a class and read it from the Metadata store.",
       "code": "import { description, Metadata } from \"@decaf-ts/decoration\";\n\n@description(\"User entity\")\nclass User {\n  @description(\"Primary email address\")\n  email!: string;\n}\n\nconsole.log(Metadata.description(User)); // \"User entity\"\nconsole.log(Metadata.description(User, 'email')); // \"Primary email address\""
      },
      {
       "title": "Add metadata to a property",
       "summary": "Use @prop and Metadata.set to annotate property types and custom metadata.",
       "code": "import { prop, Metadata } from \"@decaf-ts/decoration\";\n\nclass Article {\n  @prop()\n  title!: string;\n}\n\nconsole.log(Metadata.type(Article, 'title') === String); // true"
      },
      {
       "title": "Add metadata to a method",
       "summary": "Record method parameter and return types and read them via Metadata helpers.",
       "code": "import { Metadata, DecorationKeys } from \"@decaf-ts/decoration\";\n\nclass Service {\n  get(): string { return 'value'; }\n}\n\nMetadata.set(Service, `${DecorationKeys.METHODS}.get.${DecorationKeys.DESIGN_PARAMS}`, []);\nMetadata.set(Service, `${DecorationKeys.METHODS}.get.${DecorationKeys.DESIGN_RETURN}`, String);\nconsole.log(Metadata.methods(Service)); // [\"get\"]"
      },
      {
       "title": "Add metadata to a parameter",
       "summary": "Capture decorator metadata for method parameters and retrieve design:param types.",
       "code": "// Use reflect-metadata along with custom parameter decorators to capture args.\nimport 'reflect-metadata';\nfunction Param() { return (t: any, k: string | symbol, idx: number) => { /* store param metadata */ }; }\nclass C { method(@Param() id: string) {} }\n// Reflect.getMetadata('design:paramtypes', C.prototype, 'method')"
      },
      {
       "title": "Create an overridable decorator with args",
       "summary": "Define a decorator factory that accepts args and register it as an overridable decorator in Decoration.",
       "code": "import { Decoration } from '@decaf-ts/decoration';\nconst tagFactory = (tag: string) => (target: any) => { target.__tag = tag; };\nDecoration.for('component').define({ decorator: tagFactory, args: ['base'] }).apply();\n@Decoration.for('component').apply()\nclass Base {}"
      },
      {
       "title": "Extend a decorator",
       "summary": "Append extras to a decoration so that additional behaviours are applied after the base decorators.",
       "code": "Decoration.for('component').define(((t: any) => { t.__base = true; }) as any).apply();\nDecoration.flavouredAs('web').for('component').extend({ decorator: (platform: string) => (target) => { (target as any).__platform = platform; }, args: ['web'] }).apply();"
      },
      {
       "title": "Override decoration for a flavour",
       "summary": "Provide a flavour-specific definition that replaces the default decorators for that flavour.",
       "code": "Decoration.setFlavourResolver(() => 'mobile');\nDecoration.flavouredAs('mobile').for('component').define(((target: any) => { (target as any).__mobile = true; }) as any).apply();"
      },
      {
       "title": "Change the flavour resolver",
       "summary": "Customize how the system chooses a flavour at runtime based on the target.",
       "code": "import { Decoration } from '@decaf-ts/decoration';\nDecoration.setFlavourResolver((target) => { return target && (target as any).__platform ? 'web' : 'decaf'; });"
      }
     ]
    },
    "decorator-validation": {
     "items": [
      {
       "title": "Create and decorate a model class",
       "summary": "Define a model class and decorate properties with common validators (required, min, max, pattern).",
       "code": "import { required, min, max, pattern } from '@decaf-ts/decorator-validation';\nclass Product {\n  @required()\n  id!: string;\n\n  @min(0)\n  price!: number;\n\n  @pattern(/^[A-Z]+$/)\n  code!: string;\n}"
      },
      {
       "title": "Create a custom validation decorator and validator",
       "summary": "Register a validator and expose a decorator that attaches validation metadata for it.",
       "code": "// Create validator and register it via Validation.registerDecorator; then create a decorator factory that uses Decoration.for(key).define(...) to attach metadata. See src/validation for examples (required, min, max)."
      },
      {
       "title": "Comparison decorators usage (@eq, @diff)",
       "summary": "Use comparison-style decorators to express constraints between fields and validate them at runtime.",
       "code": "import { eq, diff } from '@decaf-ts/decorator-validation';\nclass Pair {\n  @eq('otherField')\n  value!: number;\n}"
      },
      {
       "title": "Retrieve validation metadata from a model",
       "summary": "Use the Metadata/Validation helpers to enumerate validators attached to a model and run validation programmatically.",
       "code": "import { Validation } from '@decaf-ts/decorator-validation';\nconst errors = Validation.validate(instance); // returns structured errors"
      },
      {
       "title": "Model builder and subclassing examples",
       "summary": "Build complex models using subclassing, nested models, and builder utilities provided in the module.",
       "code": "// Use Model and helper builders in decorator-validation/src/model to create nested models and reuse validation decorators across subclasses."
      }
     ]
    }
   },
   "featureModules": {
    "decoration": {
     "title": "Decoration",
     "summary": "Decorator helpers and a Metadata runtime to store and query structured metadata.",
     "features": [
      {
       "title": "Composable Decorators",
       "description": "Define and compose decorators with flavour-specific extensions to adapt to frameworks like Vue or Nest."
      },
      {
       "title": "Metadata Store",
       "description": "Record and query metadata for classes and members at runtime using a stable API."
      },
      {
       "title": "Property Helpers",
       "description": "Convenience decorators such as @prop and @description to capture types and human-friendly documentation."
      }
     ]
    },
    "logging": {
     "title": "Logging",
     "summary": "Lightweight structured logging with pluggable factories and handy decorators for method instrumentation.",
     "features": [
      {
       "title": "MiniLogger",
       "description": "A minimal, context-aware logger with configurable levels and optional theming."
      },
      {
       "title": "Decorators",
       "description": "Method decorators (log, debug, info, verbose, silly) to consistently instrument calls and benchmarks."
      },
      {
       "title": "Pluggable Backends",
       "description": "Swap the logger factory to integrate with adapters like Winston without changing call sites."
      }
     ]
    },
    "utils": {
     "title": "Utils",
     "summary": "General purpose utilities for CLI, filesystem, HTTP, and text processing to speed up common tasks.",
     "features": [
      {
       "title": "CLI Helpers",
       "description": "Abstract Command class, input helpers, and standard output writers for consistent CLI apps."
      },
      {
       "title": "File & Package Utilities",
       "description": "Helpers to read/write/patch files and inspect package metadata programmatically."
      },
      {
       "title": "Text Processing",
       "description": "Common string utilities for case conversions, templating and placeholder replacement."
      }
     ]
    },
    "reflection": {
     "title": "Reflection",
     "summary": "Runtime type inspection utilities built on reflect-metadata for validators and metadata-driven systems.",
     "features": [
      {
       "title": "Type Checks",
       "description": "Validate values against expected types at runtime with high fidelity."
      },
      {
       "title": "Decorator Introspection",
       "description": "Query class and property decorators to build metadata-driven frameworks."
      },
      {
       "title": "Deep Equality",
       "description": "Robust isEqual utilities for comparing complex structures including Maps and TypedArrays."
      }
     ]
    }
   }
  };

/**
 * @const SITE_PT_BR
 * @description Brazilian Portuguese (`pt_br`) locale site content. See the
 * {@link SITE_EN_EN} typedef for the full shape.
 * @memberOf module:app/seed/i18n-data
 */
export const SITE_PT_BR: {
  brands: SeedBrandItem[];
  cards: SeedFeatureCard[];
  faq: SeedFaqItem[];
  tutorials: Record<string, { items: SeedTutorialItem[] }>;
  featureModules: Record<string, SeedFeaturesModule>;
} = {
      "brands": [
    {
     "name": "Transistor",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
    },
    {
     "name": "Reform",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
    },
    {
     "name": "Tuple",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
    },
    {
     "name": "SavvyCal",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
    },
    {
     "name": "Statamic",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
    }
   ],
   "cards": [
    {
     "title": "Estilização Sem Esforço",
     "description": "Liberte todo o potencial dos seus projetos com as ferramentas modulares do Decaf.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Sliders\"><g id=\"Group\"><circle cx=\"6.8\" cy=\"16.5\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"15.6\" cy=\"10.7\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"24.3\" cy=\"20.4\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M6.8 4.9V13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 4.9V17.5\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 4.9V7.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M6.8 19.4V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 23.3V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 13.6V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></g></svg>"
    },
    {
     "title": "Headless e Modular",
     "description": "Veja nossa lista completa de módulos para encontrar a solução ideal",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"ListChecks\"><path d=\"M15.6 7.8H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 15.6H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 23.3H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 7.8L6.8 9.7L10.7 5.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 15.6L6.8 17.5L10.7 13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 23.3L6.8 25.3L10.7 21.4\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></svg>"
    },
    {
     "title": "Desempenho Otimizado",
     "description": "Comece a integrar módulos Decaf hoje para otimizar seu fluxo de trabalho.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Rocket\"><path d=\"M16 2L26 12L20 18L12 10L16 2Z\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M14 14L18 18\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M6 22L10 18L14 22L10 26L6 22Z\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M2 30L8 28L10 26\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></svg>"
    }
   ],
   "faq": [
    {
     "title": "O que é o Vanilla CMS?",
     "body": "O Vanilla CMS é um poderoso Headless CMS que ajuda equipes de desenvolvimento e conteúdo a gerenciar e entregar conteúdo em várias plataformas, com uma abordagem flexível baseada em API."
    },
    {
     "title": "Para quais projetos o Vanilla CMS é mais indicado?",
     "body": "Ideal para sites, apps mobile, e‑commerce, aplicações SaaS e qualquer produto digital que exija gestão de conteúdo estruturada e escalável."
    },
    {
     "title": "Posso integrar o Vanilla CMS ao meu stack atual?",
     "body": "Com certeza! O Vanilla CMS é API-first e compatível com React, Vue, Next.js, Nuxt.js, Svelte, Flutter e mais. Você pode buscar conteúdo via REST ou GraphQL."
    },
    {
     "title": "Como o Vanilla CMS difere de CMSs tradicionais?",
     "body": "Ele desacopla o backend do frontend, permitindo usar qualquer tecnologia para exibir conteúdo. Isso o torna mais escalável, rápido e adaptável."
    },
    {
     "title": "Há suporte a múltiplos usuários e papéis?",
     "body": "Sim! O Vanilla CMS possui RBAC, permitindo definir permissões para diferentes membros, garantindo segurança e integridade do conteúdo."
    },
    {
     "title": "É escalável para grandes empresas?",
     "body": "Sim! Nossa arquitetura é baseada em nuvem e pronta para escalar, garantindo ótimo desempenho em qualquer carga."
    }
   ],
   "tutorials": {},
   "featureModules": {}
  };

/**
 * @const SITE_PT_PT
 * @description European Portuguese (`pt_pt`) locale site content. See the
 * {@link SITE_EN_EN} typedef for the full shape.
 * @memberOf module:app/seed/i18n-data
 */
export const SITE_PT_PT: {
  brands: SeedBrandItem[];
  cards: SeedFeatureCard[];
  faq: SeedFaqItem[];
  tutorials: Record<string, { items: SeedTutorialItem[] }>;
  featureModules: Record<string, SeedFeaturesModule>;
} = {
      "brands": [
    {
     "name": "Transistor",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg"
    },
    {
     "name": "Reform",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg"
    },
    {
     "name": "Tuple",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg"
    },
    {
     "name": "SavvyCal",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg"
    },
    {
     "name": "Statamic",
     "src": "https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg"
    }
   ],
   "cards": [
    {
     "title": "Estilização Fluida",
     "description": "Liberta todo o potencial dos teus projectos com as ferramentas modulares do Decaf.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Sliders\"><g id=\"Group\"><circle cx=\"6.8\" cy=\"16.5\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"15.6\" cy=\"10.7\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><circle cx=\"24.3\" cy=\"20.4\" r=\"2.9\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M6.8 4.9V13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 4.9V17.5\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 4.9V7.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M6.8 19.4V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M24.3 23.3V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 13.6V26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></g></svg>"
    },
    {
     "title": "Headless e Modular",
     "description": "Consulta a nossa lista completa de módulos para encontrares a solução ideal",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"ListChecks\"><path d=\"M15.6 7.8H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 15.6H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M15.6 23.3H26.3\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 7.8L6.8 9.7L10.7 5.8\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 15.6L6.8 17.5L10.7 13.6\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M4.9 23.3L6.8 25.3L10.7 21.4\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></svg>"
    },
    {
     "title": "Desempenho Optimizado",
     "description": "Começa hoje a integrar módulos Decaf para optimizares o teu fluxo de trabalho.",
     "icon": "<svg width=\"32\" height=\"32\" viewBox=\"0 0 32 32\" fill=\"none\" class=\"text-gray-900\"><g id=\"Rocket\"><path d=\"M16 2L26 12L20 18L12 10L16 2Z\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M14 14L18 18\" stroke=\"currentColor\" stroke-width=\"1.8\"/><path d=\"M6 22L10 18L14 22L10 26L6 22Z\" stroke=\"currentColor\" stroke-width=\"1.8\" fill=\"none\"/><path d=\"M2 30L8 28L10 26\" stroke=\"currentColor\" stroke-width=\"1.8\"/></g></svg>"
    }
   ],
   "faq": [
    {
     "title": "O que é o Vanilla CMS?",
     "body": "O Vanilla CMS é um poderoso Headless CMS para ajudar equipas de desenvolvimento e conteúdo a gerir e entregar conteúdo em várias plataformas. Fornece uma abordagem flexível baseada em API para máxima personalização."
    },
    {
     "title": "Para que projectos é mais indicado?",
     "body": "Ideal para sites, apps móveis, e‑commerce, aplicações SaaS e qualquer produto digital que necessite de gestão de conteúdo estruturada e escalável."
    },
    {
     "title": "Integra com o meu stack?",
     "body": "Claro! O Vanilla CMS é API-first e compatível com React, Vue, Next.js, Nuxt.js, Svelte, Flutter e mais. Podes obter conteúdo via REST ou GraphQL."
    },
    {
     "title": "Diferenças para CMS tradicionais?",
     "body": "Desacopla o backend do frontend, dando liberdade para usar qualquer tecnologia no frontend. Mais escalável, rápido e adaptável."
    },
    {
     "title": "Suporta múltiplos utilizadores e papéis?",
     "body": "Sim! Vem com RBAC, permitindo definir permissões por perfil, garantindo segurança e integridade do conteúdo."
    },
    {
     "title": "Escala para grandes empresas?",
     "body": "Sim! A arquitectura é cloud e preparada para escalar, garantindo bom desempenho em qualquer carga."
    }
   ],
   "tutorials": {},
   "featureModules": {}
  };

/**
 * @const SITE_LOCALES
 * @readonly
 * @description Ordered list of the supported locale codes.
 * @type {string[]}
 * @memberOf module:app/seed/i18n-data
 */
export const SITE_LOCALES = ["en_en", "en_us", "pt_br", "pt_pt"] as const;
/**
 * @typedef {string} SiteLocale
 * @description Union type of the supported locale codes, derived from {@link SITE_LOCALES}.
 * @memberOf module:app/seed/i18n-data
 */
export type SiteLocale = (typeof SITE_LOCALES)[number];
/**
 * @const SITE_SEED
 * @description Lookup of the per-locale site content keyed by {@link SiteLocale}, sharing
 * the exact shape of the {@link SITE_EN_EN} content.
 * @type {Object}
 * @memberOf module:app/seed/i18n-data
 */
export const SITE_SEED: Record<SiteLocale, typeof SITE_EN_EN> = { en_en: SITE_EN_EN, en_us: SITE_EN_US, pt_br: SITE_PT_BR, pt_pt: SITE_PT_PT };