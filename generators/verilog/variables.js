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

Blockly.Verilog['output_block'] = function(block) {
    var variable_output = Blockly.Verilog.nameDB_.getName(block.getFieldValue('output'), Blockly.Variables.NAME_TYPE);
    var value_name = Blockly.Verilog.valueToCode(block, 'NAME', Blockly.Verilog.ORDER_ATOMIC);
    // TODO: Assemble Verilog into code variable.
    var code = variable_output + ' = ' + value_name + ';';
    return code;
};

Blockly.Verilog['input_var'] = function(block) {
    var variable_input_var = Blockly.Verilog.nameDB_.getName(block.getFieldValue('input_var'), Blockly.Variables.NAME_TYPE);
    // TODO: Assemble Verilog into code variable.
    var code = variable_input_var;
    // TODO: Change ORDER_NONE to the correct strength.
    return [code, Blockly.Verilog.ORDER_NONE];
  };