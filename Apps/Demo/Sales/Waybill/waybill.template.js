/*invoice template*/

const utils = require('std:utils');
const du = utils.date;

const template = {
    properties: {
        'TRow.Sum': { get: getRowSum, set: setRowSum },
        'TDocument.Sum': totalSum,
    },
    validators: {
        'Document.Agent': 'Выберите покупателя',
        'Document.DepFrom': 'Выберите склад',
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
            canExec: isValidDocument,
            exec: applyDocument
        },
        unApply: unApplyDocument
    }
};

module.exports = template;

function modelLoad(root) {
    if (root.Document.$isNew)
        documentCreate(root.Document);
}

function documentCreate(doc) {
    doc.Date = du.today();
    doc.Kind = 'Waybill';
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

function isValidDocument(doc) {
    return doc.$valid;
}
