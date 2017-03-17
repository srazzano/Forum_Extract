// ==UserScript==
// @name        Forum Extract for User Styles
// @version     1.2.7
// @description Filters out any unwanted listings on forum.
// @author      Sonny Razzano aka srazzano
// @namespace   srazzano
// @include     /https?://forum\.userstyles\.org.*/
// @require     https://raw.githubusercontent.com/srazzano/GM_devtools_Dialog/master/GM_devtools_Dialog.js
// @icon        https://raw.githubusercontent.com/srazzano/Images/master/extract.png
// @download    https://raw.githubusercontent.com/srazzano/Forum_Extract/master/Forum_Extract.user.js
// @support     srazzano@gmail.com
// @grant       GM_addStyle
// @grant       GM_getValue
// @grant       GM_setValue
// @grant       GM_setClipboard
// ==/UserScript==

/* jshint multistr:true */

var fe0 = "Empty", fe1 = "Change Case", fe2 = "Delete Keyword", fe3 = "(1) Separate multiple entries with <> and no spacing.\n(2) Middle click inserts active keywords.\n(3) Double click clears field.\n(4) \
Filter does not catch '+', '(' or ')'\n(5) Double click filtered/unfiltered button for menulist of keywords.";
var fe4 = "Case-Sensitive", fe5 = "Set Case", fe6 = "Create Filter", fe7 = "Removing from filter:\n";
var fe8 = "Highlight To Select:", fe9 = "", fe10 = "Filtered", fe11 = "Unfiltered", fe12 = "Case On", fe13 = "Case Off", fe14 = "Non Case-Sensitive", fe15 = "Show Notifications on hover", fe16 = "Case-Sensitive Filter Search";
var fe17 = "Forum Extract Options", fe18 = "Turn Off Auto Insert Highlighted Text", fe19 = "Turn On Auto Insert Highlighted Text", fe20 = "Ok", fe21 = "Del", fe22 = "Insert Off", fe23 = "Insert On";
var fe24 = "Bookmarked Discussions", fe25 = "Copy List", fe26 = "ideogram", fe27 = "AUTHOR KEYWORDS: ", fe28 = "TOPIC KEYWORDS: ", fe29 = "PROFILE KEYWORDS: ", fe30 = "THREAD KEYWORDS: ";
var fe31 = "Uncheck the box this filter doesn't apply to", fe32 = "Dark Theme", fe33 = "Custom Rating icons", fe34 = "Filter Threads", fe35 = "By: ", fe36 = "Topic", fe37 = "Author", fe38 = "Profile link", fe39 = "Content";
var fe40 = "Numbered Thread topics", fe41 = "Full Screen mode", fe42 = "Thread Filter in side panel", fe43 = "Options", fe44 = "My Bookmarks Page", fe45 = "no spam", fe46 = "English only", spam = /\d{9}/;
var url = window.location.href, mainPage = url.match(/https:\/\/forum\.userstyles\.org\/$/);
var indexPage = url.match(/https:\/\/forum\.userstyles\.org\/discussions/), catPage = url.match(/https:\/\/forum\.userstyles\.org\/categories/), discPage = url.match(/https:\/\/forum\.userstyles\.org\/discussion\/\d+\/.*$/);
var proMsgPage = url.match(/https:\/\/forum\.userstyles\.org\/(profile|messages)/);

