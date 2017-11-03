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

    var pastVisitor = 0;
    var snapShotTimeStamp = Date.now();
    var $viewing = $('#viewing');
    var $visitors = $('#visitors');
    var $foundSmiles = $('#foundSmiles');
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

            //*********************************************
            //currently viewing visitors
            $viewing.text(data.viewing);
            //*********************************************

            //*********************************************
            //total number of visit count
            //HACK refresh the pastvistor every 30 seconds
            if (Date.now() - snapShotTimeStamp > 30 * 1000) {
                pastVisitor = parseInt($visitors.text());
                snapShotTimeStamp = Date.now();
            }
            else {
                pastVisitor = parseInt($visitors.text()) - data.viewing;
            }

            if (pastVisitor < 0) {
                pastVisitor = 0
            }

            $visitors.text(pastVisitor + data.viewing);
            //*********************************************


            //*********************************************
            //Visitors trend chart
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
            //**********************************************

        }

        //**************************************************
        //Display Nice smile label
        if (data.smiling) {
            $foundSmiles.fadeIn('fast');
            $foundSmiles.text("Nice Smile!!!");
            $foundSmiles.delay(5000).fadeOut('slow', function() {
                $foundSmiles.text("");
            });
        }
        //**************************************************

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

    // $("#low").click(function() {
    //     ChangeRes(320, 240);
    // })

    // $("#norm").click(function() {
    //     ChangeRes(640, 480);
    // })

    // $("#hi").click(function() {
    //     ChangeRes(800, 600);
    // })

    //ChangeRes(800, 600);

});