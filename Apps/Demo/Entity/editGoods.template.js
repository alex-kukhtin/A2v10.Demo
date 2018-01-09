/**
 * edit good
 */


const template = {
    events: {
        "Model.load": modelLoad
    },
    validators: {
        "Entity.Name": 'Введите наименование'
    }
};

function modelLoad(root) {
    const ent = root.Entity;
    if (ent.$isNew)
        entityCreate(ent);
}

function entityCreate(ent) {
    ent.Kind = 'Goods';
}

module.exports = template;