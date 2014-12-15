'use strict';

import { App } from './app';
import { generatePatients } from './generator';

var app = new App();
var ehrIds = [
    {
        ehrId: "e8beb87e-97db-4a38-b382-426936c85bd1",
        name: "John Smith"
    }, {
        ehrId: "9db12050-f1ed-4c68-a7b6-2135effa0407",
        name: "Codie Marshall"
    }, {
        ehrId: "24a0832d-12a7-4a34-86f4-4dc1b111ac25",
        name: "Chloe Pearson"
    }
];


function submitForm() {
    var dateTime = new Date(); // current time
    var bodyWeight = $("#inputWeight").val();
    var pulse = $("#inputPulse").val();
    var bodyTemperature = $("#inputTemperature").val();

    if (!bodyWeight && !pulse && !bodyTemperature) {
        console.log("Required");
    }

    app.selectedUser.addMedicalData({ dateTime, bodyWeight, pulse, bodyTemperature });
    app.renderUser();
}

function initUserLinks(ehrIds) {
    $('#userDivider').prevAll().remove();

    for (let i = 0, len = ehrIds.length; i < len; i++) {
        var { ehrId, name } = ehrIds[i];
        let $item = $('<li>')
            .append($('<a>')
                .attr('href', '#')
                .attr('data-user', ehrId)
                .text(name)
        );
        $('#userDivider').before($item);
    }
}

$(function () {
    initUserLinks(ehrIds);

    $(document).on('click', 'a[data-user]', function (e) {
        var ehrId = $(this).data('user');
        app.selectUser(ehrId);
    });

    $('#linkGenerate').click(function () {
        generatePatients((ehrIds) => {
            initUserLinks(ehrIds);
        });
    });

    $('#submitButton').click(submitForm);
});
