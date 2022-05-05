/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Generating Verilog for procedure blocks.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Verilog.modules');

goog.require('Blockly.Verilog');

Blockly.Verilog['modules_defnoreturn'] = function (block) {
  // Define a procedure with a return value.
  var modName = Blockly.Verilog.nameDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.PROCEDURE_CATEGORY_NAME
  );
  var xfix1 = '';
  if (Blockly.Verilog.STATEMENT_PREFIX) {
    xfix1 += Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_PREFIX, block);
  }
  if (Blockly.Verilog.STATEMENT_SUFFIX) {
    xfix1 += Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_SUFFIX, block);
  }
  if (xfix1) {
    xfix1 = Blockly.Verilog.prefixLines(xfix1, Blockly.Verilog.INDENT);
  }
  var loopTrap = '';
  if (Blockly.Verilog.INFINITE_LOOP_TRAP) {
    loopTrap = Blockly.Verilog.prefixLines(
      Blockly.Verilog.injectId(Blockly.Verilog.INFINITE_LOOP_TRAP, block),
      Blockly.Verilog.INDENT
    );
  }
  var branch = Blockly.Verilog.statementToCode(block, 'STACK');
  var returnValue =
    Blockly.Verilog.valueToCode(block, 'RETURN', Blockly.Verilog.ORDER_NONE) ||
    '';
  var xfix2 = '';
  if (branch && returnValue) {
    // After executing the function body, revisit this block for the return.
    xfix2 = xfix1;
  }
  if (returnValue) {
    returnValue = Blockly.Verilog.INDENT + 'return ' + returnValue + ';\n';
  }

  var args = [];
  var variables = block.getVars();
  for (var i = 0; i < variables.length; i++) {
    args[i] = Blockly.Verilog.nameDB_.getName(
      variables[i],
      Blockly.VARIABLE_CATEGORY_NAME
    );
  }
  // if (
  //   block.argumentVarModels_.length > 0 &&
  //   block.mutator.getWorkspace() !== null
  // ) {
  //   let obj = block.mutator.getWorkspace().blockDB_;
  //   for (const item in obj) {
  //     if (obj[item].type == 'modules_mutatorarg') {
  //       let mutblock = obj[item];
  //       console.log(
  //         `${mutblock.getFieldValue('NAME')} as ${mutblock.getFieldValue(
  //           'wire_ports'
  //         )}`
  //       );
  //     }
  //   }
  // }

  var code =
    'module ' +
    modName +
    '(' +
    args.join(', ') +
    ');\n' +
    xfix1 +
    loopTrap +
    branch +
    xfix2 +
    returnValue +
    '\nendmodule';
  code = Blockly.Verilog.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Verilog.definitions_['%' + modName] = code;
  return null;
};
