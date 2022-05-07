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
  // If/elseif/else condition.
  var n = 0;
  var code = '',
    branchCode,
    conditionCode;
  if (Blockly.Verilog.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_PREFIX, block);
  }
  do {
    conditionCode = block.getFieldValue('STATEMENT' + n) || 'false';
    branchCode = Blockly.Verilog.statementToCode(block, 'DO' + n);
    if (Blockly.Verilog.STATEMENT_SUFFIX) {
      branchCode =
        Blockly.Verilog.prefixLines(
          Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_SUFFIX, block),
          Blockly.Verilog.INDENT
        ) + branchCode;
    }
    code +=
      (n > 0 ? ' else ' : '') +
      'if (' +
      conditionCode +
      ') {\n' +
      branchCode +
      '}\n';
    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE') || Blockly.Verilog.STATEMENT_SUFFIX) {
    branchCode = Blockly.Verilog.statementToCode(block, 'ELSE');
    if (Blockly.Verilog.STATEMENT_SUFFIX) {
      branchCode =
        Blockly.Verilog.prefixLines(
          Blockly.Verilog.injectId(Blockly.Verilog.STATEMENT_SUFFIX, block),
          Blockly.Verilog.INDENT
        ) + branchCode;
    }
    code += ' else {\n' + branchCode + '}';
  }
  return code + '\n';
};
