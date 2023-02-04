console.log("popup script");

const siteElementId = ["prodSiteLabel", "prodSiteList", "unprodSiteLabel", "unprodSiteList"];
var difficultyValue = 50;
const img_array_level = ["images/pig.png", "images/pig_level1(extra).png", "images/pig_level2(extra).png", "images/pig_level3.png", "images/pig_level4.png", "images/pig_level5.png"];
var temp = 0;
var money_total = 0

function getTimeText(seconds) {
    if (seconds < 60) {
        return seconds + " sec(s)";
    }
    var minute = Math.floor(seconds / 60);
    return minute + " min, " + (seconds - minute * 60) + " sec(s)";
}

function updateTimeLabels() {
    chrome.storage.local.get("prodTime").then((result) => {
        var prodTime = result.prodTime;
        if (prodTime == null) {
            prodTime = 0;
        }
        console.log("prodTime currently is " + prodTime);
        document.getElementById("prod-time").innerHTML = getTimeText(prodTime);
        //convert productive time into money and add to the piggy bank 60sec=$1
        if (prodTime != 0) {
            chrome.storage.local.get("difficultyValue").then((result) => {
                if (result.difficultyValue == null) {
                    difficultyValue = 50;
                } else {
                    difficultyValue = result.difficultyValue;
                }

                //make productive time into float with 2 places after decimal 
                var money = (prodTime / difficultyValue).toFixed(2);
                var new_money = "$" + money
                document.getElementById("amtofmoney").innerHTML = new_money;
                document.getElementById("difficultyRange").value = difficultyValue;
                document.getElementById("difficultyValue").innerHTML = difficultyValue;
            });
        }

        if ((prodTime == 10 && prodTime != temp) || (prodTime == 25 && prodTime != temp) || (prodTime == 60 && prodTime != temp) || (prodTime == 500 && prodTime != temp) || (prodTime == 1000 && prodTime != temp) || (prodTime == 10000 && prodTime != temp)) {
            temp = prodTime;
            chrome.storage.local.get("Level").then((result) => {
                var level = result.Level;
                if (level == null) {
                    Level = 0;
                    level = 0;
                }
                var new_level = level + 1;
                if (new_level > 5) {
                    new_level = 5;
                }
                chrome.storage.local.set({ Level: new_level });

                document.getElementById("pig").src = img_array_level[new_level]//img_array_level[1]
            });
        }
    });

    chrome.storage.local.get("unprodTime").then((result) => {
        var unprodTime = result.unprodTime;
        if (unprodTime == null) {
            unprodTime = 0;
        }
        console.log("unprodTime currently is " + unprodTime);
        document.getElementById("unprod-time").innerHTML = getTimeText(unprodTime);
    });
}

updateTimeLabels()
setInterval(updateTimeLabels, 1000)

chrome.storage.local.get("isFocused").then((result) => {
    document.getElementById("focusSwitch").checked = result.isFocused;
    if (result.isFocused) {
        document.getElementById("focusBadge").style.display = "inline-block";
        var intervalID = setInterval(updateFocusTime, 1000)
        chrome.storage.local.set({ intervalID: intervalID });
    } else {
        document.getElementById("focusBadge").style.display = "none";
    }
});

chrome.storage.local.get("isPaused").then((result) => {
    document.getElementById("pauseAddSiteSwitch").checked = result.isPaused;
});

function getSiteContent(sites, productive) {
    let note = productive ? "p" : "up"
    var listContent = "";
    var id = 0;
    for (var link of sites) {
        var deleteIcon = "<img src=\"images/trash.png\" class=\"trashImg\" id=\"trash-" + note + id + "\" />"
        listContent += "<li class=\"list-group-item\"> <a href=https://" + link + " target=\"_blank\" >" + link + "</a>" + deleteIcon + "</li>";
        id++;
    }
    return listContent;
}

