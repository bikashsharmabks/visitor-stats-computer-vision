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
                backgroundColor: 'rgba(15, 80, 198, 0.5)',
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

    
    var snapShotTimeStamp = Date.now();
    var $foundSmiles = $('#foundSmiles');
    var $viewing = $('#viewing');
    var $titleButton = $('#titleButton');

    var $visitors = $('#visitors');
    var pastVisitor;
    pastVisitor = parseInt(window.localStorage.getItem('pastVisitor'));
    
    if (isNaN(pastVisitor)) {
        pastVisitor = 0;
    }
    $visitors.text(pastVisitor);

    $titleButton.click(function() {
        pastVisitor = 1;
        window.localStorage.setItem('pastVisitor', pastVisitor);
        $visitors.text(pastVisitor);
    });
    
    
    $foundSmiles.fadeOut('fast');
    var isSmiling = false;
    var faces = [];

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
        if (data.viewing >=0) {

            //*********************************************
            //currently viewing visitors
            $viewing.text(data.viewing);
            //*********************************************

            //*********************************************
            //total number of visit count
            //HACK refresh the pastvistor every 20 seconds
            pastVisitor = parseInt($visitors.text());

            if (Date.now() - snapShotTimeStamp > 20 * 1000) {
                pastVisitor = parseInt($visitors.text());
                snapShotTimeStamp = Date.now();
            }  else {
                pastVisitor = parseInt($visitors.text()) - data.viewing;
            }

            var visitors = pastVisitor + data.viewing;
            window.localStorage.setItem('pastVisitor', visitors);
            $visitors.text(visitors);
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
            if (!isSmiling) {
                isSmiling = true;
                $foundSmiles.fadeIn('fast');
                $foundSmiles.delay(5000).fadeOut('slow', function() {
                    isSmiling = false;
                });
            }
        }
        //**************************************************

        //**************************************************
        //Display faces with smile
        if (data.face) {

            if (faces.length == 3) {
                faces.pop();
                // place face on index 1 or on top
                faces.splice(0, 0, data.face);
            } else {
                faces.push(data.face);
            }

            if (faces[0])
                $("#face1").attr('src', 'data:image/png;base64,' + faces[0]);
            if (faces[1])
                $("#face2").attr('src', 'data:image/png;base64,' + faces[1]);
            if (faces[2])
                $("#face3").attr('src', 'data:image/png;base64,' + faces[2])

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