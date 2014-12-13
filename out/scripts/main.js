System.registerModule("../../scripts/main.js", [], function() {
  "use strict";
  var __moduleName = "../../scripts/main.js";
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
      url: baseUrl + "/session?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password),
      async: false
    });
    return response.responseJSON.sessionId;
  }
  function generate() {
    var $__1 = function(i, len) {
      var user = users[i];
      var medicalData = user.medicalData;
      delete user.ehrId;
      delete user.medicalData;
      $.ajax({
        url: baseUrl + "/ehr",
        type: 'POST',
        success: function(data) {
          var ehrId = data.ehrId;
          var partyData = user;
          partyData.partyAdditionalInfo = [{
            key: "ehrId",
            value: ehrId
          }];
          $.ajax({
            url: baseUrl + "/demographics/party",
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(partyData),
            success: function(party) {
              if (party.action === 'CREATE') {
                console.log("Created EHR '" + ehrId + "'.");
                users[i].ehrId = ehrId;
                for (var j = 0,
                    len = medicalData.length; j < len; j++) {
                  var $__0 = medicalData[j],
                      dateTime = $__0.dateTime,
                      bodyWeight = $__0.bodyWeight,
                      pulse = $__0.pulse,
                      bodyTemperature = $__0.bodyTemperature;
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
    };
    for (var i = 0,
        len = users.length; i < len; i++) {
      $__1(i, len);
    }
  }
  function createMedicalData(bodyWeight, pulse, bodyTemperature, dateTime, ehrId) {
    var data = {
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
      success: function(res) {
        console.log(res.meta.href);
      },
      error: function(err) {
        console.log(JSON.parse(err.responseText).userMessage);
      }
    });
  }
  function submitForm() {
    var ehrId = selectedUser.ehrId;
    var dateTime = new Date();
    var bodyWeight = $("#inputWeight").val();
    var pulse = $("#inputPulse").val();
    var bodyTemperature = $("#inputTemperature").val();
    if (!bodyWeight && !pulse && !bodyTemperature) {
      console.log("Required");
    }
    createMedicalData(bodyWeight, pulse, bodyTemperature, dateTime, ehrId);
  }
  function loadPatients() {
    $.getJSON('data/patients.json', function(data) {
      users = data;
      selectedUser = users[0];
      getWeights();
    });
  }
  function getWeights() {
    var ehrId = selectedUser.ehrId;
    $.ajax({
      url: baseUrl + "/view/" + ehrId + "/" + "weight",
      type: 'GET',
      success: function(res) {
        console.log(res);
      },
      error: function() {
        console.log(JSON.parse(err.responseText).userMessage);
      }
    });
  }
  $(function() {
    loadPatients();
    $.ajaxSetup({headers: {"Ehr-Session": getSessionId()}});
    $('#linkGenerate').click(generate);
    $('#linkShow').click(function() {
      console.log(users);
    });
    $('#submitButton').click(submitForm);
  });
  return {};
});
System.get("../../scripts/main.js" + '');
