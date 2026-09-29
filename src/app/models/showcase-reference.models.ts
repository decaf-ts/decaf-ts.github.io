import { pk } from '@decaf-ts/core';
import { OperationKeys } from '@decaf-ts/db-decorators';
import {
  Model,
  ModelArg,
  date,
  email,
  max,
  maxlength,
  min,
  minlength,
  model,
  password,
  required,
  url,
} from '@decaf-ts/decorator-validation';
import {
  HTML5InputTypes,
  hideOn,
  uielement,
  uilistmodel,
  uilistprop,
  uimodel,
} from '@decaf-ts/ui-decorators';

/**
 * @module app/models/showcase-reference.models
 * @description Fully decorated reference models rendered live on the showcase
 * highlight detail pages through the `@decaf-ts/for-angular` rendering engine. The
 * models are self-contained so the live examples need no backend: the engine reads
 * their decorator metadata and renders real decaf forms and lists.
 */

/**
 * @description The single fully decorated reference model of the model-centric
 * showcase highlight.
 * @summary Demonstrates every decoration category the suite ships in one class:
 * identity, required/optional fields, length and range validators, e-mail, url and
 * password validators, a date field with a format, select/radio/checkbox element
 * types and operation-aware visibility. Rendered live by the model builder preview.
 * @class
 * @param {Partial<ShowcaseModelCentricModel>} args - Initial values.
 * @example
 * const model = new ShowcaseModelCentricModel({ name: 'Ada Lovelace' });
 */
@uimodel('ngx-decaf-crud-form', { cols: 2, rows: 1 })
@model()
export class ShowcaseModelCentricModel extends Model {
  /**
   * @description Numeric primary key, bounded between 1 and 999.
   */
  @pk({ type: Number })
  @min(1)
  @max(999)
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.id.label',
    placeholder: 'showcase.model.id.placeholder',
  })
  id!: number;

  /**
   * @description Required display name, at least five characters long.
   */
  @required()
  @minlength(5)
  @maxlength(64)
  @uilistprop('title')
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.name.label',
    placeholder: 'showcase.model.name.placeholder',
  })
  name!: string;

  /**
   * @description Required e-mail address validated by the `@email` decorator.
   */
  @required()
  @email()
  @uilistprop('description')
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.email.label',
    placeholder: 'showcase.model.email.placeholder',
  })
  email!: string;

  /**
   * @description Optional website validated by the `@url` decorator.
   */
  @url()
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.website.label',
    placeholder: 'showcase.model.website.placeholder',
  })
  website!: string;

  /**
   * @description Required password paired with the `@password` validator.
   */
  @required()
  @password()
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.password.label',
    placeholder: 'showcase.model.password.placeholder',
  })
  password!: string;

  /**
   * @description Radio group rendered by the crud-field element type.
   */
  @required()
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.gender.label',
    type: 'radio',
    options: [
      { value: 'male', text: 'male' },
      { value: 'female', text: 'female' },
    ],
  })
  gender!: string;

  /**
   * @description Select group rendered by the crud-field element type.
   */
  @required()
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.contact.label',
    type: HTML5InputTypes.SELECT,
    options: [
      { value: 'morning', text: 'morning' },
      { value: 'afternoon', text: 'afternoon' },
      { value: 'evening', text: 'evening' },
    ],
  })
  contact!: string;

  /**
   * @description Date field with an explicit format.
   */
  @date('yyyy-MM-dd')
  @uielement('ngx-decaf-crud-field', { label: 'showcase.model.birthdate.label' })
  birthdate!: Date;

  /**
   * @description Operation-aware checkbox, hidden on delete/update/read.
   */
  @required()
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.model.agree.label',
    type: 'checkbox',
  })
  @hideOn(OperationKeys.DELETE, OperationKeys.UPDATE, OperationKeys.READ)
  agree!: string;

  constructor(arg?: ModelArg<ShowcaseModelCentricModel>) {
    super(arg);
  }
}

/**
 * @description Reference model of the cross-UI showcase highlight.
 * @summary Decorated with a crud form and a list item so the live example renders
 * both a decaf list and a decaf crud form for the same model.
 * @class
 * @param {Partial<ShowcaseCrossUiModel>} args - Initial values.
 * @example
 * const item = new ShowcaseCrossUiModel({ name: 'Graph engine' });
 */
@uimodel('ngx-decaf-crud-form', { cols: 2, rows: 1 })
@uilistmodel('ngx-decaf-list-item', { icon: 'ti-cube' })
@model()
export class ShowcaseCrossUiModel extends Model {
  /**
   * @description String primary key.
   */
  @pk({ type: String, generated: false })
  @uilistprop('title')
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.cross_ui.name.label',
    placeholder: 'showcase.cross_ui.name.placeholder',
  })
  name!: string;

  /**
   * @description Required summary rendered as the list item description.
   */
  @required()
  @minlength(4)
  @uilistprop('description')
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.cross_ui.summary.label',
    placeholder: 'showcase.cross_ui.summary.placeholder',
  })
  summary!: string;

  /**
   * @description Optional category select.
   */
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.cross_ui.category.label',
    type: HTML5InputTypes.SELECT,
    options: [
      { value: 'core', text: 'core' },
      { value: 'ui', text: 'ui' },
      { value: 'backend', text: 'backend' },
    ],
  })
  category!: string;

  constructor(arg?: ModelArg<ShowcaseCrossUiModel>) {
    super(arg);
  }
}

/**
 * @description Reference model of the validation-by-decoration showcase highlight.
 * @summary Carries the validators the live form exercises: required, min/max,
 * minlength/maxlength, e-mail, url, password and pattern, so the rendered form
 * reacts to invalid input through the decorator-driven validation.
 * @class
 * @param {Partial<ShowcaseValidationModel>} args - Initial values.
 * @example
 * const model = new ShowcaseValidationModel({ name: 'ab' });
 */
@uimodel('ngx-decaf-crud-form', { cols: 1, rows: 1 })
@model()
export class ShowcaseValidationModel extends Model {
  /**
   * @description Required name with a minimum length of five characters.
   */
  @required()
  @minlength(5)
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.validation.name.label',
    placeholder: 'showcase.validation.name.placeholder',
  })
  name!: string;

  /**
   * @description Required e-mail validated by the `@email` decorator.
   */
  @required()
  @email()
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.validation.email.label',
    placeholder: 'showcase.validation.email.placeholder',
  })
  email!: string;

  /**
   * @description Required password validated by the `@password` decorator.
   */
  @required()
  @password()
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.validation.password.label',
    placeholder: 'showcase.validation.password.placeholder',
  })
  password!: string;

  /**
   * @description Numeric age bounded between 18 and 120.
   */
  @required()
  @min(18)
  @max(120)
  @uielement('ngx-decaf-crud-field', {
    label: 'showcase.validation.age.label',
    placeholder: 'showcase.validation.age.placeholder',
    type: HTML5InputTypes.NUMBER,
  })
  age!: number;

  constructor(arg?: ModelArg<ShowcaseValidationModel>) {
    super(arg);
  }
}
