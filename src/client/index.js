'use strict';

import 'bootstrap';
import $ from 'jquery';
import * as digitaljs from 'digitaljs';

let running = false;
let loading = false,
  circuit,
  paper;

function myUpdateFunction() {
  let svFile = {
    '_input.sv': '',
  };
  let code = document.getElementById('codeOutput').textContent;
  console.log(code);
  svFile['_input.sv'] = code;
  return svFile;
}

function updateBtns() {
  if (circuit == undefined) {
    $('.top-nav').find('button:not(.simulate-btn)').prop('disabled', true);
    $('.top-nav').find('button[name=pause]').prop('disabled', !running);
    $('.top-nav').find('button[name=resume]').prop('disabled', !running);
  } else {
    $('.top-nav').find('button[name=pause]').prop('disabled', !running);
    $('.top-nav').find('button[name=resume]').prop('disabled', running);
  }
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
  loading = true;
  running = false;
  updateBtns();
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
  circuit.on('userChange', () => {
    running = !running;
    updateBtns();
  });
  circuit.on('changeRunning', () => {
    running = !running;
    updateBtns();
  });
  running = true;
  updateBtns();
}

function runquery() {
  const data = myUpdateFunction();
  const opts = { optimize: false, fsm: false, fsmexpand: false };
  const errorp = document.querySelector('.error');
  destroyCkt();
  $.ajax({
    type: 'POST',
    url: '/api/yosys2digitaljs',
    contentType: 'application/json',
    data: JSON.stringify({ files: data, options: opts }),
    dataType: 'json',
    success: (responseData) => {
      let circuit = responseData.output;
      const engines = {
        synch: digitaljs.engines.BrowserSynchEngine,
        worker: digitaljs.engines.WorkerEngine,
      };
      circuit = digitaljs.transform.transformCircuit(circuit);
      mkcircuit(circuit, {
        layoutEngine: 'elkjs',
        engine: engines['worker'],
      });
      running = true;
      errorp.textContent = '';
    },
    error: (request, status, error) => {
      $('.top-nav').find('button[type=submit]').prop('disabled', false);
      loading = false;
      running = false;
      updateBtns();
      errorp.textContent =
        'Cannot simulate circuit, please check your program.';
      console.log(error);
    },
  });
}

const submitBtn = document.querySelector('.simulate-btn');
submitBtn.addEventListener('click', (e) => {
  e.preventDefault();
  $('.top-nav').find('button, input').prop('disabled', true);
  runquery();
});

document.querySelector('button[name=pause]').addEventListener('click', (e) => {
  circuit.stop();
});

document.querySelector('button[name=resume]').addEventListener('click', (e) => {
  circuit.start();
});

window.onpopstate = () => {
  const hash = window.location.hash.slice(1);
  if (loading || !hash) return;
  destroycircuit();
  $.ajax({
    type: 'GET',
    url: '/api/circuit/' + hash,
    dataType: 'json',
    success: (responseData, status, xhr) => {
      mkcircuit(responseData);
    },
    error: (request, status, error) => {
      loading = false;
      updatebuttons();
    },
  });
};

updateBtns();

if (window.location.hash.slice(1)) window.onpopstate();
