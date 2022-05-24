/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.custom_blocks');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.Warning');

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
    this.setOnChange(function (changeEvent) {
      if (
        this.getRootBlock().type == 'modules_defnoreturn' &&
        this.getInput('NAME').connection.targetBlock()
      ) {
        let modBlock = this.getRootBlock();
        let params = modBlock.getVars();
        let value = this.getFieldValue('OUTPUT');
        let instantiated = false;

        params.forEach((param) => {
          if (param == value) {
            instantiated = true;
          }
        });

        if (instantiated) {
          this.setWarningText(null);
        } else {
          this.setWarningText('This variable is not defined in this module');
        }
      } else if (this.getRootBlock().type != 'modules_defnoreturn') {
        this.setWarningText('This block should be inside a module block');
      } else {
        this.setWarningText('This block should have an input.');
      }
    });
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
