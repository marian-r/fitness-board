'use strict';

var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

export function loadPatient(ehrId, callback) {
    $.ajax({
        url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
        type: 'GET',
        success: function (data) {
            callback(data.party);
        },
        error: function(err) {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
}

export function createPatient(user, callback) {
    var medicalData = user.medicalData;

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
                        callback(ehrId, user.firstNames  + ' ' + user.lastNames);

                        for (let j = 0, len = medicalData.length; j < len; j++) {
                            createMedicalData(ehrId, medicalData[j]);
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

export function createMedicalData(ehrId, { dateTime, bodyWeight, pulse, bodyTemperature } = {}) {
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

export function loadWeights(ehrId, callback) {
    loadMedicalData(ehrId, "weight", function (res) {
        var weights = [];

        for (let i = 0, len = res.length; i < len; i++) {

            var { time, weight } = res[i];

            weights.push({
                dateTime: time,
                bodyWeight: weight
            });
        }

        callback(weights);
    });
}

export function loadPulses(ehrId, callback) {
    loadMedicalData(ehrId, "pulse", function (res) {
        var pulses = [];

        for (let i = 0, len = res.length; i < len; i++) {
            pulses.push({
                dateTime: res.time,
                bodyWeight: res.pulse
            });
        }
        callback(pulses);
    });
}

function loadMedicalData(ehrId, type, callback) {
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + type,
        type: 'GET',
        success: function (res) {
            callback(res);
        },
        error: function() {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
}
