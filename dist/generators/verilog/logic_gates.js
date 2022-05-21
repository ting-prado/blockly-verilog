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

goog.provide('Blockly.Verilog.logic_gates');

goog.require('Blockly.Verilog');

Blockly.Verilog['not_block'] = function (block) {
  var value_name = Blockly.Verilog.valueToCode(
    block,
    'NAME',
    Blockly.Verilog.ORDER_ATOMIC
  );
  // TODO: Assemble Verilog into code variable.
  var code = `~${value_name}`;
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Verilog.ORDER_NONE];
};

Blockly.Verilog['logic_blocks'] = function (block) {
  var value_input_1 = Blockly.Verilog.valueToCode(
    block,
    'input_1',
    Blockly.Verilog.ORDER_ATOMIC
  );
  var dropdown_gate = block.getFieldValue('gate');
  var value_input_2 = Blockly.Verilog.valueToCode(
    block,
    'input_2',
    Blockly.Verilog.ORDER_ATOMIC
  );

  var code;

  switch (dropdown_gate) {
    case 'and':
      code = `${value_input_1} & ${value_input_2}`;
      break;
    case 'nand':
      code = `~(${value_input_1} & ${value_input_2})`;
      break;
    case 'or':
      code = `${value_input_1} | ${value_input_2}`;
      break;
    case 'nor':
      code = `~(${value_input_1} | ${value_input_2})`;
      break;
    case 'xor':
      code = `${value_input_1} ^ ${value_input_2}`;
      break;
    case 'xnor':
      code = `~(${value_input_1} ^ ${value_input_2})`;
      break;
  }
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Verilog.ORDER_NONE];
};
