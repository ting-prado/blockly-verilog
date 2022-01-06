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

goog.provide('Blockly.Verilog.values');

goog.require('Blockly.Verilog');

Blockly.Verilog['input_1'] = function(block) {
  // TODO: Assemble Verilog into code variable.
  var code = '1';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Verilog.ORDER_NONE];
};

Blockly.Verilog['input_0'] = function(block) {
  // TODO: Assemble Verilog into code variable.
  var code = '0';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Verilog.ORDER_NONE];
};