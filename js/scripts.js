var ctx = document.getElementById('myChart').getContext('2d');
var chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'line',

    // The data for our dataset
    data: {
        // This data is not dynamic
        labels: ['14:30', '14:31', '14:32', '14:33', '14:34', '14:35', '14:36', '14:37', '14:38', '14:39', ],
        datasets: [{
            label: 'Automate 1',
            backgroundColor: 'rgb(255, 255, 255, 0)',
            borderColor: 'rgb(rgb(38, 45, 71))',
            data: [0, 10, 5, 20, 30, 45, 32, 11, 22, 50]
        }]
    },

    // Configuration options go here
    options: {}
});