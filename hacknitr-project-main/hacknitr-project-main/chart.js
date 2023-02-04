anychart.onDocumentReady(function() {

    // set the data
    chrome.storage.local.get("prodTime").then((result) => {
        let prodTime = result.prodTime;
        if (prodTime == null) {
            prodTime = 0;
        }

        chrome.storage.local.get("unprodTime").then((result) => {
            let unprodTime = result.unprodTime;
            if (unprodTime == null) {
                unprodTime = 0;
            }
            var data = [
                {
                    x: "productive", 
                    value: prodTime/(prodTime + unprodTime),
                    normal:  {fill: "#5ecc50"},
                }, 
                {
                    x: "unproductive", 
                    value: unprodTime/(prodTime + unprodTime),
                    normal:  {fill: "#f52707"},
                },
            ];

            // create the chart
            var chart = anychart.pie();

            // set the chart title
            chart.title("Productivity Time Analysis Chart");

            // add the data
            chart.data(data);

            // display the chart in the container
            chart.container('container');
            chart.draw();
        });
    });
});