chrome.storage.local.get("prodSites").then((result) => {
    var prodSites = result.prodSites;
    console.log("prodSites currently is " + prodSites);

    if (prodSites.length == 0) {
        return;
    }

    document.getElementById("prodSiteLabel").innerHTML = "Productive Sites";
    document.getElementById("prodSiteList").innerHTML = getSiteContent(prodSites, true);

    for (var i = 0; i < prodSites.length; i++) {
        var trashImg = document.getElementById("trash-p" + i);

        if (!(trashImg == null)) {
            trashImg.addEventListener('click', function (event) {
                let id = event.target.id;
                id = id.substring(id.indexOf("p") + 1);
                chrome.storage.local.get("prodSites").then(() => {
                    var updatedProdSites = result.prodSites;
                    var head = updatedProdSites.splice(0, id);
                    updatedProdSites.splice(0, 1);
                    updatedProdSites = head.concat(updatedProdSites);

                    chrome.storage.local.set({ prodSites: updatedProdSites }).then(() => {
                        console.log("Prod sites is set to: " + updatedProdSites);
                    });
                });
            });
        }
    }
});

chrome.storage.local.get("unprodSites").then((result) => {
    var unprodSites = result.unprodSites;
    console.log("unprodSites currently is " + unprodSites);

    if (unprodSites.length == 0) {
        return;
    }

    document.getElementById("unprodSiteLabel").innerHTML = "Unproductive Sites";
    document.getElementById("unprodSiteList").innerHTML = getSiteContent(unprodSites, false);

    for (var i = 0; i < unprodSites.length; i++) {
        var trashImg = document.getElementById("trash-up" + i);

        if (!(trashImg == null)) {
            trashImg.addEventListener('click', function (event) {
                let id = event.target.id;
                id = id.substring(id.indexOf("up") + 2);
                chrome.storage.local.get("unprodSites").then(() => {
                    var updatedUnprodSites = result.unprodSites;
                    var head = updatedUnprodSites.splice(0, id);
                    updatedUnprodSites.splice(0, 1);
                    updatedUnprodSites = head.concat(updatedUnprodSites);

                    console.log(head);
                    console.log(id);
                    console.log(updatedUnprodSites);
                    chrome.storage.local.set({ unprodSites: updatedUnprodSites }).then(() => {
                        console.log("Unprod sites is set to: " + updatedUnprodSites);
                    });
                });
            });
        }
    }
});

document.getElementById("addSiteSection").style.display = "none";
document.getElementById("difficultySection").style.display = "none";

// tempData saved for UI elements
var siteDomain = "";
var siteProductive = false;
var useCurrentSite = false;
var tempDifficultyValue = 50;

function updateFocusTime() {
    chrome.storage.local.get("elapsedTime").then((result) => {
        var focusTime = result.elapsedTime;
        chrome.storage.local.set({ elapsedTime: focusTime + 1 });
        document.getElementById("focusTime").innerHTML = getTimeText(focusTime);
    });
}


