//
//  calendar.js
//  UA-ACM-Student-Chapter.github.io
//
//  Created by Jared Cleghorn on 7/21/18.
//  Copyright © 2018 UA ACM. All rights reserved.
//

// Configuration variables
const NUM_UPCOMING_EVENTS_TO_DISPLAY = 5;

// Constansts
const DAYS_OF_THE_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PERIODS = ['a.m.', 'p.m.'];

// Returns a formatted date string (for example, 'Sunday, July 22, 2018') from a date object.
function formatDate(date) {
  return DAYS_OF_THE_WEEK[date.getDay()] + ', ' + MONTHS[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

// Returns a formatted time string (for example, '1:29 p.m.') from a date object.
function formatTime(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var minutesString;

  // Add a leading zero to single-digit minutes.
  if (minutes < 10) {
    minutesString = '0' + minutes;
  } else {
    minutesString = minutes;
  }

  // Return a formatted time string.
  return (hours % 12) + ':' + minutesString + ' ' + PERIODS[Math.floor(hours / 12)];
}

// Appends a line break element to the specified element.
function appendLineBreak(element) {
  var lineBreakElement = document.createElement('br');
  element.appendChild(lineBreakElement);
}

// Returns an events list item from a Google Calendar event object.
function createEventsListItem(event) {
  // Create a Date object from the event's date.
  var date = new Date(event.start.dateTime);

  // Create the events list item element.
  var listItem = document.createElement('li');
  listItem.className = 'events-list-item';

  // Create the Google Calendar link.
  var link = document.createElement('a');
  link.setAttribute('href', event.htmlLink);

  // Create the paragraph that will contain the details of the event.
  var detailsParagraph = document.createElement('p');
  detailsParagraph.className = 'event-details-paragraph';

  // Create the list item's text nodes.
  var summaryText = document.createTextNode(event.summary);
  var dateText = document.createTextNode(formatDate(date));
  var timeText = document.createTextNode(formatTime(date));
  var locationText = document.createTextNode(event.location);

  // Build the link.
  link.appendChild(summaryText);

  // Build the event details paragraph.
  detailsParagraph.appendChild(dateText);
  appendLineBreak(detailsParagraph);
  detailsParagraph.appendChild(timeText);
  appendLineBreak(detailsParagraph);
  detailsParagraph.appendChild(locationText);

  // Build the list item.
  listItem.appendChild(link);
  listItem.appendChild(detailsParagraph);

  return listItem;
}

// Get the events list.
var eventsList = document.getElementById('events-list');

function start() {
  // Initialize the JavaScript client library.
  gapi.client.init({
    'apiKey': GOOGLE_CAL_API_KEY,
  }).then(function() {
    // Initialize and make the API request.
    return gapi.client.request({
      'path': 'https://www.googleapis.com/calendar/v3/calendars/' + CALENDAR_NAME + '/events',
    })
  }).then(function(response) {
    // Process the returned events.
    processGoogleCalendarEvents(response.result.items);
  }, function(reason) {
    console.log('Error: ' + reason.result.error.message);
  });
};

// Processes the events returned by the Google Calendar API.
function processGoogleCalendarEvents(googleCalendarEvents) {
  // Filter out events that have already passed.
  googleCalendarEvents = googleCalendarEvents.filter(function(event) {
    // Get the current date and time.
    var currentDate = new Date(Date.now());

    // Get the date and time of the event.
    var eventDate = new Date(event.start.dateTime);

    // If the event has not already passed...
    if (currentDate <= eventDate) {
      // Keep it in the array.
      return true;
    // Else, if the event has already passed...
    } else {
      // Remove it from the array.
      return false;
    }
  });

  // Sorts the events in order of starting date and time.
  googleCalendarEvents.sort(function(event1, event2) {
    // Get the dates of the events being compared.
    var date1 = new Date(event1.start.dateTime);
    var date2 = new Date(event2.start.dateTime);

    return date1 - date2;
  });

  // FIXME: Remove after completing.
  console.log(googleCalendarEvents);

  for (var i = 0; i < NUM_UPCOMING_EVENTS_TO_DISPLAY; ++i) {
    // Create a new events list item and add it to the list.
    eventsList.appendChild(createEventsListItem(googleCalendarEvents[i]));
  }
}

// Display the events list (by removing the 'display-none' class), since JavaScript is enabled.
eventsList.className = '';

// Load the JavaScript client library.
gapi.load('client', start);
