Blockly.Blocks['logic_blocks'] = {
  init: function () {
    this.appendValueInput('input_1')
      .setCheck(null)
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('input1');
    this.appendDummyInput().appendField(
      new Blockly.FieldDropdown([
        ['AND', 'and'],
        ['NAND', 'nand'],
        ['OR', 'or'],
        ['NOR', 'nor'],
        ['XOR', 'xor'],
        ['XNOR', 'xnor'],
      ]),
      'gate'
    );
    this.appendValueInput('input_2')
      .setCheck(null)
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('input2');
    this.setInputsInline(false);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['not_block'] = {
  init: function () {
    this.appendValueInput('NAME').setCheck(null).appendField('NOT');
    this.setOutput(true, null);
    this.setColour(170);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['input_1'] = {
  init: function () {
    this.appendDummyInput().appendField('One');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};
Blockly.Blocks['input_0'] = {
  init: function () {
    this.appendDummyInput().appendField('Zero');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['assign_block'] = {
  init: function () {
    this.appendValueInput('NAME')
      .setCheck(null)
      .appendField('Assign ')
      .appendField(new Blockly.FieldTextInput('output_var'), 'OUTPUT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(255);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['input_var'] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldTextInput('input_var'),
      'INPUT'
    );
    this.setOutput(true, null);
    this.setColour(105);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};
