import { Component, Input, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/**
 * @module app/components/ShowcaseDemoComponent
 * @description Interactive, dependency-free demo UI for a showcase highlight.
 * @summary Renders a professional live demo panel driven entirely by the
 * highlight's `demo.kind` + `demo.config` from the content pipeline: flavour and
 * adapter switches, model forms, route explorers, graph/task runners, guard and
 * validation simulators, feature-flag toggles, encryption round-trips and query
 * playgrounds. The demo mode is derived from the configuration keys, so every
 * content kind (decoration, model, routes, persistence, ui, graph, tasks, auth,
 * integrations, forms, crypto) produces a working control instead of an empty panel.
 */

/**
 * @description Shape of the parsed demo configuration object.
 * @interface DemoConfig
 * @memberOf module:app/components/ShowcaseDemoComponent
 */
interface DemoConfig {
  [key: string]: unknown;
}

/**
 * @description Angular component rendering the interactive demo of a highlight.
 * @class
 * @example
 * <app-showcase-demo kind="decoration" [config]="highlight.demoConfig"></app-showcase-demo>
 */
@Component({
  selector: 'app-showcase-demo',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './showcase-demo.component.html',
  styleUrl: './showcase-demo.component.scss',
})
export class ShowcaseDemoComponent implements OnInit {
  /**
   * @description Demo kind selected by the content pipeline.
   */
  @Input() kind = '';

  /**
   * @description Localized demo label.
   */
  @Input() label = '';

  /**
   * @description JSON-encoded demo configuration.
   */
  @Input() config = '';

  /**
   * @description Parsed demo configuration.
   */
  parsed: DemoConfig = {};

  /**
   * @description Currently selected option (switch/select/field demos).
   */
  selected = '';

  /**
   * @description Current free-text input (validation/encryption demos).
   */
  value = '';

  /**
   * @description Active step index of the runnable demos.
   */
  step = -1;

  /**
   * @description Toggled flag names of the feature-flag demo.
   */
  toggled: string[] = [];

  /**
   * @description Whether the simulated run has completed.
   */
  running = false;

  ngOnInit(): void {
    try {
      this.parsed = this.config ? (JSON.parse(this.config) as DemoConfig) : {};
    } catch {
      this.parsed = {};
    }
    this.selected = this.options()[0] || this.fields()[0] || '';
  }

  /**
   * @description Whether the configuration exposes a key.
   * @param {string} key - The configuration key.
   * @returns {boolean} `true` when the key is present.
   * @private
   */
  private has(key: string): boolean {
    const value = this.parsed[key];
    return value !== undefined && value !== null;
  }

  /**
   * @description Reads a configuration key as a string list.
   * @param {string} key - The configuration key.
   * @returns {string[]} The list of string values (empty when absent).
   * @private
   */
  private list(key: string): string[] {
    const value = this.parsed[key];
    if (Array.isArray(value)) return value.map((item) => String(item));
    if (typeof value === 'string' && value) return [value];
    return [];
  }

  /**
   * @description The selectable options of the switch demos.
   * @returns {string[]} The option labels.
   */
  options(): string[] {
    for (const key of ['flavours', 'renderers', 'adapters', 'roles', 'helpers']) {
      const value = this.list(key);
      if (value.length) return value;
    }
    return [];
  }

  /**
   * @description The form tags of the model-centric demo.
   * @returns {string[]} The tag names.
   */
  tags(): string[] {
    return this.list('tags');
  }

  /**
   * @description The field names of the validation demo.
   * @returns {string[]} The field names.
   */
  fields(): string[] {
    return this.list('fields');
  }

  /**
   * @description The repository helpers of the query demo.
   * @returns {string[]} The helper names.
   */
  helpers(): string[] {
    return this.list('helpers');
  }

  /**
   * @description The flag names of the feature-flag demo.
   * @returns {string[]} The flag names.
   */
  flags(): string[] {
    return this.list('flags');
  }

  /**
   * @description The CRUD operations of the route explorer.
   * @returns {string[]} The operation names.
   */
  surfaces(): string[] {
    const surface = this.list('surface');
    return surface.length ? surface : this.list('surfaces');
  }

  /**
   * @description The step labels of the runnable demos.
   * @returns {string[]} The step labels (steps, tasks or graph nodes).
   */
  steps(): string[] {
    for (const key of ['steps', 'tasks', 'nodes']) {
      const value = this.list(key);
      if (value.length) return value;
    }
    return [];
  }

  /**
   * @description The model name of the current demo, when present.
   * @returns {string} The model name, else `''`.
   */
  model(): string {
    return typeof this.parsed['model'] === 'string' ? (this.parsed['model'] as string) : '';
  }

  /**
   * @description The workflow name of the graph demo, when present.
   * @returns {string} The workflow name, else `''`.
   */
  workflow(): string {
    return typeof this.parsed['workflow'] === 'string' ? (this.parsed['workflow'] as string) : '';
  }

  /**
   * @description The list component tag of the model-centric demo.
   * @returns {string} The list tag, else `''`.
   */
  listTag(): string {
    return typeof this.parsed['listTag'] === 'string' ? (this.parsed['listTag'] as string) : '';
  }

  /**
   * @description Whether the current demo is a switch/select demo.
   * @returns {boolean} `true` when the config exposes selectable options.
   */
  isSwitch(): boolean {
    return this.has('flavours') || this.has('renderers') || this.has('adapters') || this.has('roles');
  }

  /**
   * @description Whether the current demo is the authorization guard simulator.
   * @returns {boolean} `true` when the config exposes roles.
   */
  isGuard(): boolean {
    return this.has('roles');
  }

  /**
   * @description Whether the current demo is a runnable step demo.
   * @returns {boolean} `true` for the graph and task runners.
   */
  isStepper(): boolean {
    return this.has('steps') || this.has('tasks') || this.has('nodes');
  }

  /**
   * @description Whether the current demo is the route explorer.
   * @returns {boolean} `true` when the config exposes CRUD operations.
   */
  isRoutes(): boolean {
    return this.has('surface') || this.has('surfaces');
  }

  /**
   * @description Whether the current demo is the repository query playground.
   * @returns {boolean} `true` when the config exposes helpers.
   */
  isQuery(): boolean {
    return this.has('helpers');
  }

  /**
   * @description Whether the current demo is the feature-flag toggle.
   * @returns {boolean} `true` for the integrations demo.
   */
  isFlags(): boolean {
    return this.has('flags');
  }

  /**
   * @description Whether the current demo is the validation form.
   * @returns {boolean} `true` when the config exposes fields.
   */
  isForm(): boolean {
    return this.has('fields');
  }

  /**
   * @description Whether the current demo is the model-centric form.
   * @returns {boolean} `true` when the config exposes form tags.
   */
  isModelForm(): boolean {
    return this.has('tags') && !this.has('fields');
  }

  /**
   * @description Whether the current demo is the encryption round-trip.
   * @returns {boolean} `true` when the config exposes an algorithm.
   */
  isCrypto(): boolean {
    return this.has('algorithm');
  }

  /**
   * @description Selects a switch/field demo option.
   * @param {string} option - The option to select.
   * @returns {void}
   */
  select(option: string): void {
    this.selected = option;
    this.step = -1;
  }

  /**
   * @description Toggles a feature flag on or off.
   * @param {string} flag - The flag name to toggle.
   * @returns {void}
   */
  toggleFlag(flag: string): void {
    this.toggled = this.toggled.includes(flag)
      ? this.toggled.filter((name) => name !== flag)
      : [...this.toggled, flag];
  }

  /**
   * @description Whether a feature flag is currently enabled.
   * @param {string} flag - The flag name.
   * @returns {boolean} `true` when the flag is enabled.
   */
  isFlagOn(flag: string): boolean {
    return this.toggled.includes(flag);
  }

  /**
   * @description Runs the runnable demo, advancing through its steps.
   * @returns {void}
   */
  run(): void {
    if (!this.steps().length) return;
    this.running = true;
    this.step = 0;
  }

  /**
   * @description Advances the runnable demo to the next step.
   * @returns {void}
   */
  next(): void {
    const steps = this.steps();
    if (this.step >= steps.length - 1) {
      this.running = false;
      return;
    }
    this.step += 1;
  }

  /**
   * @description Resets the runnable demo to its initial state.
   * @returns {void}
   */
  reset(): void {
    this.running = false;
    this.step = -1;
  }

  /**
   * @description The generated code preview of the current switch demo state.
   * @returns {string} A snippet reflecting the selected option.
   */
  preview(): string {
    const option = this.selected || this.options()[0] || '';
    if (this.has('renderers')) {
      return `<ngx-decaf-model-renderer\n  [renderer]="'${option}'"\n  [model]="${this.model() || 'profile'}"\n/>`;
    }
    if (this.has('roles')) {
      const rules = this.list('rules');
      return rules.length
        ? `@authorize(${JSON.stringify(rules)})\nclass ${this.model() || 'Resource'} {}`
        : `@authorize("${option}")\nclass ${this.model() || 'Resource'} {}`;
    }
    if (this.kind === 'decoration') {
      return `@component({\n  flavour: "${option}"\n})\nclass Widget extends Model {}`;
    }
    return `const repo = Repository.forModel(${this.model() || 'User'}, {\n  adapter: "${option}"\n});\nawait repo.create(user);`;
  }

  /**
   * @description The generated form preview of the model-centric demo.
   * @returns {string} The CRUD form markup for the configured model.
   */
  modelPreview(): string {
    const model = this.model() || 'Model';
    const list = this.listTag() || 'ngx-decaf-crud-form';
    const inner = this.tags()
      .map((tag) => `  <${tag} />`)
      .join('\n');
    return `<${list} [model]="${model}">\n${inner}\n</${list}>`;
  }

  /**
   * @description The simulated outcome of the guard demo for the selected role.
   * @returns {string} `allow` or `block`.
   */
  guardOutcome(): string {
    const rules = this.list('rules');
    if (this.selected === 'admin') return 'allow';
    if (this.selected === 'user') return rules.includes('allowIf') ? 'allow' : 'block';
    return rules.includes('allowIf') && !rules.includes('blockIf') ? 'allow' : 'block';
  }

  /**
   * @description The HTTP method generated for a CRUD operation.
   * @param {string} operation - The repository operation name.
   * @returns {string} The matching HTTP method.
   * @private
   */
  private httpMethod(operation: string): string {
    if (/^(create|createAll|save)$/i.test(operation)) return 'POST';
    if (/^(update|updateAll)$/i.test(operation)) return 'PUT';
    if (/^(delete|deleteAll)$/i.test(operation)) return 'DELETE';
    return 'GET';
  }

  /**
   * @description The generated HTTP routes of the route explorer.
   * @returns {string[]} The generated HTTP routes.
   */
  routes(): string[] {
    const model = (this.model() || 'Resource').toLowerCase();
    return this.surfaces().map((operation) => `${this.httpMethod(operation)} /${model}/${operation}`);
  }

  /**
   * @description The simulated query of the query playground.
   * @returns {string} The generated repository query.
   */
  query(): string {
    const helper = this.selected || this.helpers()[0] || 'findBy';
    const model = this.model() || 'User';
    return `repo.${helper}({ email: "dev@decaf.ts" }); // ${model}`;
  }

  /**
   * @description Whether the entered value is valid for the validation demo.
   * @returns {boolean} `true` when the field looks valid.
   */
  isValid(): boolean {
    const field = this.selected || this.fields()[0] || '';
    if (field.includes('email')) return /.+@.+\..+/.test(this.value);
    if (field.includes('password')) return this.value.length >= 8;
    if (field.includes('slug')) return /^[a-z0-9-]+$/.test(this.value);
    return this.value.trim().length > 0;
  }

  /**
   * @description The simulated cipher text of the encryption demo.
   * @returns {string} The base64-ish cipher preview.
   */
  cipher(): string {
    if (!this.value) return '';
    const algorithm = typeof this.parsed['algorithm'] === 'string' ? (this.parsed['algorithm'] as string) : 'AES-GCM';
    return `${algorithm}:${btoa(unescape(encodeURIComponent(this.value))).slice(0, 40)}…`;
  }
}
