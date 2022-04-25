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
      .appendField(
        new Blockly.FieldDropdown([
          ['option', 'OPTIONNAME'],
          ['option', 'OPTIONNAME'],
          ['option', 'OPTIONNAME'],
        ]),
        'VARIABLES'
      );
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(255);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['module_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('Create module:')
      .appendField(new Blockly.FieldTextInput('design_name'), 'module_name');
    this.appendDummyInput().appendField('Assign ports:');
    this.appendStatementInput('port_list').setCheck('Ports');
    this.appendDummyInput().appendField('Module content:');
    this.appendStatementInput('module_content').setCheck(null);
    this.appendDummyInput().appendField('end module');
    this.setInputsInline(false);
    this.setColour(300);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['set_block'] = {
  init: function () {
    this.appendDummyInput()
      .appendField('set')
      .appendField(new Blockly.FieldVariable('PORT_NAME'), 'NAME')
      .appendField('as')
      .appendField(
        new Blockly.FieldDropdown([
          ['INPUT', 'new_input'],
          ['OUTPUT', 'new_output'],
        ]),
        'port_types'
      );
    this.setPreviousStatement(true, 'Ports');
    this.setNextStatement(true, 'Ports');
    this.setColour(240);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};

Blockly.Blocks['input_var'] = {
  init: function () {
    this.appendDummyInput().appendField(
      new Blockly.FieldVariable('INPUT'),
      'input_var'
    );
    this.setOutput(true, null);
    this.setColour(105);
    this.setTooltip('');
    this.setHelpUrl('');
  },
};
