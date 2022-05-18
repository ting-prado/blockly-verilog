'use strict';

import 'bootstrap';
import $ from 'jquery';
import * as digitaljs from 'digitaljs';

let cnt = 0;
let editors = {};

let loading = false,
  circuit,
  paper;

function myUpdateFunction() {
  let svFile = {
    '_input.sv': '',
  };
  let code = document.getElementById('codeOutput').textContent;
  svFile['_input.sv'] = code;
  return svFile;
}

function destroyCkt() {
  if (circuit) {
    circuit.shutdown();
    circuit = undefined;
  }

  if (paper) {
    paper.remove();
    paper = undefined;
  }
}

function mk_markers(paper) {
  let markers = [];
  paper.on('cell:mouseover', (cellView) => {
    for (const marker of markers) marker.clear();
    markers = [];
    const positions = cellView.model.get('source_positions');
    if (!positions) return;
    for (const pos of positions) {
      const editor = editors[find_filename(pos.name)];
      if (!editor || editor._is_dirty) continue;
      const marker = editor.markText(
        { line: pos.from.line - 1, ch: pos.from.column - 1 },
        { line: pos.to.line - 1, ch: pos.to.column - 1 },
        { css: 'background-color: yellow' }
      );
      markers.push(marker);
    }
  });
  paper.on('cell:mouseout', (cellView) => {
    for (const marker of markers) marker.clear();
  });
}

function mkcircuit(data, opts) {
  loading = false;
  $('.top-nav').find('button[type=submit]').prop('disabled', false);
  circuit = new digitaljs.Circuit(data, opts);
  circuit.on('postUpdateGates', (tick) => {
    $('#tick').val(tick);
  });
  circuit.start();
  paper = circuit.displayOn($('<div>').appendTo($('#diagramOutput')));
  mk_markers(paper);
  circuit.on('new:paper', (paper) => {
    mk_markers(paper);
  });
  circuit.on('userChange', () => {
    updateBtns();
  });
  circuit.on('changeRunning', () => {
    updateBtns();
  });
  updateBtns();
}

function runquery() {
  const data = myUpdateFunction();
  const opts = { optimize: false, fsm: false, fsmexpand: false };
  destroyCkt();
  $.ajax({
    type: 'POST',
    url: '/api/yosys2digitaljs',
    contentType: 'application/json',
    data: JSON.stringify({ files: data, options: opts }),
    dataType: 'json',
    success: (responseData) => {
      let circuit = responseData.output;
      mkcircuit(circuit);
    },
    error: (request, status, error) => {
      loading = false;
      updateBtns();
      $('.top-nav').find('button[type=submit]').prop('disabled', false);
      $(
        '<div class="query-alert alert alert-danger alert-dismissible fade show" role="alert"></div>'
      )
        .append(
          '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
        )
        .append(document.createTextNode(request.responseJSON.error))
        .append($('<pre>').text(request.responseJSON.yosys_stderr.trim()))
        .prependTo($('#synthesize-bar'))
        .alert();
    },
  });
}

const submitBtn = document.querySelector('.simulate-btn');
submitBtn.addEventListener('click', runquery);

$('button[name=pause]').click((e) => {
  circuit.stop();
});

$('button[name=resume]').click((e) => {
  circuit.start();
});
