'use strict';

import { App } from './app';
import { generatePatients } from './generator';

var app = new App();
var ehrIds = [
    {
        ehrId: "b93da6db-66b5-4635-bf1f-096a04b58800",
        name: "John Smith"
    }, {
        ehrId: "cbd05021-8ea4-4af0-ba41-73abaebc68a2",
        name: "Codie Marshall"
    }, {
        ehrId: "325619ee-e0db-4387-a421-47f63ebf3df1",
        name: "Chloe Pearson"
    }
];

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
    var $userDivider = $('#userDivider');
    $userDivider.prevAll().remove();

    for (let i = 0, len = ehrIds.length; i < len; i++) {
        var { ehrId, name } = ehrIds[i];
        let $item = $('<li>')
            .append($('<a>')
                .attr('href', '#')
                .attr('data-user', ehrId)
                .text(name)
        );
        $userDivider.before($item);
    }
}
