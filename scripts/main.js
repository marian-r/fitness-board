'use strict';

var baseUrl = 'https://rest.ehrscape.com/rest/v1';
var queryUrl = baseUrl + '/query';

var username = "ois.seminar";
var password = "ois4fri";

var users = [];

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
        delete user.ehrId;

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

function loadPatients() {
    $.getJSON('data/patients.json', function (data) {
        users = data;
    });
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
});
