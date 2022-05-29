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
    this.appendDummyInput()
      .appendField(
        new Blockly.FieldDropdown([
          ['AND', 'and'],
          ['NAND', 'nand'],
          ['OR', 'or'],
          ['NOR', 'nor'],
          ['XOR', 'xor'],
          ['XNOR', 'xnor'],
        ]),
        'gate'
      )
      .setAlign(Blockly.ALIGN_RIGHT);
    this.appendValueInput('input_2')
      .setCheck(null)
      .setAlign(Blockly.ALIGN_RIGHT)
      .appendField('input2');
    this.setInputsInline(false);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setOnChange(function (changeEvent) {
      if (
        this.getParent() &&
        this.getInput('input_1').connection.targetBlock() &&
        this.getInput('input_2').connection.targetBlock()
      ) {
        this.setWarningText(null);
      } else if (!this.getParent()) {
        this.setWarningText('This block should be connected to a setter block');
      } else {
        this.setWarningText('This block should have two inputs');
      }
    });
  },
};

Blockly.Blocks['not_block'] = {
  init: function () {
    this.appendValueInput('NAME').setCheck(null).appendField('NOT');
    this.setOutput(true, null);
    this.setColour(170);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setOnChange(function (changeEvent) {
      if (this.getParent() && this.getInput('NAME').connection.targetBlock()) {
        this.setWarningText(null);
      } else {
        if (!this.getParent()) {
          this.setWarningText(
            'This block should be connected to a setter block'
          );
        } else {
          this.setWarningText('This block should have an input');
        }
      }
    });
  },
};

Blockly.Blocks['input_1'] = {
  init: function () {
    this.appendDummyInput().appendField('One');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setOnChange(function (changeEvent) {
      if (this.getParent()) {
        this.setWarningText(null);
      } else {
        this.setWarningText('This block should be connected to a setter block');
      }
    });
  },
};
Blockly.Blocks['input_0'] = {
  init: function () {
    this.appendDummyInput().appendField('Zero');
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setOnChange(function (changeEvent) {
      if (this.getParent()) {
        this.setWarningText(null);
      } else {
        this.setWarningText('This block should be connected to a setter block');
      }
    });
  },
};

Blockly.Blocks['assign_block'] = {
  init: function () {
    this.appendValueInput('NAME')
      .setCheck(null)
      .appendField('Assign ')
      .appendField(new Blockly.FieldDropdown(this.generateOptions), 'OUTPUT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(255);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setOnChange(function (changeEvent) {
      this.getField('OUTPUT').markDirty();
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

        if (instantiated || value == 'INITIAL') {
          this.setWarningText(null);
        } else {
          this.setWarningText('This variable is not defined in this module');
        }
      } else if (this.getRootBlock().type != 'modules_defnoreturn') {
        this.setWarningText('This block should be inside a module block');
      } else {
        this.setWarningText('This block should have an input');
      }
    });
  },

  generateOptions: function () {
    let options = [['--------', 'INITIAL']];
    let block = this.getSourceBlock();
    if (block) {
      if (block.getParent()) {
        let curBlock = block.getParent();
        while (curBlock.getParent() !== null) {
          curBlock = curBlock.getParent();
        }
        if (curBlock.type == 'modules_defnoreturn') {
          let params = curBlock.getVars();
          for (let i = 0; i < params.length; i++) {
            options.push([params[i], params[i]]);
          }
        }
      }
    }
    return options;
  },
};

Blockly.Blocks['input_var'] = {
  init: function () {
    this.appendDummyInput()
      .appendField(new Blockly.FieldDropdown(this.generateOptions), 'INPUT')
      .setAlign(Blockly.ALIGN_RIGHT);
    this.setOutput(true, null);
    this.setColour(105);
    this.setTooltip('');
    this.setHelpUrl('');
    this.setOnChange(function (changeEvent) {
      this.getField('INPUT').markDirty();
      if (this.getParent() == null) {
        this.setWarningText('This block should be connected to a setter block');
      } else {
        let parentBlock = this.getParent();
        if (parentBlock.type !== 'assign_block') {
          let curBlock = parentBlock;
          while (curBlock.getParent() !== null) {
            curBlock = curBlock.getParent();
          }
          if (curBlock.type == 'modules_defnoreturn') {
            let params = curBlock.getVars();
            let value = this.getFieldValue('INPUT');
            let instantiated = false;

            params.forEach((param) => {
              if (param == value) {
                instantiated = true;
              }
            });
            if (instantiated || value == 'INITIAL') {
              this.setWarningText(null);
            } else {
              this.setWarningText(
                'This variable is not defined in this module'
              );
            }
          } else {
            this.setWarningText(null);
          }
        } else {
          if (parentBlock.getParent() !== null) {
            let modBlock = parentBlock.getRootBlock();
            let params = modBlock.getVars();
            let value = this.getFieldValue('INPUT');
            let instantiated = false;

            params.forEach((param) => {
              if (param == value) {
                instantiated = true;
              }
            });
            if (instantiated || value == 'INITIAL') {
              this.setWarningText(null);
            } else {
              this.setWarningText(
                'This variable is not defined in this module'
              );
            }
          } else {
            this.setWarningText(null);
          }
        }
      }
    });
  },

  generateOptions: function () {
    let options = [['--------', 'INITIAL']];
    let block = this.getSourceBlock();
    if (block) {
      if (block.getParent()) {
        let curBlock = block.getParent();
        while (curBlock.getParent() !== null) {
          curBlock = curBlock.getParent();
        }
        if (curBlock.type == 'modules_defnoreturn') {
          let params = curBlock.getVars();
          for (let i = 0; i < params.length; i++) {
            options.push([params[i], params[i]]);
          }
        }
      }
    }
    return options;
  },
};
