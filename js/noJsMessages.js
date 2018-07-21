//
// noJsMessages.js
// UA-ACM-Student-Chapter.github.io
//
// Created by Jared Cleghorn on 7/21/18.
// Copyright © 2018 UA ACM. All right reserved.

// Get elements that should not be displayed if JavaScript is enabled.
var noJsMessages = document.getElementsByClassName('no-js-message');

// Set their 'display' property to 'none'.
for (let noJsMessage of noJsMessages) {
  noJsMessage.className = noJsMessage.className + ' display-none';
}
