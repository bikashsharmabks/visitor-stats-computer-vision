$(document).ready(function() {

    var trends = {
        labels: [],
        data: []
    }

    var chart = new Chart('myChart', {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: trends.labels,
            datasets: [{
                label: "Traffic",
                backgroundColor: 'rgba(0, 155, 202, 0.5)',
                borderColor: '#009bca',
                data: trends.data
            }]
        },

        // Configuration options go here
        options: {
            legend: {
                display: false,
            },
            scales: {
                xAxes: [{
                    ticks: {
                        display: false
                    }
                }],
                yAxes: [{
                    ticks: {
                        display: false
                    }
                }]
            }
        }
    });


    var $viewing = $('#viewing');
    var host = window.location.host;
    var ws = new WebSocket('ws://' + host + '/ws');
    console.log(ws)
    ws.onopen = function() {
        // $message.attr("class", 'label label-success');
        // $message.text('open');
        console.log('open')
    };
    ws.onmessage = function(ev) {

        var data = JSON.parse(ev.data);
        if (data.viewing) {
            $viewing.fadeIn("slow");
            $viewing.text(data.viewing);

            var lastViewing = trends.data[trends.data.length - 1];
            if (lastViewing !== data.viewing) {

                if (trends.data.length >= 20) {
                    trends.labels.shift();
                    trends.data.shift();
                }
                var curDate = new Date()
                trends.labels.push(curDate.toLocaleTimeString());
                trends.data.push(data.viewing);
                chart.update();
            }

        }

    };
    ws.onclose = function(ev) {};
    ws.onerror = function(ev) {
        console.log('err')
        console.log(ev);
    };


    // $(':checkbox').checkboxpicker();

    function ChangeRes(w, h) {
        var data = new FormData();
        data.append('width', w);
        data.append('height', h);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', '/setparams', true);
        xhr.send(data);
    }

    $("#low").click(function() {
        ChangeRes(320, 240);
    })

    $("#norm").click(function() {
        ChangeRes(640, 480);
    })

    $("#hi").click(function() {
        ChangeRes(800, 600);
    })

    ChangeRes(1366, 786);

});