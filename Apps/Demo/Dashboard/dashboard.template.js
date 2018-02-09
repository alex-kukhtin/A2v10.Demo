/* dashboard index template */


const template = {
    properties: {
    },
    delegates: {
        drawChart
    }
};

module.exports = template;


const width = 320;
const height = 240;
const marginX = 30;
const marginY = 20;

function drawChart(graphics) {

    const chart = graphics.append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`);

    const sine = d3.range(0, 40)
        .map(k => {
            let x = .5 * k * Math.PI;
            return [x, Math.sin(x / 4)];
        });

    // scale functions
    const x = d3.scaleLinear()
        .range([marginX, width - marginX / 2])
        .domain(d3.extent(sine, d => d[0]));

    const y = d3.scaleLinear()
        .range([height - marginY, marginY])
        .domain([-1, 1]);

    // line generator
    const line = d3.line()
        .x(d => x(d[0]))
        .y(d => y(d[1]));


    chart.append('g')
        .append('path')
        .datum(sine)
        .attr('d', line.curve(d3.curveCardinal))
        .attr('stroke', '#0d82f8')
        .attr('stroke-width', 1)
        .attr('fill', 'none');

    // Add the X Axis
    chart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(0, ${height / 2})`)
        .call(d3.axisBottom(x));

    // Add the Y Axis
    chart.append("g")
        .attr("class", "axis")
        .attr("transform", `translate(${marginX}, 0)`)
        .call(d3.axisLeft(y).ticks(10));
}


