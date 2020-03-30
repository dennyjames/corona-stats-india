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
                data: activeCases
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
                yPadding: 15
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
	


