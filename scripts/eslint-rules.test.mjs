import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ESLint, Linter } from 'eslint';
import tseslint from 'typescript-eslint';
import { multilineIf, namedReactTypes, namedTypePlacement } from './eslint-rules.mjs';

const linter = new Linter();
const config = [{
  files: ['**/*.{ts,tsx,mts,cts}'],
  languageOptions: { parser: tseslint.parser },
  plugins: { project: { rules: { 'multiline-if': multilineIf, 'named-react-types': namedReactTypes, 'type-placement': namedTypePlacement } } },
  rules: {
    'project/multiline-if': 'error',
    'project/named-react-types': 'error',
    'project/type-placement': 'error',
  },
}];
const verify = (code, filename = 'example.ts') => linter.verify(code, config, { filename });

test('every if and else branch must use a multiline braced block', () => {
  for (const code of [
    'if (value) run();',
    'if (value) { run(); }',
    'if (value)\n run(\n value\n );',
    'if (value) {\n run();\n} else { run(); }',
    'if (value) if (other) {\n run();\n}',
  ]) {
    assert.ok(verify(code).some(message => message.ruleId === 'project/multiline-if'));
  }
  assert.deepEqual(verify('if (value) {\n run();\n} else if (other) {\n run();\n} else {\n run();\n}'), []);
});

test('React type references require direct named imports, including namespace aliases', () => {
  for (const code of [
    'import type React from "react"; const handler: React.FormEventHandler = fn;',
    'import type * as R from "react"; const handler: R.FormEventHandler = fn;',
    'import type { default as R } from "react"; const handler: R.FormEventHandler = fn;',
    'import type React = require("react"); const handler: React.FormEventHandler = fn;',
    'import type R = require("react"); const handler: R.FormEventHandler = fn;',
    'import type View from "react"; const element: View.JSX.Element = value;',
    'const handler: React.FormEventHandler = fn;',
    'import React from "react"; import R = React; const handler: R.FormEventHandler = fn;',
    'import React from "react"; import R = React; import View = R; const handler: View.FormEventHandler = fn;',
    'import R = React; const handler: R.FormEventHandler = fn;',
  ]) {
    assert.equal(verify(code).filter(message => message.ruleId === 'project/named-react-types').length, 1);
  }
  assert.deepEqual(verify('declare namespace React { interface Value {} }\ndeclare const value: React.Value;', 'example.type.ts'), []);
  assert.ok(verify('import React from "react"; import R = React.JSX; const element: R.Element = value;')
    .some(message => message.ruleId === 'project/named-react-types'));
});

test('the actual configuration covers every JavaScript and TypeScript source extension', async () => {
  const eslint = new ESLint({ cwd: import.meta.dirname + '/..' });
  for (const extension of ['ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs']) {
    const effective = await eslint.calculateConfigForFile(`src/example.${extension}`);
    assert.equal(effective.linterOptions.noInlineConfig, true, extension);
    assert.equal(effective.rules['project/multiline-if'][0], 2, extension);
    assert.deepEqual(effective.rules['max-statements-per-line'], [2, { max: 1 }], extension);
    if (['ts', 'tsx', 'mts', 'cts'].includes(extension)) {
      assert.equal(effective.rules['project/type-placement'][0], 2, extension);
      assert.equal(effective.rules['project/named-react-types'][0], 2, extension);
      assert.ok(effective.languageOptions.parserOptions.project.length, extension);
    }
  }
});

test('inline directives cannot bypass mandatory rules or compress statements', () => {
  const enforced = [{ ...config[0], linterOptions: { noInlineConfig: true }, rules: {
    ...config[0].rules, 'max-statements-per-line': ['error', { max: 1 }],
  } }];
  const cases = [
    ['/* eslint-disable project/multiline-if */\nif (value) run();', 'project/multiline-if'],
    ['/* eslint-disable project/type-placement */\ntype Value = string;', 'project/type-placement'],
    ['/* eslint-disable project/named-react-types */\nconst handler: React.FormEventHandler = fn;', 'project/named-react-types'],
    ['/* eslint-disable max-statements-per-line */\nconst first = 1; const second = 2;', 'max-statements-per-line'],
  ];
  for (const [code, rule] of cases) {
    assert.ok(linter.verify(code, enforced, { filename: 'example.mts' }).some(message => message.ruleId === rule), rule);
  }
});

test('named JSX imports, global Intl types and runtime typeof members remain valid', () => {
  for (const code of [
    'import type { FormEventHandler } from "react"; const handler: FormEventHandler = fn;',
    'import type { JSX } from "react"; const element: JSX.Element = value;',
    'import type { JSX as React } from "react"; const element: React.Element = value;',
    'import type { JSX } from "react"; import R = JSX; const element: R.Element = value;',
    'import I = Intl; const format: I.DateTimeFormatOptions = {};',
    'import type React from "other-library"; const value: React.Member = input;',
    'const format: Intl.DateTimeFormatOptions = {};',
    'import axios from "axios"; const config: Parameters<typeof axios.create>[0] = {};',
  ]) {
    assert.deepEqual(verify(code), []);
  }
});

test('type placement covers aliases, interfaces and ambient augmentation without a baseline', () => {
  for (const code of ['type Value = string;', 'export interface Value {}', 'export default interface Value {}', 'declare global { interface Window { value: string } }']) {
    assert.ok(verify(code).some(message => message.ruleId === 'project/type-placement'));
    assert.deepEqual(verify(code, 'example.type.ts'), []);
    assert.ok(verify(code, 'example.types.ts').some(message => message.ruleId === 'project/type-placement'));
  }
  assert.deepEqual(verify('export type { Value } from "./example.type";'), []);
});

test('type sidecars cannot introduce runtime imports, values or namespace initialization', () => {
  for (const code of ['export const value = 1;', 'import value from "library";', 'namespace Value { export const value = 1; }']) {
    assert.ok(verify(code, 'example.type.ts').some(message => message.messageId === 'runtime'));
  }
  assert.deepEqual(verify('import type { ReactNode } from "react";\nexport type Value = ReactNode;', 'example.type.ts'), []);
});
