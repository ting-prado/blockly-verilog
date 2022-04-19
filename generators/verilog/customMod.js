const customMod = (() => {
  const ports = {
    input: [],
    output: [],
    wire: [],
  };

  const checkDuplicates = (id) => {
    let index = '';
    for (const types in ports) {
      if (ports[types].length > 0) {
        ports[types].forEach((data) => {
          if (data.id === id) {
            index = { type: types, index: ports[types].indexOf(data) };
          }
        });
      }
    }
    return index;
  };

  const checkDeleted = () => {
    //Delete from array if block id not found in workspace
    for (const types in ports) {
      if (ports[types].length > 0) {
        ports[types].forEach((data) => {
          if (!Object.keys(Blockly.mainWorkspace.blockDB_).includes(data.id)) {
            ports[types].splice(ports[types].indexOf(data), 1);
          }
        });
      }
    }
  };

  const removeDup = (type, index) => {
    ports[type].splice(index, 1);
  };

  const addVariable = (name, id, type) => {
    let isDup = checkDuplicates(id);
    if (isDup === '') {
      //No duplicate existed
      ports[type].push({ name, id });
    } else {
      if (isDup.type !== type) {
        //Check if variable type was changed
        removeDup(isDup.type, isDup.index);
        ports[type].push({ name, id });
      } else {
        //Variable name was changed
        ports[isDup.type][isDup.index].name = name;
      }
    }
  };

  return { addVariable, checkDeleted };
})();
