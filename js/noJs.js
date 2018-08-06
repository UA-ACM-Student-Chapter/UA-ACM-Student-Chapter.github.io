//
// noJs.js
// UA-ACM-Student-Chapter.github.io
//
// Created by Jared Cleghorn on 7/21/18.
// Copyright © 2018 UA ACM. All right reserved.

// Get elements that should not be displayed if JavaScript is enabled.
var noJsElements = document.getElementsByClassName('no-js');

// Set their 'display' property to 'none'.
for (let noJsElement of noJsElements) {
  noJsElement.className = 'js';
}