function addSite() {
    if (!siteDomain.match(".*\..*")) {
        alert("Invalid domain name for the added site. The domain name must have the format of domain name with corresponding ending, such as instagram.com");
        return;
    }

    if (siteProductive) {
        chrome.storage.local.get("prodSites").then((result) => {
            var sites = result.prodSites;
            sites.push(siteDomain);

            chrome.storage.local.set({ prodSites: sites }).then(() => {
                console.log("Prod sites is set to: " + sites);
            });
        });
    } else {
        chrome.storage.local.get("unprodSites").then((result) => {
            var sites = result.unprodSites;
            sites.push(siteDomain);

            chrome.storage.local.set({ unprodSites: sites }).then(() => {
                console.log("Unprod sites is set to: " + sites);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', function () {

    var detailButton = document.getElementById("detailButton");
    var detailButtonText = document.getElementById("detailButtonText");

    var siteElements = [];
    for (var item of siteElementId) {
        siteElements.push(document.getElementById(item));
    }

    for (var ele of siteElements) {
        ele.style.display = "none";
    }

    detailButton.addEventListener('click', function () {
        console.log(detailButtonText.innerHTML.toLowerCase());
        if (detailButtonText.innerHTML.toLowerCase() == "show") {
            detailButtonText.innerHTML = "Hide";
            for (var ele of siteElements) {
                ele.style.display = "block";
            }
        } else {
            detailButtonText.innerHTML = "Show";
            for (var ele of siteElements) {
                ele.style.display = "none";
            }
        }
    });

    var pauseAddButton = document.getElementById("pauseAddSiteButton");
    var focusButton = document.getElementById("focusButton");
    var toggleButton = document.getElementById("toggle_button_id");

    var addSiteButton = document.getElementById("addSiteButton");
    var addSection = document.getElementById("addSiteSection");
    addSiteButton.addEventListener('click', function () {
        addSiteButton.style.display = "none";
        addSection.style.display = "block";
    });

    var addSiteDomain = document.getElementById("addSiteDomain");
    addSiteDomain.addEventListener('input', function (event) {
        siteDomain = event.target.value;
    });

    var addProdSelection = document.getElementById("addProductiveSelection");
    addProdSelection.addEventListener('input', function () {
        siteProductive = addProdSelection.checked;
    });

    var addCurrentSite = document.getElementById("addCurrentSite");
    addCurrentSite.addEventListener('input', function () {
        useCurrentSite = addCurrentSite.checked;
        console.log("current site box checked /////////////")
        console.log(useCurrentSite);
    });

    var addSubmitButton = document.getElementById("addSubmitButton");
    addSubmitButton.addEventListener('click', function () {
        addSection.style.display = "none";
        addSiteButton.style.display = "inline";
        if (useCurrentSite) {
            chrome.storage.local.get("currSite").then((result) => {
                siteDomain = result.currSite;
                var url = siteDomain.match(/[\w]+\.[\w]+/)[0];
                siteDomain = url
                console.log("add site domain - " + siteDomain);
                addSite();
            });
        } else {
            addSite();
        }
    });

    var addCancelButton = document.getElementById("addCancelButton");
    addCancelButton.addEventListener('click', function () {
        siteDomain = "";
        siteProductive = false;
        addSiteDomain.value = "";
        addProdSelection.checked = false;
        addSection.style.display = "none";
        addSiteButton.style.display = "inline";
    });

    var difficultyRange = document.getElementById("difficultyRange");
    difficultyRange.addEventListener('input', function (event) {
        tempDifficultyValue = event.target.value;
        document.getElementById("difficultyValue").innerHTML = tempDifficultyValue + "(unsaved)";
    });

    var difficultySubmitButton = document.getElementById("difficultySubmitButton");
    difficultySubmitButton.addEventListener('click', function () {
        difficultyValue = tempDifficultyValue;
        chrome.storage.local.set({ difficultyValue: difficultyValue }).then(() => {
            console.log("Difficulty value is set to: " + difficultyValue);
        });
        document.getElementById("difficultyValue").innerHTML = difficultyValue;
    });

    var reportButton = document.getElementById("reportButton");
    reportButton.addEventListener('click', function () {
        window.open("barchart.html", '_blank').focus();
    });

    var difficultySection = document.getElementById("difficultySection");
    var difficultyButtonText = document.getElementById("difficultyButtonText");
    var difficultyButton = document.getElementById("difficultyButton");

    difficultyButton.addEventListener('click', function () {
        if (difficultyButtonText.innerHTML.toLowerCase() == "show more") {
            console.log("show");
            difficultyButtonText.innerHTML = "Hide"
            difficultySection.style.display = "block";
        } else {
            console.log("hide");
            difficultyButtonText.innerHTML = "Show More"
            difficultySection.style.display = "none";
        }
    });

    var pauseSwitch = document.getElementById("pauseAddSiteSwitch");
    pauseSwitch.addEventListener('click', function () {
        togglePause();
    });

    var focusSwitch = document.getElementById("focusSwitch");
    focusSwitch.addEventListener('click', function () {
        toggleFocus();
    });

    function togglePause() {
        // Get the checkbox
        var checkBox = document.getElementById("pauseAddSiteSwitch");

        // If the checkbox is checked, display the output text
        if (checkBox.checked == true) {
            console.log("pause button clicked!!!!!!!!!!!!!!!!!!!!!!!!!!!! on");
            chrome.storage.local.set({ isPaused: true })
        } else {
            console.log("pause button clicked!!!!!!!!!!!!!!!!!!!!!!!!!!!! off");
            chrome.storage.local.set({ isPaused: false })
        }
    }

    function toggleFocus() {
        // Get the checkbox
        var checkBox = document.getElementById("focusSwitch");

        // If the checkbox is checked, display the output text
        if (checkBox.checked == true) {
            console.log("focus button clicked")
            document.getElementById("focusBadge").style.display = "inline-block"
            var intervalID = setInterval(updateFocusTime, 1000)
            chrome.storage.local.set({ isFocused: true, elapsedTime: 0, intervalID: intervalID });
        } else {
            console.log("focus button clicked");
            document.getElementById("focusBadge").style.display = "none"
            chrome.storage.local.set({ isFocused: false })
            chrome.storage.local.get("intervalID").then((result) => {
                clearInterval(result.intervalID);
            });
        }
    }

});
