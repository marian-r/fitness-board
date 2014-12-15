'use strict';

var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

function getSessionId() {
    var response = $.ajax({
        type: "POST",
        url: baseUrl + "/session?username=" + encodeURIComponent(username) +
        "&password=" + encodeURIComponent(password),
        async: false
    });
    return response.responseJSON.sessionId;
}

$.ajaxSetup({
    headers: {"Ehr-Session": getSessionId()}
});

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
        data["vital_signs/pulse/any_event/rate|magnitude"] = pulse;
        data["vital_signs/pulse/any_event/rate|unit"] = "/min";
    }
    if (bodyTemperature) {
        data["vital_signs/body_temperature/any_event/temperature|magnitude"] = bodyTemperature;
        data["vital_signs/body_temperature/any_event/temperature|unit"] = '°C';
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
    loadMedicalData(ehrId, "weight", "weight", callback);
}

export function loadPulses(ehrId, callback) {
    loadMedicalData(ehrId, "pulse", "pulse", callback);
}

export function loadTemperatures(ehrId, callback) {
    loadMedicalData(ehrId, "body_temperature", "temperature", callback);
}

export function loadPulseTemperatures(ehrId, callback) {
    runQuery(ehrId, callback);
}

function loadMedicalData(ehrId, type, propertyName, callback) {
    $.ajax({
        url: baseUrl + "/view/" + ehrId + "/" + type,
        type: 'GET',
        success: function (res) {
            var arr = [];

            for (let i = 0, len = res.length; i < len; i++) {

                var item = res[i];

                arr.push({
                    dateTime: item.time,
                    value: item[propertyName]
                });
            }

            arr = _.sortBy(arr, function (item) {
                return item.time;
            });

            callback(arr.reverse());
        },
        error: function() {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
}

function runQuery(ehrId, callback) {
    var AQL = 'select ' +
            't/data[at0002]/events[at0003]/time/value as dateTime, ' +
            'p/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as pulse, ' +
            't/data[at0002]/events[at0003]/data[at0001]/items[at0004]/value/magnitude as temperature ' +
        'from EHR e[e/ehr_id/value=\'' + ehrId + '\'] ' + // have to use single quotes
        'contains COMPOSITION a ' +
        'contains ( ' +
            'OBSERVATION p[openEHR-EHR-OBSERVATION.heart_rate-pulse.v1] and ' +
            'OBSERVATION t[openEHR-EHR-OBSERVATION.body_temperature.v1]) ' +
        'order by t/data[at0002]/events[at0003]/time/value asc ' +
        'limit 10';

    $.ajax({
        url: queryUrl + "?" + $.param({ "aql": AQL }),
        type: 'GET',
        success: function (res) {
            callback(res.resultSet);
        },
        error: function (err) {
            console.log(JSON.parse(err.responseText).userMessage);
        }
    });
}
