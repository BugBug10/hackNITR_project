var options = {
  type: "basic",
  title: "friendly reminder: get back to work!",
  message: "your unproductive time has exceeded your productive time.",
  iconUrl: "images/reg_icon.png"
};

// IZZY EDITS 
chrome.notifications.create(options, callback);

function callback() {
  console.log('Popup done!')
}
var options = {
  type: "basic",
  title: "friendly reminder: get back to work!",
  message: "your unproductive time has exceeded your productive time.",
  iconUrl: "images/reg_icon.png"
};


chrome.notifications.create(options, callback);

function callback() {
  console.log('Popup done!')
}

//function callback() {
  //console.log('Popup done!')
//}
//function showNotification() {
 // chrome.notifications.create('test', {
   // type: "basic",
    //title: "get back to work!",
    //message: "your unproductive times is greater than your productive time.",
    //iconUrl: "images/reg_icon.png",
    //priority: 2
  //});
//}

//showNotification();
