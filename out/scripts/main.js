System.registerModule("../../scripts/chart", [], function() {
  "use strict";
  var __moduleName = "../../scripts/chart";
  function visualize(data, propertyName) {
    var margin = {
      top: 40,
      right: 20,
      bottom: 30,
      left: 40
    },
        width = 425 - margin.left - margin.right,
        height = 286 - margin.top - margin.bottom;
    var dateFormatter = function(date) {
      return date.getDate() + '-' + date.getMonth() + '-' + date.getFullYear();
    };
    var x = d3.scale.ordinal().rangeRoundBands([0, width], .1);
    var y = d3.scale.linear().range([height, 0]);
    var xAxis = d3.svg.axis().scale(x).orient("bottom").tickFormat(function(d) {
      return dateFormatter(new Date(d));
    });
    var yAxis = d3.svg.axis().scale(y).orient("left");
    var tip = d3.tip().attr('class', 'd3-tip').offset([-10, 0]).html(function(d) {
      return "<strong>Weight:</strong> <span style='color:red'>" + d[propertyName] + " Kg</span>";
    });
    var svg = d3.select("#chartWeight").html("").append("svg").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.call(tip);
    x.domain(data.map(function(d) {
      return d.dateTime;
    }));
    y.domain([0, d3.max(data, function(d) {
      return d[propertyName];
    })]);
    svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
    svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("x", -6).attr("y", -10).style("text-anchor", "end").text("Kg");
    svg.selectAll(".bar").data(data).enter().append("rect").attr("class", "bar").attr("x", function(d) {
      return x(d.dateTime);
    }).attr("width", x.rangeBand()).attr("y", function(d) {
      return y(d[propertyName]);
    }).attr("height", function(d) {
      return height - y(d[propertyName]);
    }).on('mouseover', tip.show).on('mouseout', tip.hide);
  }
  return {get visualize() {
      return visualize;
    }};
});
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
  function createPatient(user, callback) {
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
              callback(ehrId, user.firstNames + ' ' + user.lastNames);
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
    get createPatient() {
      return createPatient;
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
System.registerModule("../../scripts/user", [], function() {
  "use strict";
  var __moduleName = "../../scripts/user";
  'use strict';
  var $__0 = System.get("../../scripts/ehr"),
      createMedicalData = $__0.createMedicalData,
      loadWeights = $__0.loadWeights,
      loadPulses = $__0.loadPulses;
  var User = function User($__3) {
    var $__5;
    var $__4 = $__3,
        ehrId = $__4.ehrId,
        firstNames = $__4.firstNames,
        lastNames = $__4.lastNames,
        gender = $__4.gender,
        dateOfBirth = $__4.dateOfBirth,
        medicalData = ($__5 = $__4.medicalData) === void 0 ? [] : $__5;
    this.ehrId = ehrId;
    this.firstName = firstNames;
    this.lastName = lastNames;
    this.gender = gender;
    this.dateOfBirth = dateOfBirth;
    this.weights = [];
    this.pulses = [];
    this.temperatures = [];
  };
  ($traceurRuntime.createClass)(User, {
    loadMedicalData: function($__3) {
      var $__5,
          $__6,
          $__7;
      var $__4 = $__3,
          weightsCallback = ($__5 = $__4.weightsCallback) === void 0 ? false : $__5,
          pulsesCallback = ($__6 = $__4.pulsesCallback) === void 0 ? false : $__6,
          temperaturesCallback = ($__7 = $__4.temperaturesCallback) === void 0 ? false : $__7;
      var $__1 = this;
      if (weightsCallback) {
        loadWeights(this.ehrId, (function(weights) {
          $__1.weights = weights;
          weightsCallback($__1);
        }));
      }
      if (pulsesCallback) {
        loadPulses(this.ehrId, (function(pulses) {
          $__1.pulses = pulses;
          pulsesCallback($__1);
        }));
      }
    },
    addMedicalData: function($__3) {
      var $__4 = $__3,
          dateTime = $__4.dateTime,
          bodyWeight = $__4.bodyWeight,
          pulse = $__4.pulse,
          bodyTemperature = $__4.bodyTemperature;
      if (bodyWeight) {
        this.weights.push({
          dateTime: dateTime,
          bodyWeight: bodyWeight
        });
      }
      if (pulse) {
        this.pulses.push({
          dateTime: dateTime,
          pulse: pulse
        });
      }
      if (bodyTemperature) {
        this.temperatures.push({
          dateTime: dateTime,
          bodyTemperature: bodyTemperature
        });
      }
      createMedicalData(this.ehrId, {
        dateTime: dateTime,
        bodyWeight: bodyWeight,
        pulse: pulse,
        bodyTemperature: bodyTemperature
      });
    }
  }, {});
  return {get User() {
      return User;
    }};
});
System.registerModule("../../scripts/app", [], function() {
  "use strict";
  var __moduleName = "../../scripts/app";
  'use strict';
  var User = System.get("../../scripts/user").User;
  var visualize = System.get("../../scripts/chart").visualize;
  var loadPatient = System.get("../../scripts/ehr").loadPatient;
  var App = function App() {
    this.users = {};
    this.selectedUser = {};
  };
  ($traceurRuntime.createClass)(App, {
    selectUser: function(ehrId) {
      var $__3 = this;
      if (!this.users[ehrId]) {
        loadPatient(ehrId, (function(data) {
          data.ehrId = ehrId;
          var user = new User(data);
          $__3.users[ehrId] = user;
          $__3.selectedUser = user;
          $__3.renderUser();
          user.loadMedicalData({weightsCallback: function(user) {
              visualize(user.weights, "bodyWeight");
            }});
        }));
      } else {
        this.selectedUser = this.users[ehrId];
        this.renderUser();
      }
    },
    renderUser: function() {
      var user = this.selectedUser;
      $('#userName').html(user.firstName + ' ' + user.lastName);
      visualize(user.weights, "bodyWeight");
    }
  }, {});
  return {get App() {
      return App;
    }};
});
System.registerModule("../../scripts/generator", [], function() {
  "use strict";
  var __moduleName = "../../scripts/generator";
  'use strict';
  var createPatient = System.get("../../scripts/ehr").createPatient;
  function generatePatients(callback) {
    $.getJSON('data/patients.json', function(data) {
      var users = data;
      var ehrIds = [];
      for (var i = 0,
          len = users.length; i < len; i++) {
        var user = users[i];
        console.log(user);
        createPatient(user, (function(ehrId, name) {
          ehrIds.push({
            ehrId: ehrId,
            name: name
          });
          callback(ehrIds);
        }));
      }
    });
  }
  return {get generatePatients() {
      return generatePatients;
    }};
});
System.registerModule("../../scripts/main.js", [], function() {
  "use strict";
  var __moduleName = "../../scripts/main.js";
  'use strict';
  var App = System.get("../../scripts/app").App;
  var generatePatients = System.get("../../scripts/generator").generatePatients;
  var ehrIds = [{
    ehrId: "e8beb87e-97db-4a38-b382-426936c85bd1",
    name: "John Smith"
  }, {
    ehrId: "9db12050-f1ed-4c68-a7b6-2135effa0407",
    name: "Codie Marshall"
  }, {
    ehrId: "24a0832d-12a7-4a34-86f4-4dc1b111ac25",
    name: "Chloe Pearson"
  }];
  var app = new App();
  var baseUrl = 'https://rest.ehrscape.com/rest/v1';
  var queryUrl = baseUrl + '/query';
  var username = "ois.seminar";
  var password = "ois4fri";
  function getSessionId() {
    var response = $.ajax({
      type: "POST",
      url: baseUrl + "/session?username=" + encodeURIComponent(username) + "&password=" + encodeURIComponent(password),
      async: false
    });
    return response.responseJSON.sessionId;
  }
  function submitForm() {
    var dateTime = new Date();
    var bodyWeight = $("#inputWeight").val();
    var pulse = $("#inputPulse").val();
    var bodyTemperature = $("#inputTemperature").val();
    if (!bodyWeight && !pulse && !bodyTemperature) {
      console.log("Required");
    }
    app.selectedUser.addMedicalData({
      bodyWeight: bodyWeight,
      pulse: pulse,
      bodyTemperature: bodyTemperature,
      dateTime: dateTime
    });
    app.renderUser();
  }
  function initUserLinks(ehrIds) {
    $('#userDivider').prevAll().remove();
    for (var i = 0,
        len = ehrIds.length; i < len; i++) {
      var $__2 = ehrIds[i],
          ehrId = $__2.ehrId,
          name = $__2.name;
      var $item = $('<li>').append($('<a>').attr('href', '#').attr('data-user', ehrId).text(name));
      $('#userDivider').before($item);
    }
  }
  $(function() {
    $.ajaxSetup({headers: {"Ehr-Session": getSessionId()}});
    initUserLinks(ehrIds);
    $(document).on('click', 'a[data-user]', function(e) {
      var ehrId = $(this).data('user');
      app.selectUser(ehrId);
    });
    $('#linkGenerate').click(function() {
      generatePatients((function(ehrIds) {
        initUserLinks(ehrIds);
      }));
    });
    $('#submitButton').click(submitForm);
  });
  return {};
});
System.get("../../scripts/main.js" + '');
