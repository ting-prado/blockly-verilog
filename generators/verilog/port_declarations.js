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

Blockly.Verilog['module_block'] = function (block) {
  var text_module_name = block.getFieldValue('module_name');
  var statements_port_list = Blockly.Verilog.statementToCode(
    block,
    'port_list'
  );

  var statements_module_content = Blockly.Verilog.statementToCode(
    block,
    'module_content'
  );

  // TODO: Assemble Verilog into code variable.
  var mod_name = text_module_name.split(/[^a-zA-Z0-9]+/);
  let inputs = customMod.getPorts();

  var code =
    'module ' +
    mod_name.join('_') +
    '( ' +
    inputs +
    ' ):' +
    '<br />' +
    '<br />' +
    statements_module_content +
    '<br />' +
    'end module';

  return code;
};

Blockly.Verilog['set_block'] = function (block) {
  var dropdown_port_types = block.getFieldValue('port_types');

  var variable_name = Blockly.Verilog.nameDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.Variables.NAME_TYPE
  );

  var modified_name = variable_name.split(/[^a-zA-Z0-9]+/).join('_');

  customMod.addVariable(modified_name, block.id, dropdown_port_types.slice(4));

  // TODO: Assemble Verilog into code variable.

  // var code =
  //   dropdown_port_types.trim().replace(/ /g, '_').slice(4) +
  //   ' ' +
  //   variable_name.split(/[^a-zA-Z0-9]+/).join('_');
  // if (
  //   block.previousConnection.targetConnection.sourceBlock_.type == 'set_block'
  // ) {
  //   code =
  //     ',' +
  //     '<br />' +
  //     '&emsp;' +
  //     '&emsp;' +
  //     '&emsp;' +
  //     '&emsp;' +
  //     '&emsp;' +
  //     '&emsp;' +
  //     '&emsp;' +
  //     code;
  // }
  return '';
};
