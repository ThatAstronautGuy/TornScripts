// ==UserScript==
// @name         Torn Unread Mail Checker
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Uses the API to check how many unread mails you have
// @author       ThtAstronautGuy[1977683]
// @match        https://www.torn.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=torn.com
// @grant        GM_xmlhttpRequest
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @require      https://ajax.googleapis.com/ajax/libs/jquery/3.1.0/jquery.min.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @downloadURL  https://raw.githubusercontent.com/ThatAstronautGuy/TornScripts/refs/heads/main/TornUnreadMailChecker.js
// @updateURL    https://raw.githubusercontent.com/ThatAstronautGuy/TornScripts/refs/heads/main/TornUnreadMailChecker.js
// ==/UserScript==

/*
This script displays your unread mails count on your mail icon in Torn.

Tos:
Data storage: None
Data sharing: None
Purpose of use: Checking unread mails
Key Storage & Sharing: Stored in script variable and not shared
Key access level: Messages selection only. Custom link below.

To make a key use this custom link: https://www.torn.com/preferences.php#tab=api?step=addNewKey&user=messages&title=UnreadMailChecker
*/

const apiKey = '';
const periodToCheckInDays = 7;
const updateInterval = 60000; // Update interval in milliseconds. 60k is 1 minute.
const fromTimeStamp = Math.floor((Date.now() - periodToCheckInDays * 24 * 60 * 60 * 1000) / 1000);
const lastCheck = GM_getValue("unreadMailCheckTimestamp", 0);
const currentTime = Math.floor(Date.now());
const debugEnabled = false;
var currentUnreadMails = GM_getValue("currentUnreadMails", 0);

let counterStyle = `
.amount_unreadMails {
    color: red;
    letter-spacing: 0;
    text-align: center;
    text-shadow: var(--sidebar-account-link-text-shadow);
    width: 20px;
    font-family: Arial,Helvetica,sans-serif;
    font-size: 10px;
    font-weight: 700;
    line-height: 120%;
    position: absolute;
    top: 3px;
    right: 40px;
}
`

GM_addStyle(counterStyle);

if(debugEnabled){
    console.log("Last check: " + lastCheck);
    console.log("Current time: " + currentTime);
}

if(currentTime - updateInterval > lastCheck && !document.location.href.match(/\/page\.php\?sid\=attack/)){
    if(debugEnabled){
        console.log("Updating mail count");
    }
    GM_setValue("unreadMailCheckTimestamp", currentTime);
    getUnreadMails();
}
else {
    if(debugEnabled){
        console.log("Mail count refreshed recently");
    }
    waitForKeyElements('[class*="messages___"]', insertCount);
}

function getUnreadMails(){
    GM_xmlhttpRequest({
        method: "GET",
        url: "https://api.torn.com/v2/user/messages?from=" + fromTimeStamp + "&comment=UnreadMailScript",
        headers: {
            "Accept": "application/json",
            "Authorization": "ApiKey " + apiKey
        },
        onload: function(response) {
            var jsonResponse = JSON.parse(response.responseText);
            var unreadMails = 0;

            jsonResponse.messages.forEach((message) => {
                if(!message.read){
                    unreadMails++;
                };
            });

            if(debugEnabled){
                console.log("Unread mails: " + unreadMails);
            }
            currentUnreadMails = unreadMails;
            GM_setValue("currentUnreadMails", unreadMails);
            waitForKeyElements('[class*="messages___"]', insertCount);
        }
    });
};

function insertCount(){
    var parent = document.querySelector('[class*="messages___"]');
    var newElement = document.createElement('span');
    newElement.textContent = currentUnreadMails;
    newElement.className = 'amount_unreadMails'
    parent.prepend(newElement);
}
