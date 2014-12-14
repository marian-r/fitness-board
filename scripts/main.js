'use strict';

var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var users = [];
var selectedUser = {};

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

function generate() {

    for (let i = 0, len = users.length; i < len; i++) {
        let user = users[i];
        let medicalData = user.medicalData;

        delete user.ehrId;
        delete user.medicalData;

        $.ajax({
            url: baseUrl + "/ehr",
            type: 'POST',
            success: function (data) {
                var ehrId = data.ehrId;
                var partyData = user;
                partyData.partyAdditionalInfo = [{key: "ehrId", value: ehrId}];

                $.ajax({
                    url: baseUrl + "/demographics/party",
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify(partyData),
                    success: function (party) {

                        if (party.action === 'CREATE') {
                            console.log("Created EHR '" + ehrId + "'.");
                            users[i].ehrId = ehrId;

                            for (let j = 0, len = medicalData.length; j < len; j++) {

                                var { dateTime, bodyWeight, pulse, bodyTemperature } = medicalData[j];
                                createMedicalData(bodyWeight, pulse, bodyTemperature, dateTime, ehrId);
                            }
                        }
                    },
                    error: function(err) {
                        console.log(JSON.parse(err.responseText).userMessage);
                    }
                });
            }
        });
    }
}

function createMedicalData(bodyWeight, pulse, bodyTemperature, dateTime, ehrId) {
    var data = {
        // Preview Structure: https://rest.ehrscape.com/rest/v1/template/Vital%20Signs/example
        "ctx/language": "en",
        "ctx/territory": "SI",
        "ctx/time": dateTime
    };

    if (bodyWeight) {
        data['vital_signs/body_weight/any_event/body_weight'] = bodyWeight;
    }
    if (pulse) {
        data["vital_signs/body_temperature/any_event/temperature|magnitude"] = bodyTemperature;
        data["vital_signs/body_temperature/any_event/temperature|unit"] = '°C';
    }
    if (bodyTemperature) {
        data["vital_signs/pulse/any_event/rate|magnitude"] = pulse;
        data["vital_signs/pulse/any_event/rate|unit"] = "/min";
    }


    var params = {
        "ehrId": ehrId,
        templateId: 'Vital Signs',
        format: 'FLAT'
    };

    $.ajax({
        url: baseUrl + "/composition?" + $.param(params),
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(data),
        success: function (res) {
            console.log(res.meta.href);
        },
        error: function (err) {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
}

function submitForm() {
    var ehrId = selectedUser.ehrId;
    var dateTime = new Date(); // current time
    var bodyWeight = $("#inputWeight").val();
    var pulse = $("#inputPulse").val();
    var bodyTemperature = $("#inputTemperature").val();

    if (!bodyWeight && !pulse && !bodyTemperature) {
        console.log("Required");
    }

    createMedicalData(bodyWeight, pulse, bodyTemperature, dateTime, ehrId);
}

function loadPatients() {
    $.getJSON('data/patients.json', function (data) {
        users = data;
        selectedUser = users[0];

        visualize();

        getWeights();
    });
}

function getWeights() {
    var ehrId = selectedUser.ehrId;

    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + "weight",
        type: 'GET',
        success: function (res) {
            console.log(res);
        },
        error: function() {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
}

function visualize() {
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
            return "<strong>Weight:</strong> <span style='color:red'>" + d.bodyWeight + " Kg</span>";
        });

    var svg = d3.select("#chartWeight").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.call(tip);


    var data = selectedUser.medicalData;

    x.domain(data.map(function (d) {
        return d.dateTime;
    }));
    y.domain([0, d3.max(data, function (d) {
        return d.bodyWeight;
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
        .text("Kg");

    svg.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function (d) { return x(d.dateTime); })
        .attr("width", x.rangeBand())
        .attr("y", function (d) { return y(d.bodyWeight); })
        .attr("height", function (d) { return height - y(d.bodyWeight); })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide);

}

$(function () {
    loadPatients();

    $.ajaxSetup({
        headers: {"Ehr-Session": getSessionId()}
    });

    $('#linkGenerate').click(generate);
    $('#linkShow').click(function () {
        console.log(users);
    });

    $('#submitButton').click(submitForm);
});
