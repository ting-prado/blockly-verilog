const customMod = (() => {
  const modules = [];

  const addModule = (mod) => {
    let isDup = checkModuleDuplicates(mod.id);
    isDup === false ? modules.push(mod) : (modules[isDup].name = mod.name);
  };

  const checkModuleDuplicates = (id) => {
    let index = false;
    if (modules.length > 0) {
      modules.forEach((mod) => {
        if (mod.id === id) {
          index = modules.indexOf(mod);
        }
      });
    }
    return index;
  };

  const ports = {
    input: [],
    output: [],
    wire: [],
  };

  const getModIndex = (id) => {
    let index;
    modules.forEach((mod) => {
      if (mod.id == id) {
        index = modules.indexOf(mod);
      }
    });
    return index;
  };

  const checkPortDuplicates = (modIndex, id) => {
    let index = '';
    let obj = modules[modIndex].ports;
    for (const types in obj) {
      if (obj[types].length > 0) {
        obj[types].forEach((data) => {
          if (data.id === id) {
            index = {
              type: types,
              index: obj[types].indexOf(data),
              modIndex: modIndex,
            };
          }
        });
      }
    }
    return index;
  };

  const checkDeleted = () => {
    for (let i = 0; i < modules.length; i++) {
      for (const types in modules[i].ports) {
        if (modules[i].ports[types].length > 0) {
          modules[i].ports[types].forEach((data) => {
            if (
              !Object.keys(Blockly.mainWorkspace.blockDB_).includes(data.id)
            ) {
              modules[i].ports[types].splice(
                modules[i].ports[types].indexOf(data),
                1
              );
            }
          });
        }
      }
    }
    console.log(modules);
  };

  const removeDup = (modIndex, type, index) => {
    modules[modIndex].ports[type].splice(index, 1);
  };

  const addVariable = (modId, name, id, type) => {
    const modIndex = getModIndex(modId);
    let isDup = checkPortDuplicates(modIndex, id);
    if (isDup === '') {
      modules[modIndex].ports[type].push({ name, id });
    } else {
      if (isDup.type !== type) {
        removeDup(modIndex, isDup.type, isDup.index);
        modules[modIndex].ports[type].push({ name, id });
      } else {
        modules[modIndex].ports[isDup.type][isDup.index].name = name;
      }
    }
  };

  const orgInputs = (index, connected) => {
    let inputs = '';

    if (modules[index].ports['input'].length > 0 && connected.length > 0) {
      inputs = 'input';
      for (let i = 0; i < modules[index].ports['input'].length; i++) {
        connected.forEach((str) => {
          if (str === modules[index].ports['input'][i].name) {
            inputs =
              inputs +
              ' ' +
              modules[index].ports['input'][i].name +
              (i !== modules[index].ports['input'].length - 1 ? ',' : '');
          }
        });
      }
    }

    return inputs;
  };

  const orgOutputs = (index, connected) => {
    let outputs = '';
    if (modules[index].ports['output'].length > 0) {
      outputs = 'output';
      for (let i = 0; i < modules[index].ports['output'].length; i++) {
        connected.forEach((str) => {
          if (str === modules[index].ports['output'][i].name) {
            outputs =
              outputs +
              ' ' +
              modules[index].ports['output'][i].name +
              (i !== modules[index].ports['output'].length - 1 ? ',' : '');
          }
        });
      }
    }
    return outputs;
  };

  const getPorts = (modId, connected) => {
    let index = getModIndex(modId);
    let inputs = orgInputs(index, connected);
    let outputs = orgOutputs(index, connected);
    return (
      inputs +
      (inputs.length > 0 && outputs.length > 0 ? ', ' + '</br>' : ' ') +
      outputs
    );
  };

  return { addVariable, checkDeleted, getPorts, addModule };
})();

const Module = (name, id) => {
  return {
    name,
    id,
    ports: {
      input: [],
      output: [],
    },
  };
};
