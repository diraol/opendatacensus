var buildSeriesChart = function(chartData){

    $('#chart1').highcharts({
        chart: {
            type: 'spline',
            spacingBottom: 5,
            spacingTop: 5,
            spacingLeft: 5,
            spacingRight: 5,
            width: '593',
            animation: false
        },
        title: {
            text: 'See your performance on relative indicators'
        },
        xAxis: {
            categories: chartData.categories
        },
        plotOptions: {
            series: {
                connectNulls: true,
                animation: false

            },
        },
        credits: {
            enabled: false
        },
        series: chartData.series
    });

}

$(document).ready(function(){
    window.print();
})
