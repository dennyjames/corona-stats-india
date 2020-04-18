// Set new default font family and font color to mimic Bootstrap's default styling
Chart.defaults.global.defaultFontFamily = 'Nunito', '-apple-system,system-ui,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif';
Chart.defaults.global.defaultFontColor = '#858796';
var globalStateData;


$.get("/all", function (data, status) {

    globalStateData=data;
    data.map(i=>
    {
        i.activeCases=parseInt(i.case_count)-(parseInt(i.recovered_count)+parseInt(i.death_count));
        i.totalCases= parseInt(i.case_count);
        i.recoveredCases=parseInt(i.recovered_count);
        i.deathCases=parseInt(i.death_count);
        return i;
    });
    let totalData = data.filter(i=> i.state==='All India');
    document.getElementById("totalCases").innerHTML = totalData[0].case_count;
    document.getElementById("recoveredCases").innerHTML = totalData[0].recovered_count;
    document.getElementById("deathCases").innerHTML = totalData[0].death_count;
    if(totalData[0].totaldelta !=0)
        document.getElementById("totalCasesDelta").innerHTML=`(+${totalData[0].totaldelta})`;
    if(totalData[0].recovereddelta !=0)
        document.getElementById("recoveredCasesDelta").innerHTML=`(+${totalData[0].recovereddelta})`;
    if(totalData[0].deathdelta !=0)
        document.getElementById("deathCasesDelta").innerHTML=`(+${totalData[0].deathdelta})`;

    let stateData =  data.filter(i=> i.state!=='All India').slice(0,20);
    let lables = stateData.map(i => i.state);
    let activeCases = stateData.map(i => parseInt(i.case_count) - (parseInt(i.death_count) + parseInt(i.recovered_count)));
    let recoveredCases = stateData.map(i => parseInt(i.recovered_count));
    let deaths = stateData.map(i => parseInt(i.death_count));

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
    let stateDataForTable =  data.filter(i=> i.state!=='All India').map(i=>
    {
        i.mortalityRate = ((i.death_count/i.case_count)*100).toFixed(2) +'%';
        if(i.totaldelta !=0)
            i.case_count= i.case_count +`\n(+${i.totaldelta})`;
        if(i.recovereddelta !=0)
            i.recovered_count= i.recovered_count +`\n(+${i.recovereddelta})`;
        if(i.deathdelta !=0)
            i.death_count= i.death_count +`\n(+${i.deathdelta})`;
        return i;
    })

    var table = new Tabulator("#state-table", {
        data:stateDataForTable,           //load row data from array
        layout:"fitColumns",      //fit columns to width of table
        autoResize:false,
        responsiveLayout:true,  //hide columns that dont fit on the table
        tooltips:false,            //show tool tips on cells
        movableColumns:false,      //allow column order to be changed
        resizableRows:true,       //allow row order to be changed
        initialSort:[             //set the initial sort order of the data
            {column:"case_count", dir:"desc"},
        ],
        columns:[                 //define the table columns
            {title:"State", field:"state",minWidth:90,formatter:"textarea"},
            {title:"Total", field:"case_count", hozAlign:"left",minWidth:50,cssClass:"total-column-blue",
                sorter:  function(a, b, aRow, bRow, column, dir, sorterParams){
                    return aRow._row.data.totalCases - bRow._row.data.totalCases;
                },formatter:"textarea"},
            {title:"Active", field:"activeCases", hozAlign:"left",minWidth:50,cssClass:"active-column-yellow",responsive:2},
            {title:"Recovered", field:"recovered_count", hozAlign:"left",minWidth:50, cssClass:"recvrd-column-green",
                sorter:  function(a, b, aRow, bRow, column, dir, sorterParams){
                    return aRow._row.data.recoveredCases - bRow._row.data.recoveredCases;
                },formatter:"textarea"},
            {title:"Deaths", field:"death_count", hozAlign:"left",minWidth:50, cssClass:"death-column-red",
                sorter:  function(a, b, aRow, bRow, column, dir, sorterParams){
                    return aRow._row.data.deathCases - bRow._row.data.deathCases;
                },formatter:"textarea"},
            {title:"Mortality", field:"mortalityRate", hozAlign:"left",responsive:3,minWidth:100,},
        ],
    });

    $('input[type=search]').on('search', function () {
        updateFilter();
    });

    document.getElementById("state-filter-value").addEventListener("keyup", updateFilter);
    function updateFilter() {
        let typValue =   document.getElementById("state-filter-value").value;
        table.setFilter(customFilter,typValue);
    }
    function customFilter(data, filterParams){
        var regex = /^[a-zA-Z ]*$/;
         if(typeof (filterParams)!='string' || !filterParams.match(regex))
        {
            return true;
        }
        return data.state.toLowerCase().includes (filterParams.toLowerCase()) ; //must return a boolean, true if it passes the filter.
    }

    $('#customSwitches').change(function() {
      if($(this).is(':checked'))
      {
          $('#customSwitchesText').html("Table");
          $('#state-div-title').html("Statewise Status Chart (Top 20)");
          $('#state-table-div').hide();
          $('#state-chart-div').show();
      }
      else
      {
          $('#customSwitchesText').html("Chart");
          $('#state-div-title').html("Statewise Status");
          $('#state-table-div').show();
          $('#state-chart-div').hide();
      }
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
                borderColor: '#2e59d9',
                data:  data[0].data.map(i=>i.f2),
                fill:false,
                borderWidth:2,
                pointRadius:0
            },
            {
                label: 'Active',
                borderColor: '#edc915',
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



        });

//donut
        let donutCtx = document.getElementById('donutChart').getContext('2d');
        let doughnut = new Chart(donutCtx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [
                        globalStateData[0].case_count,
                        globalStateData[0].recovered_count,
                        globalStateData[0].death_count
                    ],
                    backgroundColor: ['#2e59d9','#23ba6a','#bf2424'
                    ],
                }],
                labels: [
                    'Active','Recovered,','Death'
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    position: 'bottom',
                    labels: {
                        generateLabels: function(chart) {
                            var data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map(function(label, i) {
                                    var meta = chart.getDatasetMeta(0);
                                    var ds = data.datasets[0];
                                    var arc = meta.data[i];
                                    var custom = arc && arc.custom || {};
                                    var getValueAtIndexOrDefault = Chart.helpers.getValueAtIndexOrDefault;
                                    var arcOpts = chart.options.elements.arc;
                                    var fill = custom.backgroundColor ? custom.backgroundColor : getValueAtIndexOrDefault(ds.backgroundColor, i, arcOpts.backgroundColor);
                                    var stroke = custom.borderColor ? custom.borderColor : getValueAtIndexOrDefault(ds.borderColor, i, arcOpts.borderColor);
                                    var bw = custom.borderWidth ? custom.borderWidth : getValueAtIndexOrDefault(ds.borderWidth, i, arcOpts.borderWidth);

                                    // We get the value of the current label
                                    var value = chart.config.data.datasets[arc._datasetIndex].data[arc._index];
                                    var total = chart.config.data.datasets[arc._datasetIndex].data.reduce((total,i) => parseInt(total)+parseInt(i));
                                    var percentage = ((value/total)*100).toFixed(2) + ' %';

                                    return {
                                        // Instead of `text: label,`
                                        // We add the value to the string
                                        text: label + " : " + value + ' ('+percentage+')',
                                        fillStyle: fill,
                                        strokeStyle: stroke,
                                        lineWidth: bw,
                                        hidden: isNaN(ds.data[i]) || meta.data[i].hidden,
                                        index: i
                                    };
                                });
                            } else {
                                return [];
                            }
                        }
                    }
                },

                animation: {
                    animateScale: true,
                    animateRotate: true
                }
            }
        });

        $( "#state-selector" ).change(function() {
            timeSeriesChart.config.data.datasets=[];
            timeSeriesChart.config.data.labels=[];
            let e = document.getElementById("state-selector");
            let selected = e.selectedIndex
            document.getElementById('timeSeriesChart-header').innerHTML='Spread Trend - '+data[selected].state;
            document.getElementById('donutChart-header').innerHTML='Case Distribution - '+data[selected].state;
            let label = data[selected].data.map(i=>i.f1);
            let dataset =
                [
                    {
                        label: 'Total Cases',
                        borderColor: '#2e59d9',
                        data:  data[selected].data.map(i=>i.f2),
                        fill:false,
                        borderWidth:2,
                        pointRadius:0
                    },
                    {
                        label: 'Active',
                        borderColor: '#edc915',
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
            reDrawDonut(e);
        });



        function reDrawDonut(selected)
        {

            doughnut.config.data.datasets[0].data=[];
            let selectedData = globalStateData.filter(i=>i.state===selected.value);
            if(selectedData.length=1) {
                let dataSetForDonut = [selectedData[0].totalCases,selectedData[0].recoveredCases,selectedData[0].deathCases]
                doughnut.config.data.datasets[0].data = dataSetForDonut;
                doughnut.update();
            }
        }
    });
});




	


