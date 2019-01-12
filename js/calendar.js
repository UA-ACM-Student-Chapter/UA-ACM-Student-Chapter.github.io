//
//  calendar.js
//  UA-ACM-Student-Chapter.github.io
//
//  Created by Jared Cleghorn on 7/21/18.
//  Copyright © 2018 UA ACM. All rights reserved.
//

// Constansts
const DAYS_OF_THE_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const PERIODS = ['a.m.', 'p.m.'];

// Create an XMLHttpRequest object.
var xhr = new XMLHttpRequest();

// Get the events list.
var eventsList = document.getElementById('events-list');

// Returns a formatted date string (for example, 'Sunday, July 22, 2018') from a date object.
function formatDate(date) {
  return DAYS_OF_THE_WEEK[date.getDay()] + ', ' + MONTHS[date.getMonth()] + ' ' + date.getDate();
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
function createEventsListItem(event, currentNumberOfItems) {
  currentNumberOfItems;
  var itemPosition = 'left';
  if(currentNumberOfItems % 3 == 1)
    itemPosition = 'middle';
  else
    itemPosition = 'right';

  // Create a Date object from the event's date.
  var date = new Date(event.start.dateTime);

  // Create a containing column
  var itemContainer = document.createElement('div');
  itemContainer.className = 'col-lg-4 ' + itemPosition;

  // Create the events list item element.
  var listItem = document.createElement('div');
  listItem.className = 'events-list-item question-box';

  // Create the Google Calendar link.
  var link = document.createElement('a');
  link.setAttribute('href', event.htmlLink);
  link.setAttribute('style', 'text-decoration:underline')

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

  itemContainer.appendChild(listItem);

  return itemContainer;
}

// Processes the events returned by the AJAX request.
xhr.onload = function() {
  googleCalendarEvents = JSON.parse(xhr.responseText).items;

  // Filter out events that have already passed.
  googleCalendarEvents = googleCalendarEvents.filter(function(event) {
    // Get the current date and time.
    var currentDate = new Date(Date.now());

    //If the event somehow has no start date
    if (!event.start) return false;

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

  var row = document.createElement('div');
  row.className = 'row';
  for (var i = 0; i < NUM_UPCOMING_EVENTS_TO_DISPLAY && i < googleCalendarEvents.length; ++i) {
    // Create a new events list item and add it to the list.
    eventListItem = createEventsListItem(googleCalendarEvents[i], i);
    if (i % 3 == 0 && i != 0) {
      eventsList.appendChild(row);
      row = document.createElement('div');
      row.className = 'row';
    }
    row.appendChild(eventListItem);
  }
  row.appendChild(eventListItem);
  eventsList.appendChild(row);
};

// Prepare and send the AJAX request for the Google Calendar events.
xhr.open('GET', 'https://www.googleapis.com/calendar/v3/calendars/' + CALENDAR_NAME + '/events?key=' + GOOGLE_CAL_API_KEY, true);
xhr.send(null);
