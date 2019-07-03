function test(a) {
    return a + '77';
}
async function testAsync(t) {
    let z = await t.invoke() + '';
    let f = (b) => b(z) + '8';
    return f(z);
}
//# sourceMappingURL=invoice2.template.js.map