'use strict';

import { createPatient } from './ehr';

export function generatePatients(callback) {
    $.getJSON('data/patients.json', function (data) {
        var users = data;
        var ehrIds = [];

        for (let i = 0, len = users.length; i < len; i++) {
            let user = users[i];

            console.log(user);

            createPatient(user, (ehrId, name) => {
                ehrIds.push({ehrId, name });
                callback(ehrIds);
            });
        }
    });
}
