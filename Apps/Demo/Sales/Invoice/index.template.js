/*invoice index template*/

const template = {
    properties: {
        'TDocument.$Mark': mark,
    },
};


function mark() {
    return this.Done ? "success" : '';
}

module.exports = template;

