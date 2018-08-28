const startHeaderMarker = '<<<<<<<';
const commonAncestorsMarker = '|||||||';
const splitterMarker = '=======';
const endFooterMarker = '>>>>>>>';

interface IRange {
  /**
   * Line number on which the range starts (starts at 1).
   */
  readonly startLineNumber: number;
  /**
   * Column on which the range starts in line `startLineNumber` (starts at 1).
   */
  readonly startColumn: number;
  /**
   * Line number on which the range ends.
   */
  readonly endLineNumber: number;
  /**
   * Column on which the range ends in line `endLineNumber`.
   */
  readonly endColumn: number;
}

interface TextLine {
  readonly text: string;
  readonly range: IRange;
  readonly lineNumber: number;
}

interface StartPos {

  startLineNumber: number;
  startColumn: number;
}

interface EndPos {

  endLineNumber: number;
  endColumn: number;
}

export default class MergeConflictParser {

  static scanDocument(model : any) {
    const linesContent = model.getLinesContent();
    let currentConflict: any = null;
    let line: TextLine = null;
    let currentConflicts = [];
    let completeDescriptors: any = [];
    linesContent.map((item: any, index: any) => {
      let range: IRange = {
        startLineNumber: index + 1,
        startColumn: model.getLineFirstNonWhitespaceColumn(index + 1),
        endLineNumber: index + 1,
        endColumn: model.getLineLastNonWhitespaceColumn(index + 1)
      }
      line = {
        text: item,
        lineNumber: index + 1,
        range
      }
      // Is this a start line? <<<<<<<
      if(line.text.startsWith(startHeaderMarker)) {
        if(currentConflict !== null) {
          currentConflict = null;
          return;
        }
        currentConflict = { startHeader: line, commonAncestors: [] };
      }
      // Are we within a conflict block and is this a common ancestors marker? |||||||
      else if(currentConflict && !currentConflict.splitter && line.text.startsWith(commonAncestorsMarker)) {
        currentConflict.commonAncestors.push(line);
      }
      // Are we within a conflict block and is this a splitter? =======
      else if (currentConflict && !currentConflict.splitter && line.text.startsWith(splitterMarker)) {
				currentConflict.splitter = line;
			}
			// Are we within a conflict block and is this a footer? >>>>>>>
			else if (currentConflict && line.text.startsWith(endFooterMarker)) {
				currentConflict.endFooter = line;

        let completeDescriptor = MergeConflictParser.scanItemToMergeConflictDescriptor(model, currentConflict);

        if(completeDescriptor !== null) {
          completeDescriptors.push(completeDescriptor);
        }

        currentConflict = null;
			}

    });

    return completeDescriptors;
  }

  static scanItemToMergeConflictDescriptor(model: any, scanned: any) {
		if (!scanned.startHeader || !scanned.splitter || !scanned.endFooter) {
			return null;
    }

    return {
      current: {
        header: scanned.startHeader.range,
        content: {...MergeConflictParser.moveForwardOnePos(model, scanned.startHeader.range), ...MergeConflictParser.shiftBackOnePos(model, scanned.splitter.range)},
        name: scanned.startHeader.text.substring(startHeaderMarker.length + 1)
      },
      incoming: {
        header: scanned.endFooter.range,
        content: {...MergeConflictParser.moveForwardOnePos(model, scanned.splitter.range), ...MergeConflictParser.shiftBackOnePos(model, scanned.endFooter.range)},
        name: scanned.endFooter.text.substring(endFooterMarker.length + 1)
      },
      both: {
        content: [{...MergeConflictParser.moveForwardOnePos(model, scanned.startHeader.range), ...MergeConflictParser.shiftBackOnePos(model, scanned.splitter.range)}, {...MergeConflictParser.moveForwardOnePos(model, scanned.splitter.range), ...MergeConflictParser.shiftBackOnePos(model, scanned.endFooter.range)}],
      },
      range: {
        ...MergeConflictParser.getStartPos(model, scanned.startHeader.range),
        ...MergeConflictParser.getEndPos(model, scanned.endFooter.range)
      }
    }
  }

  static shiftBackOnePos(model: any, pos: StartPos): EndPos {

    let column = pos.startColumn - 1;
    let lineNumber = pos.startLineNumber;
    // if there is no charactor, then back to previous row
    if(column === 0) {
      lineNumber --;
      column = model.getLineLastNonWhitespaceColumn(lineNumber);
    }

    return {
      endColumn: column,
      endLineNumber: lineNumber
    }
  }

  static moveForwardOnePos(model: any, pos: EndPos): StartPos {
    let column = pos.endColumn + 1;
    let lineNumber = pos.endLineNumber;
    // if there is no charactor, then back to previous row
    if(column > model.getLineLastNonWhitespaceColumn(lineNumber)) {
      lineNumber ++;
      column = 1;
    }

    return {
      startColumn: column,
      startLineNumber: lineNumber
    }
  }

  static getStartPos(model: any, range: IRange): StartPos {
    return {
      startColumn: range.startColumn,
      startLineNumber: range.startLineNumber
    }
  }

  static getEndPos(model: any, range: IRange): EndPos {
    return {
      endColumn: range.endColumn,
      endLineNumber: range.endLineNumber
    }
  }
}