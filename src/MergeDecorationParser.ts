const types = ['current', 'incoming', 'splitter'];

class MergeDecorationParser {

  static getColorDecorations(conflicts: any) {
    let decorations: any[] = [];

    for(let i in conflicts) {
      let decoration: any = null;
      for(let j in conflicts[i]) {
        if (types.indexOf(j) === -1 || j === 'both') continue;
        if (conflicts[i][j].header) {
          decoration = {range: this.getRange(conflicts[i][j].header)};
          decoration.options = {
            isWholeLine: true,
            className: `${j}header`,
            stickiness: 2
          }
        }
        decorations.push(decoration);
        if (conflicts[i][j].content) {
          decoration = {range: this.getRange(conflicts[i][j].content)};
          decoration.options = {
            isWholeLine: true,
            className: `${j}content`,
            stickiness: 2
          }
          decorations.push(decoration);
        }
      }
    }
    return decorations;
  }

  static getRange(range: any) {
    return {
      endColumn: 1,
      endLineNumber: range.endLineNumber,
      startColumn: 1,
      startLineNumber: range.startLineNumber
    }
  }

}

export default MergeDecorationParser;

// {
//   range: new window.monaco.Range(2,1,3,1),
//   options: {
//     isWholeLine: true,
//     className: 'myContentClass',
//   }
// }