import './MergeConflictParser'
import MergeConflictParser from './MergeConflictParser';
import CodeLensesParser from './CodeLensesParser'
import MergeDecorationParser from './MergeDecorationParser';

declare global {
  interface Window { monaco: any; }
}
let decorations: any[] = [];

export default function (model: any, editor: any) {
  let conflicts = MergeConflictParser.scanDocument(model);
  let bgColorDecorations = MergeDecorationParser.getColorDecorations(conflicts);
  console.log('bgColorDecorations', bgColorDecorations);
  decorations = editor.deltaDecorations(decorations, bgColorDecorations);
  
  let codeLenses = CodeLensesParser(editor, model, conflicts);
            
  return codeLenses;
}