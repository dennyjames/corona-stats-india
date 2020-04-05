// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';
var defaultLegendClickHandler = Chart.defaults.global.legend.onClick;

function getBoxWidth(labelOpts, fontSize) {
    return labelOpts.usePointStyle ?
        fontSize * Math.SQRT2 :
        labelOpts.boxWidth;
};

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
                    maxBarThickness: 18
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

                        }

                    }
                }]
            }
        }
    });

});

$.get("/timeseries", function (data, status) {

    const labels = data[0].data.map(i=>i.f1);
    const dataSets =[];

    data.forEach(
        (item)=>
        {
            const datSet={};
            datSet.label=item.state;
            datSet.fill = false;
            datSet.data =item.data.map(i=>i.f2);
            datSet.pointRadius=2;
            datSet.pointStyle ='circle';
            datSet.pointBorderColor = '#bf1927';
            if(datSet.label !== 'All India') {
                datSet.hidden = true;
            }
            else {
                datSet.hidden = false;
                datSet.borderColor ='#587ae0';
            }
            dataSets.push(datSet);

        }
    );

    let ctx = document.getElementById("timeSeriesChart");

    var timeSeriesChart =new Chart(ctx, {
        type: 'line',
        data:{
            labels:labels,
            datasets:dataSets

        },
        options: {
            maintainAspectRatio: false,
            layout: {
                padding: {
                    left: 5,
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
                onClick: newLegendClickHandler
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
                    scaleLabel: {
                        display: true,
                        labelString: 'Date'
                    },
                    ticks: {
                        maxTicksLimit: 8,
                        maxRotation:30,
                    },
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Total Cases'
                    }
                }]
            }
        }



    })

   function newLegendClickHandler(e, legendItem) {
        let isIndia = dataSets[legendItem.datasetIndex].label==='All India';
        let indiaIndex = 0;
       let ci = this.chart;
         if(!isIndia){

            let meta1=    ci.getDatasetMeta(indiaIndex);
             meta1.hidden = true;
             let meta2=    ci.getDatasetMeta(legendItem.datasetIndex);
             meta2.hidden = meta2.hidden === null ? !ci.data.datasets[legendItem.datasetIndex].hidden : null;
             //defaultLegendClickHandler(e, legendItem);

        }
         else
         {
             let meta1=    ci.getDatasetMeta(indiaIndex);
             meta1.hidden = meta1.hidden === null ? !ci.data.datasets[indiaIndex].hidden : null;
         }
       ci.update();
    };

});
	


