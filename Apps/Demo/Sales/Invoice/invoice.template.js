/*invoice template*/

const utils = require('std:utils');
const du = utils.date;

const template = {
    properties: {
        'TRow.Sum': { get: getRowSum, set: setRowSum },
        'TDocument.Sum': totalSum,
        'TDocument.$canShipment': canShipment
    },
    validators: {
        'Document.Agent': 'Выберите покупателя',
        'Document.Rows[].Entity': 'Выберите товар',
        'Document.Rows[].Price': 'Укажите цену'
    },
    events: {
        'Model.load': modelLoad,
        'Document.Rows[].add': (arr, row) => row.Qty = 1,
        'Document.Rows[].Entity.Article.change': findArticle
    },
    commands: {
        apply: { 
            saveRequired: true,
            validRequired: true,
            confirm: 'Провести документ?',
            exec: applyDocument
        },
        unApply: {
            confirm: 'Отменить проведение документа?',
            exec: unApplyDocument
        },
        createShipment,
        createPayment
    }
};

module.exports = template;

function modelLoad(root, caller) {
    if (root.Document.$isNew)
        documentCreate(root.Document);
}

function documentCreate(doc) {
    const vm = doc.$vm;
    doc.Date = du.today();
    doc.Kind = 'Invoice';
    doc.Rows.$append();
    const dat = { Id: doc.Id, Kind: doc.Kind };
    vm.$invoke("nextDocNo", dat, '/Document').then(r => doc.No = r.Result.DocNo);
}

function getRowSum() {
    return +(this.Price * this.Qty).toFixed(2);
}

function setRowSum(value) {
    // ставим цену - сумма пересчитается
    if (this.Qty)
        this.Price = +(value / this.Qty).toFixed(2);
    else
        this.Pirce = 0;
}

function totalSum() {
    return this.Rows.reduce((prev, curr) => prev + curr.Sum, 0);
}

function findArticle(entity) {
    const vm = entity.$vm;
    const row = entity.$parent;
    const dat = { Article: entity.Article };
    vm.$invoke('findArticle', dat, '/Entity').then(r => {
        if ('Entity' in r)
            row.Entity = r.Entity;
        else
            row.Entity.$empty();
    });
}

async function applyDocument(doc) {
    const vm = doc.$vm;
    await vm.$invoke('apply', { Id: doc.Id }, '/document');
    vm.$requery();
}

async function unApplyDocument(doc) {
    const vm = doc.$vm;
    await vm.$invoke('unApply', { Id: doc.Id }, '/document');
    vm.$requery();
}

async function createShipment(doc) {
    const vm = doc.$vm;
    let result = await vm.$invoke('createShipment', { Id: doc.Id });
    if (result.Document) {
        vm.$navigate('/sales/waybill/edit', result.Document.Id)
        //doc.Shipment.$append(result.Document);
    }
}

async function createPayment(doc) {
    const vm = doc.$vm;
    vm.$alert('Пока не реализовано');
    //let result = await vm.$invoke('createPayment', { Id: doc.Id });
    //vm.$navigate('/document/payment/edit', result.Document.Id)
}

function canShipment() {
    return this.Shipment.Count == 0;
}
