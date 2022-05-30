/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Verilog for logic blocks.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Verilog.variables');

goog.require('Blockly.Verilog');

Blockly.Verilog['assign_block'] = function (block) {
  var dropdown_output = block.getFieldValue('OUTPUT');
  var value_name = Blockly.Verilog.valueToCode(
    block,
    'NAME',
    Blockly.Verilog.ORDER_ATOMIC
  );
  // TODO: Assemble Verilog into code variable.
  var code = `assign ${dropdown_output} = ${value_name};\n`;
  if (
    block.getSurroundParent() !== null &&
    block.getSurroundParent().type == 'modules_defnoreturn' &&
    dropdown_output != 'INITIAL'
  ) {
    return code;
  } else return '';
};

Blockly.Verilog['input_var'] = function (block) {
  var dropdown_input = block.getFieldValue('INPUT');
  // TODO: Assemble Verilog into code variable.
  var code = dropdown_input;
  // TODO: Change ORDER_NONE to the correct strength.
  if (block.getSurroundParent() !== null && dropdown_input != 'INITIAL') {
    return [code, Blockly.Verilog.ORDER_ATOMIC];
  } else return ['', Blockly.Verilog.ORDER_ATOMIC];
};
