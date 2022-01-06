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

goog.provide('Blockly.Verilog.port_declarations');

goog.require('Blockly.Verilog');

Blockly.Verilog['module_block'] = function(block) {
    var text_module_name = block.getFieldValue('module_name');
    var statements_module_content = Blockly.Verilog.statementToCode(block, 'module_content');
    // TODO: Assemble Verilog into code variable.
    var code = 'module ' + text_module_name + '<br />' + '<br />' + 'end module' ;
    return code;
  };