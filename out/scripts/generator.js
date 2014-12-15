System.registerModule("../../scripts/ehr", [], function() {
  "use strict";
  var __moduleName = "../../scripts/ehr";
  'use strict';
  var baseUrl = 'https://rest.ehrscape.com/rest/v1';
  var queryUrl = baseUrl + '/query';
  function loadPatient(ehrId, callback) {
    $.ajax({
      url: baseUrl + "/demographics/ehr/" + ehrId + "/party",
      type: 'GET',
      success: function(data) {
        callback(data.party);
      },
      error: function(err) {
        console.log(JSON.parse(err.responseText).userMessage);
      }
    });
  }
  function createMedicalData(ehrId) {
    var $__0 = arguments[1] !== (void 0) ? arguments[1] : {},
        dateTime = $__0.dateTime,
        bodyWeight = $__0.bodyWeight,
        pulse = $__0.pulse,
        bodyTemperature = $__0.bodyTemperature;
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
  function loadWeights(ehrId, callback) {
    loadMedicalData(ehrId, "weight", function(res) {
      var weights = [];
      console.log(res);
      for (var i = 0,
          len = res.length; i < len; i++) {
        var $__0 = res[i],
            time = $__0.time,
            weight = $__0.weight;
        weights.push({
          dateTime: time,
          bodyWeight: weight
        });
      }
      callback(weights);
    });
  }
  function loadPulses(ehrId, callback) {
    loadMedicalData(ehrId, "pulse", function(res) {
      var pulses = [];
      for (var i = 0,
          len = res.length; i < len; i++) {
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
      success: function(res) {
        console.log(res);
        callback(res);
      },
      error: function() {
        console.log(JSON.parse(err.responseText).userMessage);
      }
    });
  }
  return {
    get loadPatient() {
      return loadPatient;
    },
    get createMedicalData() {
      return createMedicalData;
    },
    get loadWeights() {
      return loadWeights;
    },
    get loadPulses() {
      return loadPulses;
    }
  };
});
System.registerModule("../../scripts/generator.js", [], function() {
  "use strict";
  var __moduleName = "../../scripts/generator.js";
  'use strict';
  var createMedicalData = System.get("../../scripts/ehr").createMedicalData;
  function generatePatients() {
    $.getJSON('data/patients.json', function(data) {
      var users = data;
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
      };
      for (var i = 0,
          len = users.length; i < len; i++) {
        $__1(i, len);
      }
    });
  }
  return {get generatePatients() {
      return generatePatients;
    }};
});
System.get("../../scripts/generator.js" + '');
