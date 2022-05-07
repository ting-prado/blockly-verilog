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

  let input = [];
  let output = [];
  block.getParamInfo().forEach((info) => {
    if (info.type == 'input') {
      input.push(
        Blockly.Verilog.nameDB_.getName(
          info.var_name,
          Blockly.VARIABLE_CATEGORY_NAME
        )
      );
    } else {
      output.push(
        Blockly.Verilog.nameDB_.getName(
          info.var_name,
          Blockly.VARIABLE_CATEGORY_NAME
        )
      );
    }
  });

  var code =
    'module ' +
    modName +
    '(' +
    (input.length > 0 ? 'input ' : '') +
    input.join(', ') +
    (input.length > 0 && output.length > 0 ? ',\n' : '') +
    (output.length > 0 ? 'output ' : '') +
    output.join(', ') +
    ');\n\n' +
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

Blockly.Verilog['modules_callnoreturn'] = function (block) {
  // Call a module with no return value.
  var funcName = Blockly.Verilog.nameDB_.getName(
    block.getFieldValue('NAME'),
    Blockly.PROCEDURE_CATEGORY_NAME
  );

  var args = [];
  var variables = block.arguments_;
  for (let i = 0; i < variables.length; i++) {
    args[i] = block.getFieldValue('ARGNAME' + i);
  }

  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Verilog.ORDER_FUNCTION_CALL];
};