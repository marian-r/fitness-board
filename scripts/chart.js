
export function visualize(data, htmlSelector, name, units = '') {
    var margin = {top: 40, right: 20, bottom: 30, left: 40},
        width = 425 - margin.left - margin.right,
        height = 286 - margin.top - margin.bottom;

    var dateFormatter = function (date) {
        return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
    };

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .tickFormat(function (d) {
            return dateFormatter(new Date(d));
        });

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>" + name + ":</strong> <span style='color:red'>" + d.value + " " + units + "</span>";
        });

    var svg = d3.select(htmlSelector).html("").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    x.domain(data.map(function (d) {
        return d.dateTime;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.value;
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("x", -6)
        .attr("y", -10)
        .style("text-anchor", "end")
        .text(units);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.dateTime); })
        .attr("width", x.rangeBand())
        .attr("y", function (d) { return y(d.value); })
        .attr("height", function (d) { return height - y(d.value); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
}


export function visualizeCustom(data, htmlSelector, xProp, yProp, name,units = '') {
    var margin = {top: 40, right: 20, bottom: 30, left: 40},
        width = 425 - margin.left - margin.right,
        height = 286 - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1);

    var y = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left");

    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function (d) {
            return "<strong>" + name + ":</strong> <span style='color:red'>" + d[yProp] + " " + units + "</span>";
        });

    var svg = d3.select(htmlSelector).html("").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);

    x.domain(data.map(function (d) {
        return d[xProp];
    }));
    y.domain([0, d3.max(data, function (d) {
        return d[yProp];
    })]);

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("x", -6)
        .attr("y", -10)
        .style("text-anchor", "end")
        .text(units);

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d[xProp]); })
        .attr("width", x.rangeBand())
        .attr("y", function (d) { return y(d[yProp]); })
        .attr("height", function (d) { return height - y(d[yProp]); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);
}
