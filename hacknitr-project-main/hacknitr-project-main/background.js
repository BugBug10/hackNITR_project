//service worker, can listen to events
chrome.runtime.onInstalled.addListener(() => {
  start_time = new Date();
  startTimer();
});

var productive_sites = ["canvas.cornell.edu", "mail.google.com", "drive.google.com", "docs.google.com",
  "stackoverflow.com", "github.com", "leetcode.com", "w3schools.com"];
var unproductive_sites = ["twitter.com", "facebook.com", "reddit.com",
  "instagram.com", "netflix.com", "hulu.com", "hbomax.com", "disneyplus.com", "youtube.com"];
let prod_time = 0; //seconds
let unprod_time = 0; //seconds
let prev_date = null;
let curr_site = null;
let temp_site = null;
let start_time = null;
let end_time = null;
let time_spent = 0;
let prod_mult_factor = 1;
let unprod_mult_factor = 1;
let gen_event_target = new EventTarget();
const deficit_event = new Event("deficit");
var BUTTONTEXT = "Start";
var add_site_paused = false;
var focus_mode_on = false;
let old_site = null;
let level = 0;

var tabInfo = {};

chrome.storage.local.set({ recordButtonText: BUTTONTEXT });
const prompt_event = new Event("prompt");
var lastPromptURL = null;

gen_event_target.addEventListener('deficit', async () => {
  console.log("deficit event triggered");
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  const response = await chrome.tabs.sendMessage(tab.id, { greeting: "deficit greeting" });
}, false);

