chrome.runtime.onMessage.addListener(function (response, sender, sendResponse) {
  console.log("Received message");

  if (response.greeting == "deficit greeting") {
    console.log("deficit event triggered in content.js");
    alert("Friendly Reminder: Your unproductive time has exceeded your productive time. Get back to work!");
  }
  if (response.greeting == "prompt greeting") { //changed from prompt greeting
    console.log("prompt event triggered in content.js");
    console.log(document);
    console.log("doc height should be printed ^");
    alert("This website is not labeled as productive or nonproductive. Please add it using the extension if you want to use it.");
    document.body.prepend(x);
  }
});

console.log("page has content!")

function addElement() {
  // create a new div element
  console.log("!!!!!!!!!!!!!!!!!!!!!!!addElement is Executed");
  const newDiv = document.createElement("div");

  // and give it some content
  const newContent = document.createTextNode("Hi there and greetings!");
  //newContent.style.position = "absolute";
  //newContent.style.top = "10";
  // add the text node to the newly created div
  newDiv.appendChild(newContent);
  console.log("last line executed");
  return newDiv;
  //document.append("testing append")
  // add the newly created element and its content into the DOM
  //const currentDiv = document.getElementById("div1");

  //document.body.insertBefore(newDiv, currentDiv);
}
