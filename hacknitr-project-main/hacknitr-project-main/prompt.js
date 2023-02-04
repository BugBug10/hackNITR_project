//getting the current tab 
current_site = background.js.getTab(); 

//checking whether tab is one of pre existing tab options  
not_prod_bool = not(isProductiveSite(current_site));
not_unprod_bool = not(isUnproductiveSite(current_site));

//prompting the user to classify 
if (not_prod_bool && not_unpord_bool){
    //set up buttons in the extension (3 options)
    const button_1 = document.createElement("button"); 
    button_1.textContent = "prod";
    button_1.classList.add("chrome-extension-button");
}