gen_event_target.addEventListener('prompt', async () => {
  console.log("prompt event triggered");
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  // console.log("tab.url: ");
  // console.log(await tab.url);
  // console.log("lastPromptURL");
  // console.log(await lastPromptURL);
  // console.log("temp_site");
  // console.log(await temp_site);
  // console.log("curr_site");
  // console.log(await curr_site);
  if (tab.url == lastPromptURL && old_site == tab.url/*&& temp_site == curr_site*/) {
    //curr_site = temp_site;
    console.log("promp listener bool cond is wrong :(");

    //temp=true_curr != curr 
    return; //oishii twitter oishii doesn't work
  } else {
    lastPromptURL = tab.url;
    old_site = curr_site;
    const response = await chrome.tabs.sendMessage(tab.id, { greeting: "prompt greeting" });
    console.log("prompt event triggered end%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
  }
}, false);

// setting the values initially
chrome.storage.local.set({ prodTime: prod_time })
chrome.storage.local.set({ unprodTime: unprod_time })
chrome.storage.local.set({ prodSites: productive_sites })
chrome.storage.local.set({ unprodSites: unproductive_sites })
chrome.storage.local.set({ tabInfo: tabInfo })
chrome.storage.local.set({ isPaused: add_site_paused })
chrome.storage.local.set({ isFocused: focus_mode_on })
chrome.storage.local.set({ currSite: temp_site }) //what's the right inputtt????
chrome.storage.local.set({ Level: level })

chrome.storage.onChanged.addListener(function (changes, areaName) {
  if (changes.prodSites != null) {
    productive_sites = changes.prodSites.newValue
  }

  if (changes.unprodSites != null) {
    unproductive_sites = changes.unprodSites.newValue
  }
  if (changes.isPaused != null) {
    add_site_paused = changes.isPaused.newValue
    console.log("isPaused changed---------------------------------- to: ")
    console.log(add_site_paused)
  }

  if (changes.isFocused != null) {
    focus_mode_on = changes.isFocused.newValue
  }
});


async function update() {
  console.log("update is being called");
  let temp_site = await getTab();
  if (temp_site == null) {
    return;
  }

  console.log(temp_site);
  if (curr_site != temp_site) {
    end_time = new Date();
    time_spent = timeCalculator(start_time, end_time);
    updateTime(time_spent, isProductiveSite(curr_site));

    if (curr_site != null && time_spent != 0) {
      var new_site = curr_site.match(/[\w]+\.[\w]+/);
      if (tabInfo[new_site] != null) {
        tabInfo[new_site] = tabInfo[new_site] + time_spent;
      } else {
        tabInfo[new_site] = time_spent;
      }
      chrome.storage.local.set({ tabInfo: tabInfo });
    }
    curr_site = temp_site;
    start_time = end_time;
    console.log("unprod_time = " + unprod_time);
    console.log("prod_time = " + prod_time);
    deficit();
  }
}

function deficit() {
  console.log("points (called in deficit) = " + points());
  if ((points() <= 0) && !(isProductiveSite(curr_site) == true)) {
    console.log("if loop points<=0");
    gen_event_target.dispatchEvent(deficit_event);
    console.log("event dispatched");
  }
}

function deficit_spam(isProd) {
  if (points() <= 0 && (isProd == false && focus_mode_on)) {//how should focus mode factor in on this?
    let curr_time = new Date().getSeconds();
    if (curr_time % 5 == 0) {

      gen_event_target.dispatchEvent(deficit_event);
    }
  }
}

function points() {
  let points = prod_time * prod_mult_factor - unprod_time * unprod_mult_factor;
  return points;
}

// need to check if has url
function isProductiveSite(site, is_true_curr_site) {
  if (site == null) {
    return null;
  }

  let prod_filter = productive_sites.filter(item => site.match(item) != null);
  let unprod_filter = unproductive_sites.filter(item => site.match(item) != null);
  if (prod_filter.length > 0) { return true; }
  else if (unprod_filter.length > 0) { return false; }
  else {
    if (add_site_paused || !is_true_curr_site) { return null; }
    else {
      console.log("paused is off and switched sites so should ask promptTimeType()");

      return promptTimeType(site);
    }
  }//add more to handle null?
}


function promptTimeType(site) { //promise?
  //open modal box (run html)
  gen_event_target.dispatchEvent(prompt_event);
  console.log("prompt event dispatched in promptTimeType()");
}

function addSite(site, productive) {
  // match www something com
  if (!site.match("www.*com")) {
    return;
  }

  let domain = site.substring(site.indexOf("www") + 4, site.indexOf("com") + 3);
  if (productive) {
    productive_sites.push(domain);
    chrome.storage.local.set({ prodSites: productive_sites }).then(() => {
      //console.log("Prod sites is set to: " + productive_sites);
    });
  } else {
    unproductive_sites.push(domain);
    chrome.storage.local.set({ unprodSites: unproductive_sites }).then(() => {
      //console.log("Prod sites is set to: " + unproductive_sites);
    });
  }
}

function removeSite(site, productive) {
  if (!site.match("www.*com")) {
    return;
  }

  if (productive) {
    productive_sites = productive_sites.filter(item => item.match(site) == null);
    chrome.storage.local.set({ prodSites: productive_sites }).then(() => {
      //console.log("Prod sites is set to: " + productive_sites);
    });
  } else {
    unproductive_sites = unproductive_sites.filter(item => item.match(site) == null);
    chrome.storage.local.set({ unprodSites: unproductive_sites }).then(() => {
      //console.log("Prod sites is set to: " + unproductive_sites);
    });
  }
}

function timeCalculator(in_time, out_time) {
  let sh = in_time.getHours();
  let sm = in_time.getMinutes();
  let ss = in_time.getSeconds();
  let eh = out_time.getHours();
  let em = out_time.getMinutes();
  let es = out_time.getSeconds();

  let diffh = eh - sh;
  let diffm = em - sm;
  let diffs = es - ss;
  let time_spent = diffh * 3600 + diffm * 60 + diffs
  return time_spent;
}

function updateTime(time_spent, is_prod) {
  //update_tab()
  if (is_prod) {
    prod_time += time_spent;
  }
  else {
    unprod_time += time_spent;
  }

  chrome.storage.local.set({ prodTime: prod_time }).then(() => {
    //console.log("Prod time is set to: " + prod_time);
  });

  chrome.storage.local.set({ unprodTime: unprod_time }).then(() => {
    //console.log("Unprod time is set to: " + unprod_time);
  });
}

// check current tab repeatedly
async function getTab() {
  let tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true })

  if (tabs == null || tabs.length < 1) {
    return;
  }

  let url = tabs[0].url;
  chrome.storage.local.set({ currSite: url });

  // use `url` here inside the callback because it's asynchronous!
  return url;
}

function startTimer() {
  console.log("start timer");
  setInterval(update, 1000);
}

var options = {
  type: "basic",
  title: "get back to work!",
  message: "your unproductive times is greater than your productive time.",
  iconUrl: "images/reg_icon.png"
};

chrome.notifications.create('test', options);

// IZZZZYYYYYYY EDITTTTTTTT
// chrome.storage.local.set({ amtofmoney: money_piggybank })
chrome.notifications.create(options, callback);

function callback() {
  console.log('Popup done!');
}
