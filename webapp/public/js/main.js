/*******************************************************************************
 * (c) Copyright HCL Technologies Ltd. 2018.  MIT Licensed!
 *******************************************************************************/

/**
 * Client application entry point
 * @author Mattias Mohlin
 */

$(function () {
    var socket = io();    

    socket.on('averageTemperature', function(msg) {
        $('#temp-label').text("Average temperature: " + msg._data + " ºC");
    });
    socket.on('sensorConfiguration', function(msg) {
        $('td').remove();
        let html = '';
        msg._data.sensors.forEach(sensor => {
            let status = 'Active';
            if (!sensor.active)
                status = 'Suspended';
            let alarm = sensor.alarm ? 'ALARM<img src="/flame"/>' : '';
            html += '<tr><td>' + sensor.sensorId + '</td><td>' + status + '</td><td class="red">' + alarm + '</td></tr>';
        });
        $('#sensorTable tr:last').after(html);
    });

    $('#request_data').click(function() {
        socket.emit('request_data');
    });
});