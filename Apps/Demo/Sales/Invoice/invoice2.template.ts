
function test(a: string): string {
	return a + '77';
}

async function testAsync(t: any): Promise<string> {
	let z = await t.invoke() + '';
	let f = (b):string => b(z) + '8';
	return f(z);
}