/**
 * @license
 * Copyright 2012 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @fileoverview Logic blocks for Blockly.
 *
 * This file is scraped to extract a .json file of block definitions. The array
 * passed to defineBlocksWithJsonArray(..) must be strict JSON: double quotes
 * only, no outside references, no functions, no trailing commas, etc. The one
 * exception is end-of-line comments, which the scraper will remove.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Constants.Conditional');

goog.require('Blockly');
goog.require('Blockly.Blocks');
goog.require('Blockly.FieldDropdown');
goog.require('Blockly.FieldLabel');
goog.require('Blockly.Mutator');

/**
 * Unused constant for the common HSV hue for all blocks in this category.
 * @deprecated Use Blockly.Msg['LOGIC_HUE']. (2018 April 5)
 */
Blockly.Constants.Logic.HUE = 210;

// If/else block that does not use a mutator.
Blockly.defineBlocksWithJsonArray([
  {
    type: 'conditional_block',
    message0:
      '%{BKY_CONTROLS_IF_MSG_IF} %1 %2 %{BKY_CONTROLS_IF_MSG_THEN} %3 %{BKY_CONTROLS_IF_MSG_ELSE} %4',
    args0: [
      {
        type: 'field_input',
        name: 'CONDITION',
        text: 'condition',
      },
      {
        type: 'input_dummy',
      },
      {
        type: 'input_value',
        name: 'THEN',
        align: 'RIGHT',
      },
      {
        type: 'input_value',
        name: 'ELSE',
        align: 'RIGHT',
      },
    ],
    output: null,
    style: 'logic_blocks',
    tooltip: '%{BKY_CONTROLS_IF_TOOLTIP_5}',
    helpUrl: '%{BKY_CONTROLS_IF_HELPURL}',
  },
]);
