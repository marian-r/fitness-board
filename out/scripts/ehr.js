System.registerModule("../../scripts/ehr.js", [], function() {
  "use strict";
  var __moduleName = "../../scripts/ehr.js";
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
  return {};
});
System.get("../../scripts/ehr.js" + '');
