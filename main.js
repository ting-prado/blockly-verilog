/* TODO: Change toolbox XML ID if necessary. Can export toolbox XML from Workspace Factory. */
const toolbox = document.getElementById('toolbox');

const options = {
  toolbox: toolbox,
  collapse: true,
  comments: true,
  disable: true,
  maxBlocks: Infinity,
  trashcan: true,
  horizontalLayout: false,
  toolboxPosition: 'start',
  css: true,
  media: 'https://blockly-demo.appspot.com/static/media/',
  rtl: false,
  scrollbars: true,
  sounds: true,
  oneBasedIndex: true,
  grid: {
    spacing: 20,
    length: 1,
    colour: '#888',
    snap: false,
  },
  zoom: {
    controls: true,
    wheel: true,
    startScale: 1,
    maxScale: 5,
    minScale: 0.3,
    scaleSpeed: 1.2,
  },
};

/* Inject your workspace */
var demoWorkspace = Blockly.inject('blocklyDiv', options);

const showCode = () => {
  const codeOutput = document.querySelector('#codeOutput');
  Blockly.Verilog.INFINITE_LOOP_TRAP = null;
  var code = Blockly.Verilog.workspaceToCode(demoWorkspace);
  codeOutput.innerHTML = code;
};

demoWorkspace.addChangeListener(showCode);