(function () {

  "use strict";

  devtools.config.init({
    title: fe17,
    settings: {
      "itemCount": {
        type: "checkbox",
        label: fe40,
        defaultValue: false
      },
      "fullScreen": {
        type: "checkbox",
        label: fe41,
        defaultValue: false
      },
      "showFilter": {
        type: "checkbox",
        label: fe42,
        defaultValue: true
      },
			"showNotifications": {
        type: "checkbox",
        label: fe15,
        defaultValue: true
      },
			"darkTheme": {
        type: "checkbox",
        label: fe32,
        defaultValue: false
      },
			"customRatings": {
        type: "checkbox",
        label: fe33,
        defaultValue: false
      }
    },

    css: "\
#devtools-wrapper #devtools-dialog-devtools-config {width: 210px !important}\
#devtools-wrapper .dialog {-moz-user-select: none !important}\
#devtools-wrapper .dialog .dialog-title {cursor: default !important; margin: 0 0 12px 0 !important}\
#devtools-wrapper .dialog label {margin: 2px 0 !important}\
#devtools-wrapper .dialog input[type='checkbox'] {margin: 0 4px !important}\
.dialog-content span {position: relative !important; top: 4px !important}\
#devtools-wrapper .dialog .dialog-footer {margin: 4px 0 0 0 !important}\
#devtools-wrapper .dialog .dialog-footer button {padding: 0 4px!important}\
#devtools-wrapper .dialog .dialog-footer button img {margin: 0 4px 0 0 !important}\
#devtools-wrapper .dialog .dialog-footer button:first-child {display: none !important}\
.dialog-close {display: none !important}\
	  "}
	);

  function getInsertText() {
    var gB = GM_getValue("insertText") != false ? false : true, iB = $("#insBtn");
    GM_setValue("insertText", gB);
    if (gB) {
      $("#Content").addEventListener("mouseup", getActiveText, false);
      iB.setAttribute("class", "insertOn filterButton");
      iB.title = fe18;
      iB.textContent = fe23;
    } else {
      $("#Content").removeEventListener("mouseup", getActiveText, false);
      iB.setAttribute("class", "insertOff filterButton");
      iB.title = fe19;
      iB.textContent = fe22;
  } }

  function getCase() {
    GM_getValue("caseSensitive") != false ? GM_setValue("caseSensitive", false) : GM_setValue("caseSensitive", true);
    if (GM_getValue("caseSensitive")) {
      $("#caseBtn").textContent = fe12;
      $("#caseBtn").title = fe4;
      $("#caseBtn").setAttribute("class", "caseOn filterButton");
      $("#keywordIn").placeholder = fe4;
    } else {
      $("#caseBtn").textContent = fe13;
      $("#caseBtn").title = fe14;
      $("#caseBtn").setAttribute("class", "caseOff filterButton");
      $("#keywordIn").placeholder = fe14;
  } }

  function getKey(e) {
    var ki = $("#keywordIn");
    if (e.button == 1 && (mainPage || indexPage || catPage) && $("#cbAuthor").checked) ki.value = gvAuthor;
    if (e.button == 1 && (mainPage || indexPage || catPage) && $("#cbTopic").checked) ki.value = gvTopic;
    if (e.button == 1 && discPage && $("#cbProfile").checked) ki.value = gvProfile;
    if (e.button == 1 && discPage && $("#cbThread").checked) ki.value = gvThread;
  }

  function getListText() {
    if (!$("#listBox")) {
      if ((mainPage || indexPage || catPage) && $("#cbAuthor").checked && !$("#cbTopic").checked && GM_getValue("authorKeywords") != "")
        var listdiv = $c("td", {id:"listBox", innerHTML:fe27 + GM_getValue("authorKeywords").replace(/<>/g, "\u2022"), spellcheck:false});
      if ((mainPage || indexPage || catPage) && !$("#cbAuthor").checked && $("#cbTopic").checked && GM_getValue("topicKeywords") != "")
        var listdiv = $c("td", {id:"listBox", innerHTML:fe28 + GM_getValue("topicKeywords").replace(/<>/g, "\u2022"), spellcheck:false});
      if ((mainPage || indexPage || catPage) && $("#cbAuthor").checked && $("#cbTopic").checked && GM_getValue("authorKeywords") != "" && GM_getValue("topicKeywords") != "")
        var listdiv = $c("td", {id:"listBox", innerHTML:fe27 + GM_getValue("authorKeywords").replace(/<>/g, "\u2022") + "<br>" + fe28 + GM_getValue("topicKeywords").replace(/<>/g, "\u2022"), spellcheck:false});
      if (discPage && $("#cbProfile").checked && !$("#cbThread").checked && GM_getValue("profileKeywords") != "")
        var listdiv = $c("td", {id:"listBox", innerHTML:fe29 + GM_getValue("profileKeywords").replace(/<>/g, "\u2022"), spellcheck:false});
      if (discPage && !$("#cbProfile").checked && $("#cbThread").checked && GM_getValue("threadKeywords") != "")
        var listdiv = $c("td", {id:"listBox", innerHTML:fe30 + GM_getValue("threadKeywords").replace(/<>/g, "\u2022"), spellcheck:false});
      if (discPage && $("#cbProfile").checked && $("#cbThread").checked && GM_getValue("profileKeywords") != "" && GM_getValue("threadKeywords") != "")
        var listdiv = $c("td", {id:"listBox", innerHTML:fe29 + GM_getValue("profileKeywords").replace(/<>/g, "\u2022") + "<br>" + fe30 + GM_getValue("threadKeywords").replace(/<>/g, "\u2022"), spellcheck:false});
    }
    var head = $c("td", {id:"listHeader"});
    listdiv.insertBefore(head, listdiv.firstChild);
    document.body.appendChild(listdiv);
		var mb = document.body.querySelector('.MeBox');
		var fg = document.body.querySelector('#filterGrp');
		var val = mb.clientHeight + fg.clientHeight;
    GM_addStyle('#listBox{height:auto!important;padding:2px 8px!important;position:fixed!important;width:auto!important}');
		if (fullScreen) GM_addStyle('#listBox{left:auto!important;right:0!important;top:'+(val+45)+'px!important}');
		else GM_addStyle('#listBox{left:0!important;right:auto!important;top:'+(val+105)+'px!important}');
		$("#filterCnt").addEventListener("mouseout", function(){document.body.removeChild(listdiv)}, false);
    $("#listBox").addEventListener("mouseup", getText, false);
  }

  function setUnfiltered() {
    if ((mainPage || indexPage || catPage) && $("#cbAuthor").checked) {
      for (var i = 0; i < authorContent.length; i++) {
        if (authorContent[i].getAttribute("filtered")) {
          authorContent[i].parentNode.parentNode.parentNode.style.display = "block";
    } } }
    if ((mainPage || indexPage || catPage) && $("#cbTopic").checked) {
      for (var i = 0; i < topicContent.length; i++) {
        if (topicContent[i].getAttribute("filtered")) {
          topicContent[i].parentNode.parentNode.style.display = "block";
    } } }
    if (discPage && $("#cbProfile").checked) {
      for (var i = 0; i < profileContent.length; i++) {
        if (profileContent[i].getAttribute("filtered")) {
          profileContent[i].parentNode.parentNode.parentNode.parentNode.style.display = "block";
    } } }
    if (discPage && $("#cbThread").checked) {
      for (var i = 0; i < threadContent.length; i++) {
        if (threadContent[i].getAttribute("filtered")) {
          threadContent[i].style.display = "block";
  } } } }

  function setFiltered() {
    if ((mainPage || indexPage || catPage) && $("#cbAuthor").checked) {
      for (var i = 0; i < authorContent.length; i++) {
        if (authorContent[i].hasAttribute("filtered")) {
          authorContent[i].parentNode.parentNode.parentNode.style.display = "none";
    } } }
    if ((mainPage || indexPage || catPage) && $("#cbTopic").checked) {
      for (var i = 0; i < topicContent.length; i++) {
        if (topicContent[i].hasAttribute("filtered")) {
        topicContent[i].parentNode.parentNode.style.display = "none";
    } } }
    if (discPage && $("#cbProfile").checked) {
      for (var i = 0; i < profileContent.length; i++) {
        if (profileContent[i].hasAttribute("filtered")) {
          profileContent[i].parentNode.parentNode.parentNode.parentNode.style.display = "none";
    } } }
    if (discPage && $("#cbThread").checked) {
      for (var i = 0; i < threadContent.length; i++) {
        if (threadContent[i].hasAttribute("filtered")) {
          threadContent[i].style.display = "none";
  } } } }

  function copyKeywords() {
    var aaa = GM_getValue("topicKeywords"), bbb = GM_getValue("authorKeywords"), ccc = GM_getValue("profileKeywords"), ddd = GM_getValue("threadKeywords");
    var str = '\n' + fe28 + '\n' + aaa + '\n\n' + fe27 + '\n' + bbb + '\n\n' + fe29 + '\n' + ccc + '\n\n' + fe30 + '\n' + ddd;
    GM_setClipboard(str);
    alert('Copied to Clipboard\n\n' + str);
  }

	var itemCount = devtools.config.get("itemCount");
  var fullScreen = devtools.config.get("fullScreen");
  var showFilter = devtools.config.get("showFilter");
	var showNotifications = devtools.config.get("showNotifications");
	var darkTheme = devtools.config.get("darkTheme");
	var customRatings = devtools.config.get("customRatings");
  var menu = document.body.querySelector(".SiteMenu");
  var optBtn = $c("li", {id:"optBtn"});

  optBtn.appendChild($c("a", {title:fe43, textContent:fe43}, [{type:"click", fn:function(e){e.preventDefault(); devtools.config.open()}}]));
  menu.appendChild(optBtn);
  GM_addStyle("#optBtn:hover {cursor: pointer !important;}");

  if (itemCount) {
    var item = $(".Title", $("#Content"));
		var itemHead = $(".Item-Header", $("#Content"));
    for (var i = 0; i < item.length; i++) item[i].insertBefore($c("span", {className:"fSpan", textContent:i + 1 + "."}), item[i].firstChild);
		for (var j = 0; j < itemHead.length; j++) itemHead[j].insertBefore($c("span", {className:"fSpan", textContent:j + 1 + "."}), itemHead[j].firstChild);
  }

  if (!GM_getValue("cbAuthor")) GM_setValue("cbAuthor", false);
  if (!GM_getValue("cbTopic")) GM_setValue("cbTopic", false);
  if (!GM_getValue("cbProfile")) GM_setValue("cbProfile", false);
  if (!GM_getValue("cbThread")) GM_setValue("cbThread", false);

  if (!GM_getValue("authorKeywords")) GM_setValue("authorKeywords", "");
  if (GM_getValue("authorKeywords") == "undefined") GM_setValue("authorKeywords", "");
  if (GM_getValue("authorKeywords").indexOf("<>") == -1) GM_setValue("authorKeywords", GM_getValue("authorKeywords").replace(/,(?!\s)/g, "<>"));

  if (!GM_getValue("topicKeywords")) GM_setValue("topicKeywords", "");
  if (GM_getValue("topicKeywords") == "undefined") GM_setValue("topicKeywords", "");
  if (GM_getValue("topicKeywords").indexOf("<>") == -1) GM_setValue("topicKeywords", GM_getValue("topicKeywords").replace(/,(?!\s)/g, "<>"));

  if (!GM_getValue("profileKeywords")) GM_setValue("profileKeywords", "");
  if (GM_getValue("profileKeywords") == "undefined") GM_setValue("profileKeywords", "");
  if (GM_getValue("profileKeywords").indexOf("<>") == -1) GM_setValue("profileKeywords", GM_getValue("profileKeywords").replace(/,(?!\s)/g, "<>"));

  if (!GM_getValue("threadKeywords")) GM_setValue("threadKeywords", "");
  if (GM_getValue("threadKeywords") == "undefined") GM_setValue("threadKeywords", "");
  if (GM_getValue("threadKeywords").indexOf("<>") == -1) GM_setValue("threadKeywords", GM_getValue("threadKeywords").replace(/,(?!\s)/g, "<>"));

  if (!GM_getValue("insertText")) GM_setValue("insertText", false);
  var insertText = GM_getValue("insertText");

  if (!GM_getValue("showFilteredIndex")) GM_setValue("showFilteredIndex", false);
  var showFilteredIndex = GM_getValue("showFilteredIndex");

  if (!GM_getValue("showFilteredDisc")) GM_setValue("showFilteredDisc", false);
  var showFilteredDisc = GM_getValue("showFilteredDisc");

  if (!GM_getValue("caseSensitive")) GM_setValue("caseSensitive", false);
  var caseSensitive = GM_getValue("caseSensitive");

  var group = $c("div", {id:"filterGrp", className:'Box'});
  var title = $c("h4", {id:"filterTitle", textContent:fe34});
  var filterA = $c("div", {id:"filterA", className:"filterDiv"});
  var filterB = $c("div", {id:"filterB", className:"filterDiv"});
  var filter1 = $c("div", {id:"filter1", className:"filterDiv"});
  var filter2 = $c("div", {id:"filter2", className:"filterDiv"});
  var filterLabel = $c("label", {id:"filterLabel", className:"filterLabel", textContent:fe35});
  var checkbox1 = $c("input", {id:"cbTopic", type:"checkbox", className:"filterCheckbox", checked:GM_getValue("cbTopic")}, [{type:"click", fn:function(e){checkbox(e)()}}]);
  var label1 = $c("a", {id:"labelTopic", className:"filterLabel", textContent:fe36}, [{type:"click", fn:function(e){checkbox(e)()}}]);
	var checkbox2 = $c("input", {id:"cbAuthor", type:"checkbox", className:"filterCheckbox", checked:GM_getValue("cbAuthor")}, [{type:"click", fn:function(e){checkbox(e)()}}]);
  var label2 = $c("a", {id:"labelAuthor", className:"filterLabel", textContent:fe37}, [{type:"click", fn:function(e){checkbox(e)()}}]);
  var checkbox3 = $c("input", {id:"cbProfile", type:"checkbox", className:"filterCheckbox", checked:GM_getValue("cbProfile")}, [{type:"click", fn:function(e){checkbox(e)()}}]);
  var label3 = $c("a", {id:"labelProfile", className:"filterLabel", textContent:fe37}, [{type:"click", fn:function(e){checkbox(e)()}}]);
  var checkbox4 = $c("input", {id:"cbThread", type:"checkbox", className:"filterCheckbox", checked:GM_getValue("cbThread")}, [{type:"click", fn:function(e){checkbox(e)()}}]);
  var label4 = $c("a", {id:"labelThread", className:"filterLabel", textContent:fe39}, [{type:"click", fn:function(e){checkbox(e)()}}]);
  var okButton = $c("button", {id:"okBtn", className:"filterButton", title:fe6, textContent:fe20}, [{type:"click", fn:function() {genKey()}}]);
	var inputBox = $c("input", {id:"keywordIn", placeholder:fe4, title:fe3}, [{type:"click", fn:function(e) {getKey(e)}}]);
  var removeButton = $c("button", {id:"remBtn", className:"filterButton", title:fe2, textContent:fe21}, [{type:"click", fn:function() {remKey()}}]);
  var filterButton = $c("button", {id:"filterBtn", className:"filterButton", textContent:fe10}, [{type:"click", fn:function() {setFilter()}}]);
  var filterCount = $c("button", {id:"filterCnt", className:"filterButton", textContent:0}, [{type:"click", fn:function() {setFilter()}}]);
  var autoButton = $c("button", {id:"insBtn", className:"filterButton"}, [{type:"click", fn:function(){getInsertText()}}]);
  var caseButton = $c("button", {id:"caseBtn", className:"filterButton"}, [{type:"click", fn:function(){getCase()}}]);
  var copyButton = $c("button", {id:"copyBtn", className:"filterButton", textContent:fe25}, [{type:"click", fn:function() {copyKeywords()}}]);

  if (showFilter) {
    if (mainPage || indexPage || catPage) {
      filterA.appendChild(filterLabel);
      filterA.appendChild(checkbox1);
      filterA.appendChild(label1);
      filterA.appendChild(checkbox2);
      filterA.appendChild(label2);
      group.appendChild(title);
      group.appendChild(filterA);
    }
    if (discPage) {
      filterB.appendChild(filterLabel);
      filterB.appendChild(checkbox3);
      filterB.appendChild(label3);
      filterB.appendChild(checkbox4);
      filterB.appendChild(label4);
      group.appendChild(title);
      group.appendChild(filterB);
    }
    filter1.appendChild(okButton);
    filter1.appendChild(inputBox);
    filter1.appendChild(removeButton);
    filter2.appendChild(filterButton);
    filter2.appendChild(filterCount);
    filter2.appendChild(autoButton);
    filter2.appendChild(caseButton);
    filter2.appendChild(copyButton);
    group.appendChild(filter1);
    group.appendChild(filter2);
    var pane = $("#Panel");
		var boxFilter = document.querySelector(".BoxFilter");
		pane.insertBefore(group, boxFilter);
  }

  var title = document.querySelectorAll("span.DiscussionAboutListDiscussion");
  for (var i = 0; i < title.length; i++) {
		var res = title[i].textContent.indexOf('-');
		var str = title[i].textContent.substr(res+2);
		title[i].parentNode.replaceChild($c('a', {href:'https://userstyles.org/styles/browse?search_terms=' + str, textContent:title[i].textContent}), title[i]);
  }

	document.body.querySelector('a.HomeLink').href = 'https://userstyles.org/'; //'https://greasyfork.org/scripts';

  var names = [], undo = [], itemContent = $(".ItemContent"), listCnt = 0;
  var ki = $("#keywordIn");
  var authorNames = [], topicNames = [], profileNames = [], threadNames = [], undo = [];
  var authorContent = $(".ShowDiscussionAuthor");
  var topicContent = $(".Title");
  var profileContent = $(".ProfileLink");
  var threadContent = $(".Item");
  var gvAuthor = GM_getValue("authorKeywords"), aut = gvAuthor.split("<>");
  var gvTopic = GM_getValue("topicKeywords"), top = gvTopic.split("<>");
  var gvProfile = GM_getValue("profileKeywords"), pro = gvProfile.split("<>");
  var gvThread = GM_getValue("threadKeywords"), thr = gvThread.split("<>");

  if ((mainPage || indexPage || catPage) && showFilter) {
    if (GM_getValue("authorKeywords") == "" && GM_getValue("topicKeywords") == "") {
      if (showFilteredIndex) $("#filterBtn").textContent = fe10;
      else $("#filterBtn").textContent = fe11;
    }
    if ($("#cbAuthor").checked) {
      if (GM_getValue("authorKeywords") != "") {
        for (k = 0; k < aut.length; k++) authorNames.push(aut[k]);
        for (var x in authorNames)
        for (var i = 0; i < authorContent.length; i++) {
          var mod = authorNames[x].replace(/\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, "zqz");
          if (caseSensitive) var word = new RegExp(mod);
          else var word = new RegExp(mod, "i");
          if (authorContent[i].textContent.match(word) || authorNames[x] == fe26 && authorContent[i].textContent.match(/[\u4E00-\u9FFF]/)) {
            authorContent[i].setAttribute("filtered", true);
            authorContent[i].parentNode.parentNode.parentNode.setAttribute("filtered", true);
            authorContent[i].parentNode.parentNode.parentNode.style.display = "none";
            listCnt++
    } } } }
    if ($("#cbTopic").checked) {
      if (GM_getValue("topicKeywords") != "") {
        for (k = 0; k < top.length; k++) topicNames.push(top[k]);
        for (var x in topicNames)
        for (var i = 0; i < topicContent.length; i++) {
          var mod = topicNames[x].replace(/\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, "zqz");
          if (caseSensitive) var word = new RegExp(mod);
          else var word = new RegExp(mod, "i");
          if (topicContent[i].textContent.match(word) || topicNames[x] == fe26 && topicContent[i].textContent.match(/[\u4E00-\u9FFF]/) || topicNames[x] == fe45 && topicContent[i].textContent.match(spam)  || topicNames[x] == fe46 && topicContent[i].textContent.match(/[\u0080-\uFFFF]/)) {
            topicContent[i].setAttribute("filtered", true);
            topicContent[i].parentNode.parentNode.setAttribute("filtered", true);
            topicContent[i].parentNode.parentNode.style.display = "none";
            listCnt++
    } } } }
    if (showFilteredIndex) {
      $("#filterBtn").textContent = fe11;
      setUnfiltered();
    } else {
      $("#filterBtn").textContent = fe10;
      setFiltered();
    }
    if (!GM_getValue("cbAuthor") && !GM_getValue("cbTopic")) {
      $("#filterA").removeAttribute("active");
      $("#filter1").style.display = "none";
      $("#filter2").style.display = "none";
    } else {
      $("#filterA").setAttribute("active", "true");
      $("#filter1").style.display = "-moz-box";
      $("#filter2").style.display = "-moz-box";
  } }
  if (discPage && showFilter) {
    if (GM_getValue("profileKeywords") == "" && GM_getValue("threadKeywords") == "") {
      if (showFilteredDisc) $("#filterBtn").textContent = fe10;
      else $("#filterBtn").textContent = fe11;
    }
    if ($("#cbProfile").checked) {
      if (GM_getValue("profileKeywords") != "") {
        for (k = 0; k < pro.length; k++) profileNames.push(pro[k]);
        for (var x in profileNames)
        for (var i = 0; i < profileContent.length; i++) {
          var mod = profileNames[x].replace(/\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, "zqz");
          if (caseSensitive) var word = new RegExp(mod);
          else var word = new RegExp(mod, "i");
          if (profileContent[i].title.match(word) || profileNames[x] == fe26 && profileContent[i].textContent.match(/[\u4E00-\u9FFF]/)) {
            profileContent[i].setAttribute("filtered", true);
            profileContent[i].parentNode.parentNode.parentNode.parentNode.setAttribute("filtered", true);
            profileContent[i].parentNode.parentNode.parentNode.parentNode.style.display = "none";
            listCnt++
    } } } }
    if ($("#cbThread").checked) {
      if (GM_getValue("threadKeywords") != "") {
        for (k = 0; k < thr.length; k++) threadNames.push(thr[k]);
        for (var x in threadNames)
        for (var i = 0; i < threadContent.length; i++) {
          var mod = threadNames[x].replace(/\.,\?""!@#\$%\^&\*\(\)-_=\+;:<>\/\\\|\}\{\[\]`~]*/g, "zqz");
          if (caseSensitive) var word = new RegExp(mod);
          else var word = new RegExp(mod, "i");
          if (threadContent[i].textContent.match(word) || threadNames[x] == fe26 && threadContent[i].textContent.match(/[\u4E00-\u9FFF]/)) {
            threadContent[i].setAttribute("filtered", true);
            threadContent[i].style.display = "none";
            listCnt++
    } } } }
    if (showFilteredDisc) {
      $("#filterBtn").textContent = fe11;
      setUnfiltered();
    } else {
      $("#filterBtn").textContent = fe10;
      setFiltered();
    }
    if (!GM_getValue("cbProfile") && !GM_getValue("cbThread")) {
      $("#filterB").removeAttribute("active");
      $("#filter1").style.display = "none";
      $("#filter2").style.display = "none";
    } else {
      $("#filterB").setAttribute("active", "true");
      $("#filter1").style.display = "-moz-box";
      $("#filter2").style.display = "-moz-box";
  } }

	if (showFilter) {
    $("#filterCnt").textContent = listCnt;
		if (GM_getValue("caseSensitive")) {
		  $("#caseBtn").setAttribute("class", "caseOn filterButton");
      $("#caseBtn").textContent = fe12;
      $("#caseBtn").title = fe4;
    } else {
		  $("#caseBtn").setAttribute("class", "caseOff filterButton");
      $("#caseBtn").textContent = fe13;
      $("#caseBtn").title = fe14;
    }
    if (insertText) {
      $("#Content").addEventListener("mouseup", getActiveText, false);
      $("#insBtn").setAttribute("class", "insertOn filterButton");
      $("#insBtn").title = fe18;
      $("#insBtn").textContent = fe23;
    } else {
      $("#Content").removeEventListener("mouseup", getActiveText, false);
      $("#insBtn").setAttribute("class", "insertOff filterButton");
      $("#insBtn").title = fe19;
      $("#insBtn").textContent = fe22;
	  }
    $("#Content").addEventListener("mouseup", getActiveText, false);
    $("#keywordIn").addEventListener("dblclick", function() {$("#keywordIn").value = ""}, false);
	  $("#filterCnt").addEventListener("mouseover", function() {getListText();}, false);
	  $("#filterCnt").addEventListener("mouseout", function(){getListText();}, false);
		if (caseSensitive) ki.placeholder = fe4;
    else ki.placeholder = fe14;
		GM_addStyle("#Panel .FilterMenu li:first-child, .PanelInfo li:first-child {border-top: none !important;}");
	}

  if (proMsgPage) GM_addStyle("#filterGrp {display: none !important;}");

	if (showNotifications) {
		var box1 = document.querySelector('.MeMenu a[title="Notifications"]');
		var box2 = document.querySelector('.MeMenu a[title="Inbox"]');
		var box3 = document.querySelector('.MeMenu a[title="Bookmarks"]');
	  box1.parentNode.addEventListener('mouseover', function() {box1.click()}, false);
	  box2.parentNode.addEventListener('mouseover', function() {box2.click()}, false);
	  box3.parentNode.addEventListener('mouseover', function() {box3.click()}, false);
		GM_addStyle("\
      .MeMenu span:hover div.Flyout.FlyoutMenu {\
display: -moz-box !important;\
margin: -8px 0 0 4px !important;\
visibility: visible !important;\
z-index: 1001 !important;\
      }\
    ")
	}

  GM_addStyle("\
  div.Title br {\
    display: none !important;\
  }\
  #cbAuthor, #labelAuthor {\
//display: none !important;\
  }\
  #filterGrp *:not(input) {\
-moz-user-select: none !important;\
  }\
  #filterA, #filterB {\
background: transparent !important;\
border-top: 1px solid rgba(0, 0, 0, 0.1) !important;\
border-bottom: none !important;\
padding: 0 2px !important;\
  }\
  #filter1, #filter2 {\
margin: 6px 0 0 0 !important;\
width: 100% !important;\
  }\
  .filterLabel {\
cursor: pointer !important;\
margin: 4px 10px 0 0 !important;\
padding-left: 4px !important;\
//position: relative !important;\
//top: 1px !important;\
  }\
  #filterLabel {\
cursor: default !important;\
  }\
  h4#filterTitle {\
cursor: default !important;\
margin-bottom: 0 !important\
  }\
  #labelTopic, #labelProfile {\
margin: 4px 16px 0 0 !important;\
  }\
  .filterCheckbox {\
cursor: pointer !important;\
margin: 0 !important;\
position: relative !important;\
top: 2px !important;\
  }\
  .filterCheckbox:hover + a {\
color: #FF0084 !important;\
  }\
  #keywordIn {\
-moz-box-flex: 1 !important;\
margin: 1px 0 !important;\
  }\
  #filter2 > #filterBtn {\
-moz-box-flex: 1 !important;\
width: 80px !important;\
  }\
  #filter2 > #filterCnt {\
margin: 0 2px 0 -5px !important;\
  }\
  #filter2 > #insBtn {\
width: 78px !important;\
  }\
  #filter2 > #caseBtn {\
width: 78px !important;\
  }\
  #filter2 > #copyBtn {\
width: 78px !important;\
  }\
  .insertOn, .caseOn {\
box-shadow: 2px 2px 4px #000 !important;\
  }\
  #filter2 {\
-moz-box-pack: center !important;\
  }\
  #listBox, #Content li[filtered] {\
background: linear-gradient(#EEE, #CCC) rgba(0, 0, 0, 0) !important;\
border: none !important;\
border-radius: 3px !important;\
box-shadow: 0px 0px 3px rgba(0, 0, 0, .5) inset !important;\
  }\
  #Content li[filtered] .fSpan, #Content li[filtered] .Meta strong {\
background: #666 !important;\
border-radius: 3px !important;\
color: #FFF !important;\
  }\
  #Content li[filtered] .Meta strong {\
padding: 3px 6px !important;\
  }\
  li[filtered] .Meta a.Category {\
background: transparent !important;\
  }\
  #Content .Item {\
padding: 3px 8px 4px 10px !important;\
  }\
  #Content .fSpan {\
margin-left: -7px !important;\
padding: 0 4px !important;\
  }\
  #Content .rating-image {\
float: none !important;\
left: 0 !important;\
position: relative !important;\
top: 0 !important;\
  }\
  #Panel li a {\
display: block !important;\
  }\
  #Panel .FilterMenu li:first-child, .PanelCategories li:first-child {\
border-top: 1px solid rgba(0, 0, 0, 0.1) !important;\
  }\
  .PanelCategories li:first-child, .PanelCategories li:nth-last-child(2) {\
border-bottom: 1px solid rgba(0, 0, 0, 0.1) !important;\
  }\
  .Item-Header div {\
display: inline-block !important;\
  }\
  .Author {\
margin-right: 20px !important;\
  }\
  .edit, .delete {\
margin: 0 8px !important;\
  }\
  .Mine .CommentFlag {\
display: none !important;\
  }\
  .AttachFileLink > a {\
display: none !important;\
  }\
  div.AttachFileWrapper div.AttachFileLink div.CurrentUploader input[type='file'], #Form_Comment #UploadAttachment_1 {\
display: -moz-box !important;\
opacity: 1 !important;\
padding: 0 !important;\
  }\
  .Highlight, .Active {\
pointer-events: none !important;\
  }\
  .Item.Mine.ItemComment:hover .OptionsTitle {\
visibility: hidden !important;\
  }\
  .Options .OptionsMenu .Flyout:before, .Options .OptionsMenu .Flyout:after, .Options .ToggleFlyout.OptionsMenu > span {\
display: none !important;\
  }\
  body.Section-DiscussionList .Options .Flyout {\
right: -50px !important;\
top: 4px !important;\
  }\
  .Comment.Flyout.MenuItems, #Content .Flyout.MenuItems {\
background: none !important;\
border: none !important;\
box-shadow: none !important;\
//display: -moz-box !important;\
visibility: visible !important;\
  }\
  .Options .Flyout.MenuItems, .Options .Flyout.MenuItems * {\
background: none !important;\
border: none !important;\
color: #1E79A7 !important;\
display: inline !important;\
font-weight: bold !important;\
  }\
  .Options .Flyout.MenuItems > li > a:hover:hover, .Options .Flyout.MenuItems > li:hover > a {\
color: #FF0084 !important;\
  }\
  .Options .Flyout.MenuItems > li > a {\
padding: 0 4px !important;\
position: absolute !important;\
top: -5px !important;\
  }\
  .CategoryList .Options .Flyout.MenuItems {\
margin-right: 10px !important;\
  }\
  .CategoryList .Options .Flyout.MenuItems > li > a {\
position: static !important;\
  }\
  .Options .Flyout.MenuItems > li:nth-child(1) > a {\
right: 60px !important;\
  }\
  .Options .Flyout.MenuItems > li:nth-child(2) > a {\
right: 90px !important;\
  }\
  .Options .Flyout.MenuItems > li:nth-child(3) > a {\
right: 164px !important;\
  }\
  .Options .Flyout.MenuItems > li:nth-child(4) > a {\
right: 197px !important;\
  }\
  .Options .Flyout.MenuItems > li:nth-child(5) > a {\
right: 237px !important;\
  }\
  .Options .MItem.CommentQuote + span .Flyout.MenuItems > li > a {\
padding: 0 4px !important;\
position: absolute !important;\
top: -20px !important;\
  }\
  .Announcement .Options .Flyout.MenuItems > li:nth-child(1) > a {\
right: 60px !important;\
  }\
  .Announcement .Options .Flyout.MenuItems > li:nth-child(2) > a {\
right: 112px !important;\
  }\
  .Announcement .Options .Flyout.MenuItems > li:nth-child(3) > a {\
right: 142px !important;\
  }\
  .Announcement .Options .Flyout.MenuItems > li:nth-child(4) > a {\
right: 216px !important;\
  }\
  .Announcement .Options .Flyout.MenuItems > li:nth-child(5) > a {\
right: 249px !important;\
  }\
 .Announcement .Options .Flyout.MenuItems > li:nth-child(6) > a {\
right: 289px !important;\
  }\
  .MeMenu div.Flyout.FlyoutMenu {\
width: -moz-max-content !important;\
  }\
  button, input, #Body a.BigButton {\
color: #000 !important;\
margin: 0 2px !important;\
  }\
  #Panel button, #Panel input {\
padding: 2px 4px !important;\
  }\
  button:hover, input:hover, #Body a.BigButton:hover {\
color: #000 !important;\
  }\
  code, pre, #Frame > #Body code a, #Frame > #Body pre a {\
color: #000 !important;\
text-shadow: none !important;\
  }\
");

	if (fullScreen) {
    GM_addStyle("\
      #Head {\
background: #666 !important;\
height: 27px !important;\
padding: 2px !important;\
position: fixed !important;\
text-shadow: 1px 1px 2px #000 !important;\
top: 0 !important;\
width: 100% !important;\
z-index: 101 !important;\
      }\
      .Row {\
width: 100% !important;\
      }\
      #Body {\
margin: 30px 0 0 0 !important;\
      }\
      #Content {\
float: left !important;\
margin: 0 !important;\
padding-left: 4px !important;\
width: 80% !important;\
      }\
      #Panel {\
position: fixed !important;\
right: 0 !important;\
top: 33px !important;\
width: 19% !important;\
      }\
      .PageControls.Top {\
display: none !important;\
      }\
      #PagerBefore, #PagerAfter {\
right: 26% !important;\
position: fixed !important;\
top: 2px !important;\
z-index: 102 !important;\
      }\
      #Body #PagerBefore a:hover, #Body #PagerAfter a:hover {\
color: #000 !important;\
      }\
      #PagerBefore > span.Previous:after, #PagerBefore > a.Previous:after, #PagerAfter > span.Previous:after, #PagerAfter > a.Previous:after {\
content: ' Previous' !important;\
      }\
      #PagerBefore > span.Previous:after, #PagerAfter > span.Previous:after {\
font-size: 100% !important;\
      }\
      #PagerBefore > span.Next:before, #PagerBefore > a.Next:before, #PagerAfter > span.Next:before, #PagerAfter > a.Next:before {\
content: 'Next ' !important;\
      }\
      #PagerBefore > span.Next:before, #PagerAfter > span.Next:before {\
font-size: 100% !important;\
      }\
      .NumberedPager a, #Head li {\
background: linear-gradient(#EEE, #AAA) !important;\
border: 1px solid rgba(255, 255, 255, .1) !important;\
box-shadow: 2px 2px 4px rgba(0, 0, 0, .5) inset, 2px 2px 2px rgba(0, 0, 0, .5) !important;\
border-radius: 3px !important;\
color: #02475A !important;\
font-size: 100% !important;\
margin: 0 3px !important;\
padding: 2px 6px 0 6px !important;\
text-shadow: 0 1px 0 #FFF !important;\
      }\
      .NumberedPager span, .NumberedPager a.Highlight {\
background: none !important;\
border-color: transparent !important;\
box-shadow: none !important;\
color: #FFF !important;\
text-shadow: 1px 1px 2px #000 !important;\
      }\
      .NumberedPager a:not(.Highlight):hover, #Head li:hover {\
background: #FFF !important;\
border: 1px solid rgba(255, 255, 255, .1) !important;\
box-shadow: 2px 2px 4px rgba(0, 0, 0, .5) inset, 2px 2px 2px rgba(0, 0, 0, .5) !important;\
color: #000 !important;\
      }\
      .NumberedPager a.Highlight, .NumberedPager span.Previous, .NumberedPager a.Highlight + span.Next:hover {\
background: none !important;\
border-color: transparent !important;\
box-shadow: none !important;\
cursor: default !important;\
      }\
      .NumberedPager span.Ellipsis {\
cursor: default !important;\
      }\
      #Head .SiteMenu {\
position: relative !important;\
top: -1px !important;\
      }\
      #Head li a {\
color: #000 !important;\
font-size: 100% !important;\
text-decoration: none !important;\
      }\
      #Head .SiteSearch {\
float: none !important;\
position: fixed !important;\
top: 2px !important;\
right: 40px !important;\
      }\
      input#Form_Search {\
background: linear-gradient(#EEE, #AAA) !important;\
border: 1px solid rgba(255, 255, 255, .1) !important;\
border-radius: 3px !important;\
box-shadow: 2px 2px 4px rgba(0, 0, 0, .5) inset, 2px 2px 2px rgba(0, 0, 0, .5) !important;\
font-size: 100% !important;\
font-weight: bold !important;\
margin: 0 -5px 0 4 !important;\
padding: 3px 4px 0px 4px !important;\
text-shadow: 0 1px 0 #FFF !important;\
      }\
      input#Form_Search:hover, input#Form_Search:focus, input#Form_Search:active {\
background: #FFF !important;\
color: #000 !important;\
      }\
      #Head .SiteSearch #Form_Go {\
background: linear-gradient(#EEE, #AAA) !important;\
border: 1px solid rgba(255, 255, 255, .1) !important;\
border-radius: 3px !important;\
box-shadow: 2px 2px 4px rgba(0, 0, 0, .5) inset, 2px 2px 2px rgba(0, 0, 0, .5) !important;\
font-size: 100% !important;\
height: 26px !important;\
line-height: 16px !important;\
padding: 5px !important;\
position: fixed !important;\
right: 0 !important;\
text-shadow: 0 1px 0 #FFFFFF !important;\
top: 2px !important;\
width: 30px !important;\
      }\
      #Head .SiteSearch #Form_Go:hover {\
background: #FFF !important;\
      }\
      a.BigButton {\
float: right !important;\
      }\
      .MeBox .Flyout {\
left: inherit !important;\
width: 350px !important;\
      }\
      .MeBox .Flyout:before, .MeBox .Flyout:after {\
display: none !important;\
      }\
    ");
		var docWidth = document.defaultView.outerWidth, cont = $('#Content').clientWidth + 68, srchWidth = docWidth - cont;
    GM_addStyle("\
      #Head .SiteSearch #Form_Search {\
margin: 0 -5px 0 0 !important;\
width:" + srchWidth + "px !important;\
      }\
    ");
  } else {
    GM_addStyle("\
      #Body > .Row {\
width: 1120px !important;\
      }\
      #Body #Content {\
margin-left: 352px !important;\
      }\
      #Panel {\
width: 342px !important;\
      }\
      .MeBox .Flyout:before, .MeBox .Flyout:after {\
display: none !important;\
      }\
    ");
  }

	if (darkTheme) {
		GM_addStyle("\
      body, .FlyoutMenu, #Panel .FlyoutMenu li.Title, #Panel .FlyoutMenu li.Center, .MenuItems {\
background: #333 fixed !important;\
      }\
      body div {\
color: #999 !important;\
text-shadow: 1px 1px 0px #000 !important;\
      }\
      #Head {\
background: #333 fixed !important;\
      }\
      .MenuItems {\
-moz-appearance: none !important;\
padding: 0 !important;\
      }\
      .MenuItems hr {\
display: none !important;\
      }\
      #Body a:not(.Button):not(.NavButton) {\
color: #CCC !important;\
text-shadow: 1px 1px 1px #000 !important;\
      }\
      #Body a:not(.Button):not(.NavButton):hover {\
color: orange !important;\
      }\
      #Body .Title a[href*='search?q=']:hover, #Body .Title a[href*='search_terms=']:hover {\
color: yellow !important;\
      }\
      #Body span {\
color: #999 !important;\
text-shadow: 1px 1px 0px #000 !important;\
      }\
      #Content .Item, #Panel li, #Panel .FlyoutMenu li, #Panel .MenuItems li {\
background: rgba(255, 255, 255, .15) !important;\
border-bottom: 1px solid #000 !important;\
border-top: 1px solid #777 !important;\
      }\
      #Content .Item:hover, #Panel li:hover, #Panel .FlyoutMenu li:hover, #Panel .MenuItems li:hover {\
//background: linear-gradient(#555, #333) !important;\
background: rgba(255, 255, 255, .1) !important;\
      }\
      #Panel li.Active {\
background: rgba(255, 255, 255, .09) !important;\
      }\
      #Body #Panel li.Active > a {\
color: #FFF !important;\
      }\
      #Panel .PopList .Item {\
padding: 0 6px 0 2px !important;\
      }\
      #Panel .Item strong {\
margin: 0 12px 0 0 !important;\
      }\
      #Body .NumberedPager a:not(.Highlight) {\
color: #000 !important;\
text-shadow: 1px 1px 0px #FFF !important;\
      }\
      span.Tag {\
background: rgba(0, 0, 0, 0.6) !important;\
      }\
      #filterA, #filterB {\
border: none !important;\
      }\
      .filterCheckbox {\
top: 0px !important;\
      }\
      .Sprite16 {\
background: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAQCAYAAACm53kpAAACMUlEQVR42s1XsVLDMAy1s8DKZ8AdTDDxHe3U\
Y4CBsfwJZWSAgWNqv4NjgI2Bz2CFJUEKUu5FtR070B6+87lNJEt6elJs78xommaPljOaM5qH8viN5iPNB+/9h9vSIF8mvJLN1UjdJc1pSt8bpTktl6RwYJ438vO\
d5i29v9kSAI0A4At0OPB2srqoMgCrEBAeFO9oOSKhk5QzMu5J7gLf9V/nDXYuFhwHQnMpctMhFlgH8K81gTa9CHPmZ6HgE5FdKRNYhjet6zobhaqqvOrFAlLTKa\
BKk2D38lLzTzT3Q0YSu3I5nHJPQKrmgKDB22yAzS774HiUBVrvuQA46Atesr9AR9C5AVhbFnDQqj4EAgYPNepKSwjtCViTGGMsm9xPP5gqAC+0HocAyBivXDYa8\
BAINnh8NgYACX4t+7LnnCYntktSiAUs+El/dtRxNJLh1Rep7CIAmlULAgaqcvrcZik3+JAeANOgLzG5HgDGSE4/WANAdbExYsMLMQD271E5FLgD+opOlAH0c+Gg\
TGMMaEsggXYKiK4EQvQPoW/LwACQbGa2gcWAK+0BilRW8AaEXhMs/QqEALDdP+BTCIBffQW6z2AuABJ89xlUmpeeA1QPM6nHX7F/TcszgtLSFkoAfRp1DhDlIhZ\
g9kuMDzljqNplyZwKs/qToXw0JnsUPk8Jg5HeUfivBuwfpXksKUau/C4gyu1lyEE54OfGbfgyJDYGT3w5l6NRt0FR/DfX4W2Mb3Q9Sy/yYOD6AAAAAElFTkSuQm\
CC') no-repeat !important;\
      }\
      .SpNotifications {\
background-position: 0 0 !important;\
      }\
      .SpInbox {\
background-position: -16px 0 !important;\
      }\
      .SpBookmarks {\
background-position: -32px 0 !important;\
      }\
      .SpOptions {\
background-position: -48px 0 !important;\
      }\
      button, input, #Body a.BigButton, a.Button, a.NavButton {\
-moz-appearance: none !important;\
background: linear-gradient(#eee, #aaa) rgba(0, 0, 0, .3) !important;\
border: 1px solid rgba(255, 255, 255, 0.1) !important;\
box-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5) inset, 2px 2px 2px rgba(0, 0, 0, 0.5) !important;\
color: #000 !important;\
      }\
      button, input {\
padding: 4px 6px !important;\
      }\
      #Body a.BigButton {\
padding: 4px !important;\
      }\
      button:hover, input:hover, #Body a.BigButton:hover, a.Button:hover, a.NavButton:hover {\
background: #FFF !important;\
      }\
      #keywordIn {\
margin: 0 !important;\
      }\
      #filter2 > #filterCnt {\
margin: 0 2px 0 -5px !important;\
      }\
      #Content .fSpan {\
color: #CCC !important;\
      }\
      #Content .Item.New {\
background: rgba(255, 255, 255, .22) !important;\
      }\
      #Content .Item.Unread {\
background: rgba(255, 255, 255, .22) !important;\
      }\
      #Content .Item[filtered] {\
background: #410 !important;\
      }\
      #Content .Item[filtered] .fSpan {\
background: #410 !important;\
      }\
      .HasNew {\
padding: 0 4px !important;\
      }\
      .HasNew, #Body .HasNew > span {\
color: #000 !important;\
text-shadow: none !important;\
      }\
      blockquote.Quote, blockQuote.UserQuote, textarea {\
background: rgba(0, 0, 0, 0.2) !important;\
      }\
      blockquote.Quote, blockQuote.UserQuote {\
border-left: 4px solid rgba(0, 0, 0, 0.5) !important;\
      }\
      textarea {\
color: #FFF !important;\
      }\
      #Body span.Alert {\
background: #F00 !important;\
color: #FFF !important;\
text-shadow: none !important;\
      }\
      a.Bookmark, a.Bookmarked, a.Bookmarking {\
border-radius: 100% !important;\
vertical-align: middle !important;\
      }\
      a.Bookmark:hover, a.Bookmarked:hover, a.Bookmarking:hover {\
background-color: #FFF !important;\
      }\
    ")
	}

	if (customRatings) {
    GM_addStyle("\
      #Content .rating-image {\
background-size: cover !important;\
float: none !important;\
height: 15px !important;\
left: 0px !important;\
margin: 0 0px 0 6px !important;\
padding-left: 18px !important;\
position: relative !important;\
top: 0px !important;\
width: 0 !important;\
      }\
      #Content .rating-image[src='/images/report.png'] {\
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADkElEQVR42qVU/28TZRx+3u6u13Z0Y2LXIikQw4Yr0iVbA4ZB6ySNEiJZ0tSp\
MfrLMIthboADJChEIpluGiapw4AYzRhLXCQaREVhCHMbGIhELF+slG44OluRrteWu66tn7sW/4B5yXN3n+d58rzvve/nXvaGx/1oLHS7o9Jur9AJvACA6bU8V6bn+dkCz+sFjt45njROp+OKSAfPMRzq\
6fmxZWSymcpbBJF9WW/2r9uzoQo1LYBGq/gwnQVCUQlSOgeZIBExNZ1DrVWv6g8UF+Hy9ifTSzvPvkXlAOEqG6gv/83T5rWhfiMNVaIaB0biqFhYDkGrgUCjazkNbp85hT99u3H/cqw2Y0XHDyNjU+IO\
Ks+yrlrT6c1tLhfWbAEEk2rq+ykBz2obcmBIiCKCwSBude5Ew5Gj/wVdX1OLMzTt9f7QRmVs1uUwDW5udT0+k6DBm5Fs85Wxg1T62HuO8sFNrc4ZBZ0MRnKvXB1TyHdZyyOm/g9abY1oaAf0D6umo+dT\
WL7MDp2WQ1LOYigQw/iuV1E11KvqU0U8dLwOF3JCbs9k9AuiOlnP2iV7m92sFZ5tgMGmGi8E04gZbaiwzEJcBvZ/D+x7nqF9vl3VN7y9EhbNL1jV5k+dj9ztI2of2+FctGXX2tQ7Rd7tgLFGNd4Rkzhy\
uQq1NXMRigHP2hj6/TlVOzEKHKyh9f3jIta1B+LHbkx0E/0pa14+/7mOJ8S+kpdeAytzqGaJeqbrhBlLXdXIZJWakMmvzeiwCJfuczQWH0bD1kviV79Hu4j+jHmq59a9v2pqyNq0HsziVs3ZjIydh8Ko\
fuZlpDIayBSSTFP7yvmw8cFz2LvwdWzqvib5Rid8RB1g1dYSa687O7bkBTfYQ4/lnRyPb4ejOJV8EdZli9UZJeJATMrLSVGC5dw2XDveK/dfiSrb38PqKueY96+Uwv8j6GOiPmTOxXNMvjrprxkFfXNY\
7vdHDqgzoptw3Gu481STw4DSRXlnTkIsHMGbx+ah7OluJAWjuj6xe3k5SxtYIkbx9W5vciJ0Wgn6SAnimhZwJ1saLc6JVKlq/O7nSYwGEpms0Zz622DHAufWWZOBYfwzfomaneVi4evTxbNL03I8cPNu\
9MYn6r9W6PhKgpewgmBQOkBpJ0KYQB+FMsI85awq1PcKz3HCRcKv94OKC8YHlRkSlK5JERKFUOUgMhaClCaYLvCJQmDiX/OTn1KGrSWcAAAAAElFTkSuQmCC) !important;\
      }\
      #Content .rating-image[src='/images/circle-blue.png'] {\
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAADHUlEQVR42o2Ua0gUURTHz8y66+zD3VVrTPGxWqn4CAS1fERBkQaV9jAjihKJ\
IjTMIvVDmn0oMfugUCZkkAomlpqGhfulJE16aaZmJpVpxWKgu+o+dNfp3GlWVluiA3/4z9x7f5xz55yhYEV4HG31cnHX7AZatB2A1gAs0tz83A+bfuKFabC53dRX+wW3mVFWx3OU4wObM5RBM6o78I9A\
2HV9W1Yl2u8CcDmIzR25TEvkF+E/wjzcpp1uOXUB7QjKuARylsnDTBlEa6RYIQ2junmIK3gOIrUfUIyaX5/tLm+Z7SwtRjtM2JRnRgcr9grXOUKeZSsg2EcJr8etYFrgYHOQGCZnFiDkeA1I/OMRpuL3\
Td6KL7ZNj9WgHaPYM/2ZtMzztiOoN5+FIZ0NdsSuBUosB21XH2wNloIsMg3kMSfAxSuC32fQFg4a31TnoX1KsTmD9TSjPuQIsuoGwDTQCItmPUh8Y2GgLgvclQx4BG0CRWIuSAIShYtvmtG3ZZPy7iHo\
Qw/NKDc6gjiLAWz6cTQc9F5LAF9POZQ8noaik8kIOoegBH6fZax7Yao+7SbaKpLRS8woxtnXqdwvgdToVVD2ZAry0yPxfuKWlWYZ67JN1R+sRVtBrT79qkWk9ElxBnpbwILRKoKQQD8Qs2Eg3ZDOZ0O5\
Kvl1Y3+D1dCeW8eDPI605El8Y0qcgQ6HcWAwcnC3MAlk0ZnABCcvfX4S049yZs0DjdV8adKoYxGqpCvvnYHKdtIwNw+QnbkXFAlnly7ZHrryiK+caaoCbQNpSLlqz41L0rDU8ytBn6/6wKwFwC8kAeQE\
hD20lE1rFmceau5AW05aj4BEKH91alUlE7or6e82uM97KfaQCxvO+5nOUpjrLn+Hllz0A9Q3+6y5okIUW/KLFHHZ+5a3wQTvRSocD1c3eyb9+KoJ1Yz6iJp3nH4par1IrUlxXbftgNg7KlDktobhuEUa\
YYsL4z1m86j2F94JOagV9AmEP8Cy34iQmTcqlGSICkCphDU9mSn4M6REP0km9oMrQSRoAUgApGEY4b1ZgBFZSOWOh34DGjkZJfFBZ1EAAAAASUVORK5CYII=) !important;\
       }\
      #Content .rating-image[src='/images/circle-yellow.png'], #Content .ok-rating {\
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAAB+ElEQVR42t2TP0hbURTGv4coig4OySTGUXGKFWw0iBJpIV0MKcmQNZNuHXTo\
INjF0cE9LSoRzZDGUAhWE4sxbYr/BhepojXwoA2IbY0Sl/S74Vx5SkYnH3zc756c88u999xr4JE+44mDbm4Qb2yEz/pDoYBNhwPjtGalgstqsoFnHH5SF4xVJNbL4dQolxFvaLgP0V8+jyOXC+Ms2pCi\
OQ4LnH9X82wWZ4ODWKZdNDQ5mUQpGgXq6lAOBNA0OoomKZ5lzhvx2/Ru5TMZmB4PftGuUe/vQKEQ/i4tYZt2Z2oK3dPTeC3FaeZ4rCtNp2GOjOC3WhS1Qu0Zlr0ecYhQn9Sc8UOJf6Xv15BEAtc+H37Q\
bmkIVbKCvnGYoT4L6FriOfoB5WMxIBhEQZ2EQHapq2qeBaT+4R21LqBKrRWlUrjwevFWYOZd+3VBOIzjSAST6vCKRfhtNszrlTLHZT2jXA4nbjfCsq1/90Ds2tXBAZJs957TiZd2O14IKM+c5+JL9M21\
YMb5OTLt7RiudY/icdz6/cjqrhGkGrDF+ZjAjjVM3ewuXryPfX3ofAApE3JGu8rCCQF94TAnO4lJTDXogwK1UD3UK8pJNQurRO2r81VnT/klPi/PZIjyUkUqqh+tKm6j7FS9xG4lyZRYh8TVKv9QrdbY\
o73+/yp80O7Q2NxAAAAAAElFTkSuQmCC) !important;\
      }\
      #Content .rating-image[src='/images/circle-green.png'], #Content .good-rating {\
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABZ0lEQVR42p2TTStEURjH/7fM5DV3FpSy4AuoSVI+gYVsLVhYGgufwEpWVhak\
2CGFDSLFUl6m2WElRSFh4aVMM17i/9z73Gbuycxc59Tv3Oc85/Y75zn3XAdR2xUG4WLZixPo9DLAczDt/EuSY5zBLfqxwkikZ9FFxRJpY3jBOtYYzZLTaCJT0kDqcaGSVfJQWXSJIdRhKZRrQZb9Npkh\
afJRWiSCOAYQQ18oP4IfbOKA0QLZI4/F0w7u+UJhxS688jizZcqt1ucOxrnkogrzpmiO41Tlz+idlZzZqJZ6Y4rSHHdHEsnOEthgP0WO7UUpfFOzpaITO1EVacI1+3n4F9OyNL+sDPtJ+F8wZycyypKU\
KTriuKespIa44bJ8EZAkw6SDnGOCG0+il7rWwr0N7eaLu9llNE0OST4QuaSNNJI38qly2Vk7qTVU8n/tQ64kcBck//rX4ipvVnnMmH9XwZMuWlJk1X4BwRNyExMIP9EAAAAASUVORK5CYII=) !important;\
      }\
      #Content .rating-image[src='/images/circle-red.png'], #Content .bad-rating {\
background-image: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABIAAAASCAYAAABWzo5XAAABZElEQVR42q2TvS8EQRiHf5s4oiAUEhIJUYpOwT+gECrRXXeNP0JBodWpUagQ\
H/FREJ8JOYULJRIfBRHizjUIyZ1nb/Yuc5u73YvzJk9mJjPz7Mw77zry4k6K1ksL8kUNPElH19LWqJl/h0//OiffSUrZbwVHqxR7lmatca85g1JO0GlKiFYQjVjjGZo5SOREb5zmJ8xiNp4h6rPGJzQT\
sJcTvSDKVCuq9FqhokqvFSriLbNf/yHiTuOD0pQ7EXSyOmiW4oj6LdExzSQcuMluhyEYcOeiUtu01GVLtmFD+lilKN1N0A09cAnzcOGKaqHFEzbwxV1bMiZl1qUrunE4hAREoFGmyu8h7dib0uQrX/vu\
ypiRnNNdg324hVSpLBREdhn4JIvmZrlfoexfVBA9sJiEDv9FUiQiN9mIyUlyWbqhuwSblUiKRN4r8GjqgFPY8RIZKvGLmqDTS9EjvCq4tMqKqopfr+F6E/aacCcAAAAASUVORK5CYII=) !important;\
      }\
    ");
	}

	var www = $('#dashboard_profile_discussions');
	if (fullScreen && !www) {
		var xxx = document.querySelector('.WhoIs');
	  var yyy = document.querySelector('.BigButton');
	  xxx.insertBefore(yyy, xxx.lastElementChild);
	}

  function getText() {
    var gText = "", ki = $("#keywordIn");
    gText = getSelection().toString().trim();
    if (gText != "") ki.value = ki.value + gText;
    return;
  }

   function getActiveText() {
    var getText = "", ki = $("#keywordIn");
    getText = getSelection().toString();
    if (getText != "" && GM_getValue("insertText")) {
      if (ki.value == "") ki.value = getText.trim();
      else ki.value = ki.value + "<>" + getText.trim();
    }
    return;
  }

  function genKey() {
    if ((mainPage || indexPage || catPage) && ($("#cbTopic").checked && $("#cbAuthor").checked)) {
      alert(fe31);
      return;
    }
    if (discPage && ($("#cbProfile").checked && $("#cbThread").checked)) {
      alert(fe31);
      return;
    }
    var ki = $("#keywordIn");
    if (ki.value == "") return;
    if ((mainPage || indexPage || catPage)  && $("#cbAuthor").checked) {
      if (gvAuthor == "") GM_setValue("authorKeywords", ki.value.trim());
      else GM_setValue("authorKeywords", gvAuthor + "<>" + ki.value.trim());
    }
    if ((mainPage || indexPage || catPage) && $("#cbTopic").checked) {
      if (gvTopic == "") GM_setValue("topicKeywords", ki.value.trim());
      else GM_setValue("topicKeywords", gvTopic + "<>" + ki.value.trim());
    }
    if (discPage && $("#cbProfile").checked) {
      if (gvProfile == "") GM_setValue("profileKeywords", ki.value.trim());
      else GM_setValue("profileKeywords", gvProfile + "<>" + ki.value.trim());
    }
    if (discPage && $("#cbThread").checked) {
      if (gvThread == "") GM_setValue("threadKeywords", ki.value.trim());
      else GM_setValue("threadKeywords", gvThread + "<>" + ki.value.trim());
    }
    ki.value = "";
    document.location.reload();
  }

  function remKey() {
    if ((mainPage || indexPage || catPage) && $("#cbAuthor").checked) {
      var gv = GM_getValue("authorKeywords"), gvs = gv.split("<>"), key = "authorKeywords";
    }
    if ((mainPage || indexPage || catPage) && $("#cbTopic").checked) {
      var gv = GM_getValue("topicKeywords"), gvs = gv.split("<>"), key = "topicKeywords";
    }
    if (discPage && $("#cbProfile").checked) {
      var gv = GM_getValue("profileKeywords"), gvs = gv.split("<>"), key = "profileKeywords";
    }
    if (discPage && $("#cbThread").checked) {
      var gv = GM_getValue("threadKeywords"), gvs = gv.split("<>"), key = "threadKeywords";
    }
    var names = [], undo = [];
    var ki = $("#keywordIn"), kwu = ki.value.split("<>");
    if (ki.value == "") return;
    if (confirm(fe7 + "\u2003" + ki.value.replace(/<>/g, "\n\u2003")) == false) return;
    if (gv == "") return;
    for (k = 0; k < gvs.length; k++) names.push(gvs[k]);
    for (i = 0; i < kwu.length; i++) undo.push(kwu[i]);
    var Array1 = names, Array2 = undo;
    for (var i = 0; i < Array2.length; i++) {
      var arrlen = Array1.length;
      for (var j = 0; j < arrlen; j++)
      if (Array2[i] == Array1[j]) Array1 = Array1.slice(0, j).concat(Array1.slice(j+1, arrlen));
    }
    var newStr = Array1.toString();
    newStr = newStr.replace(/,/g, "<>");
    if (newStr.indexOf("<>") == 0) newStr = newStr.substring(2, newStr.length);
    GM_setValue(key, newStr);
    ki.value = "";
    document.location.reload();
  }

  function setFilter() {
    var fc = $("#filterCnt").textContent;
    if (fc == 0) return;
    if (mainPage || indexPage || catPage) {
      var enable = GM_getValue("showFilteredIndex");
      GM_setValue("showFilteredIndex", !enable);
      if (GM_getValue("showFilteredIndex") == true) {
        $("#filterBtn").textContent = fe11;
        setUnfiltered();
      } else {
        $("#filterBtn").textContent = fe10;
        setFiltered();
    } }
    if (discPage) {
      var enable = GM_getValue("showFilteredDisc");
      GM_setValue("showFilteredDisc", !enable);
      if (GM_getValue("showFilteredDisc") == true) {
        $("#filterBtn").textContent = fe11;
        setUnfiltered();
      } else {
        $("#filterBtn").textContent = fe10;
        setFiltered();
  } } }

  function checkbox(e) {
    if (e.target.id.match(/label/)) $('#' + e.target.id).previousElementSibling.click();
    else var www = e.target.id;
    var xxx = GM_getValue(www) != false ? false : true;
    GM_setValue(www, xxx);
    if (mainPage || indexPage || catPage) {
      if (!GM_getValue("cbAuthor") && !GM_getValue("cbTopic")) {
        $("#filterA").removeAttribute("active");
        $("#filter1").style.display = "none";
        $("#filter2").style.display = "none";
      } else {
        $("#filterA").setAttribute("active", "true");
        $("#filter1").style.display = "-moz-box";
        $("#filter2").style.display = "-moz-box";
      }
      if ((e.target.id.match(/Topic/) && !gvTopic) || (e.target.id.match(/Author/) && !gvAuthor)) return;
    }
    if (discPage) {
      if (!GM_getValue("cbProfile") && !GM_getValue("cbThread")) {
        $("#filterB").removeAttribute("active");
        $("#filter1").style.display = "none";
        $("#filter2").style.display = "none";
      } else {
        $("#filterB").setAttribute("active", "true");
        $("#filter1").style.display = "-moz-box";
        $("#filter2").style.display = "-moz-box";
      }
      if ((e.target.id.match(/Profile/) && !gvProfile) || (e.target.id.match(/Thread/) && !gvThread)) return;
    }
    if ($('#keywordIn').value == "") document.location.reload();
  }

})();