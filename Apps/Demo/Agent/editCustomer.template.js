/**
 * edit customer
 */


const template = {
    events: {
        "Model.load": modelLoad
    },
    validators: {
        "Agent.Name": 'Введите наименование'
    }
};

function modelLoad(root) {
    const ag = root.Agent;
    if (ag.$isNew)
        customerCreate(ag);
}

function customerCreate(ag) {
    ag.Kind = 'Customer';
}

module.exports = template;