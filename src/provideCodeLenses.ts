import './MergeConflictParser'
import MergeConflictParser from './MergeConflictParser';
import CodeLensesParser from './CodeLensesParser'

declare global {
  interface Window { monaco: any; }
}

export default function (model: any, editor: any) {
  let conflicts = MergeConflictParser.scanDocument(model);
  let codeLenses = CodeLensesParser(editor, model, conflicts);

  return codeLenses;
}