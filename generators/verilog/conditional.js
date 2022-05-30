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

goog.provide('Blockly.Verilog.conditional');

goog.require('Blockly.Verilog');

Blockly.Verilog['conditional_block'] = function (block) {
  var text_condition = block.getFieldValue('CONDITION');
  var value_then = Blockly.Verilog.valueToCode(
    block,
    'THEN',
    Blockly.Verilog.ORDER_ATOMIC
  );
  var value_else = Blockly.Verilog.valueToCode(
    block,
    'ELSE',
    Blockly.Verilog.ORDER_ATOMIC
  );
  // TODO: Assemble Verilog into code variable.
  var code = `(${text_condition}) ? ${value_then} : ${value_else}`;
  // TODO: Change ORDER_NONE to the correct strength.
  if (block.getSurroundParent() !== null) {
    return [code, Blockly.Verilog.ORDER_NONE];
  } else return ['', Blockly.Verilog.ORDER_NONE];
};
