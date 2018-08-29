import * as monaco from 'monaco-editor';
import provideCodeLenses from './provideCodeLenses';

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.bundle.js';
    }
    if (label === 'css') {
      return './css.worker.bundle.js';
    }
    if (label === 'html') {
      return './html.worker.bundle.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.bundle.js';
    }
    return './editor.worker.bundle.js';
  }
}

let editor = monaco.editor.create(document.getElementById('container'), {
  value: [
  'Here are lines that are either unchanged from the common',
  'ancestor, or cleanly resolved because only one side changed.',
  '<<<<<<< yours:sample.txt',
  'Conflict resolution is hard;',
  'let\'s go shopping.',
  'Conflict resolution is hard.',
  '=======',
  'Git makes conflict resolution easy.',
  '>>>>>>> theirs:sample.txt',
  'And here is another line that is cleanly resolved or unmodified.',
  ].join('\n'),
  language: 'json',
});



monaco.languages.registerCodeLensProvider('json', {

  provideCodeLenses: (model, token) => {
    return provideCodeLenses(model, editor);
  },
  resolveCodeLens: function (model, codeLens, token) {
    return codeLens;
  }
});
