// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';



$.get("/all", function (data, status) {

    document.getElementById("totalCases").innerHTML = data[0].case_count;
    document.getElementById("recoveredCases").innerHTML = data[0].recovered_count;
    document.getElementById("deathCases").innerHTML = data[0].death_count;


});

$.get("/states", function (data, status) {

    let lables = data.map(i => i.state);
    let activeCases = data.map(i => parseInt(i.case_count) - (parseInt(i.death_count) + parseInt(i.recovered_count)));
    let recoveredCases = data.map(i => parseInt(i.recovered_count));
    let deaths = data.map(i => parseInt(i.death_count));

    let ctx = document.getElementById("myBarChart");
    let barChartData = {

        labels: lables,
        datasets: [
            {
                label: 'Active',
                backgroundColor: '#2e59d9',
                data:  activeCases
            },
            {
                label: 'Recovered',
                backgroundColor: '#23ba6a',
                data: recoveredCases
            },
            {
                label: 'Deceased',
                backgroundColor: '#bf2424',
                data: deaths
            }]

    };


    var myBarChart = new Chart(ctx, {
        type: 'horizontalBar',
        data: barChartData,
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 5,
                    right: 25,
                    top: 5,
                    bottom: 0
                }
            },

            legend: {
                labels:{
                    boxWidth:12,
                    fontStyle:'bold'
                }
            },
            tooltips: {
                mode: 'index',
                intersect: false,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,
                callbacks: {
                    title: function(tooltipItems, data) {
                        var sum = 0;
                        tooltipItems.forEach(function(tooltipItem) {
                            sum += data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                        });
                        return 'Total Cases : ' + sum;
                    },
                }
            },
            responsive: true,
            scales: {
                xAxes: [{
                    stacked: true,

                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        maxTicksLimit: 6

                    },

                }
                ],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        callback: function (value) {
                            if (value.length > 7)
                                return value.substr(0, 7).concat('...');
                            else
                                return value;

                        },

                    },
                    maxBarThickness: 15,
                }]
            }
        }
    });

});

$.get("/timeseries", function (data, status) {


    const states =data.map(i=>i.state);
    $('#state-selector').empty();
    for(state of states)
    {
        $('#state-selector').append('<option  value="'+state+'">'+state+'</optoin>');
    }
    const labels = data[0].data.map(i=>i.f1);


   let datasets = [
       {
           label: 'Total Cases',
           borderColor: '#000',
           data:  data[0].data.map(i=>i.f2),
           fill:false,
           borderWidth:2,
           pointRadius:0
       },
        {
            label: 'Active',
            borderColor: '#2e59d9',
            data:   data[0].data.map(i=>i.f3),
            fill:false,
            borderWidth:2,
            pointRadius:0
        },
        {
            label: 'Recovered',
            borderColor: '#23ba6a',
            data:  data[0].data.map(i=>i.f4),
            fill:false,
            borderWidth:2,
            pointRadius:0
        },
       {
           label: 'Deceased',
           borderColor: '#bf2424',
           data:  data[0].data.map(i=>i.f5),
           fill:false,
           pointRadius:0
       }]
    let ctx = document.getElementById("timeSeriesChart");

    var timeSeriesChart =new Chart(ctx, {
        type: 'line',
        data:{
            labels:labels,
            datasets:datasets

        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: -10,
                    right: 5,
                    top: 5,
                    bottom: 0
                }
            },
              legend: {
                position: 'bottom',
                labels:{
                boxWidth:12,
                padding : 4,
                fontStyle:'bold',
                },
            },
            responsive: true,

            tooltips: {
                mode: 'index',
                intersect: false,
                titleFontColor: '#6e707e',
                titleFontSize: 14,
                backgroundColor: "rgb(255,255,255)",
                bodyFontColor: "#858796",
                borderColor: '#dddfeb',
                borderWidth: 1,
                xPadding: 15,
                yPadding: 15,


            },

            scales: {
                xAxes: [{
                    display: true,
                    gridLines: {
                        display: false,
                        drawBorder: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        minRotation:90,
                    },
                }],
                yAxes: [{
                    display: true,
                    ticks: {
                        minRotation:90,
                        maxTicksLimit: 4

                    },
                },
                ]
            }
        }



    })


    $( "#state-selector" ).change(function() {
        timeSeriesChart.config.data.datasets=[];
        timeSeriesChart.config.data.labels=[];
        document.getElementById('timeSeriesChart-header').innerHTML='Spread Trend - '
        let e = document.getElementById("state-selector");
        let selected = e.selectedIndex
        document.getElementById('timeSeriesChart-header').innerHTML='Spread Trend - '+data[selected].state;
        let label = data[selected].data.map(i=>i.f1);
        let dataset =
            [
                {
                    label: 'Total Cases',
                    borderColor: '#000',
                    data:  data[selected].data.map(i=>i.f2),
                    fill:false,
                    borderWidth:2,
                    pointRadius:0
                },
                {
                    label: 'Active',
                    borderColor: '#2e59d9',
                    data:   data[selected].data.map(i=>i.f3),
                    fill:false,
                    borderWidth:2,
                    pointRadius:0
                },
                {
                    label: 'Recovered',
                    borderColor: '#23ba6a',
                    data:  data[selected].data.map(i=>i.f4),
                    fill:false,
                    borderWidth:2,
                    pointRadius:0
                },
                {
                    label: 'Deceased',
                    borderColor: '#bf2424',
                    data:  data[selected].data.map(i=>i.f5),
                    fill:false,
                    borderWidth:2,
                    pointRadius:0
                }];
        timeSeriesChart.config.data.labels = label;
        timeSeriesChart.config.data.datasets = dataset;
        timeSeriesChart.update();
    });
});


	


