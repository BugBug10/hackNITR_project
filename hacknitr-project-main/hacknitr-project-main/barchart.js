chrome.storage.local.get("tabInfo").then((result) => {
    console.log("tab info");
    console.log(result.tabInfo);

    var tabInfo = result.tabInfo;
    var x_axis = [];
    var y_axis = [];
    for (var key in tabInfo) {
        x_axis.push(key);
        y_axis.push(tabInfo[key]);
    }

    console.log(x_axis);
    console.log(y_axis);

    var chartElement = document.getElementById('chart').getContext('2d');
    var chart = new Chart(chartElement, {
        type: 'bar',
        data: {
            labels: x_axis,
            datasets: [{
                label: 'time spent on different sites',
                data: y_axis,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderWidth: 1
            }]
        }
    });
});