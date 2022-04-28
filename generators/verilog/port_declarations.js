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
  var mod_name = text_module_name.split(/[^a-zA-Z0-9]+/).join('_');
  let newModule = Module(mod_name, block.id);
  customMod.addModule(newModule);
  const connected = statements_port_list.trim().split(' ');
  let vars = customMod.displayPorts(block.id, connected);

  var code = `module ${mod_name} ( ${vars} ): \n\n ${statements_module_content}\nend module\n\n`;

  return code;
};

Blockly.Verilog['set_block'] = function (block) {
  var dropdown_port_types = block.getFieldValue('port_types');

  var variable_name = block.getFieldValue('PORT');

  console.log(typeof variable_name);
  var modified_name = variable_name.split(/[^a-zA-Z0-9]+/).join('_');
  let modId;

  if (
    block.getSurroundParent() !== null &&
    block.getSurroundParent().type == 'module_block'
  ) {
    modId = block.getSurroundParent().id;
    customMod.addVariable(
      modId,
      modified_name,
      block.id,
      dropdown_port_types.slice(4)
    );
  }
  // TODO: Assemble Verilog into code variable.
  let code = modified_name + ' ';

  return code;
};
