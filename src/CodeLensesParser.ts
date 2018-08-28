declare global {
  interface Window {
    monaco: any;
  }
}
const types = ['current', 'incoming', 'both'];
enum titles {
  current = 'Accept Current Change',
  incoming = 'Accept Incoming Change',
  both = 'Accept Both Changes'
}

const getContent = (model: any, content: any) => {
  if(content && content.length > 1) {
    return model.getValueInRange(content[0]) + '\n' + model.getValueInRange(content[1]);
  }
  return model.getValueInRange(content);
}

export default function (editor: any, model: any, conflicts: any) {

  let codeLenses = [];
  var commandId = editor.addCommand(0, function (ctx: any, args: any) {
    // services available in `ctx`
    let model;
    switch (args.type) {
      case 'current':
        model = editor.getModel();
        model.pushEditOperations([new window.monaco.Selection(args.range.startLineNumber, 1, args.range.startLineNumber, 1)], [{
          range: args.range,
          text: args.content
        }]);
        break;
      case 'incoming':
        model = editor.getModel();
        model.pushEditOperations([new window.monaco.Selection(args.range.startLineNumber, 1, args.range.startLineNumber, 1)], [{
          range: args.range,
          text: args.content
        }]);
        break;
      case 'both':
      model = editor.getModel();
        model.pushEditOperations([new window.monaco.Selection(args.range.startLineNumber, 1, args.range.startLineNumber, 1)], [{
          range: args.range,
          text: args.content
        }]);
        break;
      default:
        break;
    }

  }, '');

  for(let i in conflicts) {
    let obj: any = null;
    for(let j in conflicts[i]) {
      if (types.indexOf(j) === -1) break;
      obj = {range: conflicts[i].range};
      obj.command = {
        id: commandId,
        title: titles[j],
        arguments: {
          type: j,
          content: getContent(model, conflicts[i][j].content),
          range: conflicts[i].range
        }
      }
      codeLenses.push(obj);
    }
  }



  return codeLenses;
}