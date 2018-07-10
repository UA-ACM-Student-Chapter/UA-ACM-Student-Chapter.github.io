/*!
 * ACM v1.0.1
 * Copyright 2018 (https://github.com/UA-ACM-Student-Chapter/UA-ACM-Student-Chapter.github.io/graphs/contributors)
 * Licensed under MIT (https://github.com/UA-ACM-Student-Chapter/UA-ACM-Student-Chapter.github.io/blob/master/LICENSE)
 */
var modalIsVisible = false;
var paymentLoaded = false;
var secretModeActivated = false;
var videoHasNotBeenLoaded = true;
var pendingVideoRequest = false;
$(document).ready(function() {
    formatGoogleCalendar.init({
        calendarUrl: 'https://www.googleapis.com/calendar/v3/calendars/vfgqdivlam7s8bai2q63c9bot8@group.calendar.google.com/events?key=AIzaSyBhDGFJdgm48JQXL-O-olci_a4GlGnfOUU',
        past: true,
        upcoming: true,
        sameDayTimes: true,
        dayNames: true,
        pastTopN: 2,
        upcomingTopN: 5,
        recurringEvents: true, 
        itemsTagName: 'li',
        upcomingSelector: '#events-upcoming',
        pastSelector: '#events-past',
        upcomingHeading: '<h2>Upcoming events</h2>',
        pastHeading: '<h2>Recent events</h2>',
        format: ['*date*', ': <br />', '*summary*', ' — ', '*description*', ' in ', '*location*']
    });

    //Join form validation
    $("form[name='joinForm']").validate({
        // Specify validation rules
        rules: {
            firstName: "required",
            lastName: "required",
            email: {
                required: true,
                email: true
            }
        },
        messages: {
            firstName: "Please enter your first name",
            lastName: "Please enter your last name",
            email: "Please enter a valid email address"
        }
    });
    $("#joinForm").submit(function(e) {
        e.preventDefault();
    });

    // Cursor easter egg
    $("#secret-mode").on("click", function() {
        $("#normalHeader").toggle();
        $("#sexyHeader").toggle();
        if (secretModeActivated) {
            $("#secret-mode").text("secret mode");
            secretModeActivated = false;
        }
        else {
            $("#secret-mode").text("revert to classic");
            secretModeActivated = true;
        }
    });

    //Collapse navbar behavior
    $(".scroll-item").on("click", function(event) {
        var x = $("#topnav");
        if (x.attr("class") != "custom-nav")
            x.attr("class", "custom-nav");
    });

    //Modal visibility behaviors
    $(".join-btn").on("click keydown", function(event) {
        if (event.which == 13 || (event.which > 0 && event.which < 4)) {
            modalIsVisible = true;
            $("#joinModal").show();
            $("#backToTopBtn").hide();
        }
    });
    $("#close-join").on("click", function(event) {
        modalIsVisible = false;
        $("#joinModal").hide();
        $("#error").hide();
    });
    $(".pay-btn").on("click keydown", function(event) {
        if (event.which == 13 || (event.which > 0 && event.which < 4)) {
            modalIsVisible = true;
            $("#payModal").show();
            $("#backToTopBtn").hide();
            if (!paymentLoaded) {
                loadPaymentView();
                paymentLoaded = true;
            }
        }
    });
    $("#close-pay").on("click", function(event) {
        modalIsVisible = false;
        $("#payModal").hide();
        $("#payment-error").hide();
        $("#member-error").hide();
        $("#valid-error").hide();
        $("#processing-payment").hide();
        $("#processing-status").hide();
    });

    var getFormData = function($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};
        $.map(unindexed_array, function(n, i) {
            indexed_array[n["name"]] = n["value"];
        });
        return indexed_array;
    }

    //Join form submission
    $("#submit-join").on("click", function(event) {
        var form = $("#joinForm");
        form.validate()
        if (form.valid()) {
            var $form = $("#joinForm");
            var data = getFormData($form);
            $.ajax({
                url: "https://ua-acm-web-util.herokuapp.com/join",
                beforeSend: function(request) {
                    request.setRequestHeader("Access-Control-Allow-Origin", "*");
                },
                data: JSON.stringify(data),
                dataType: "json",
                contentType: "application/json",
                type: "POST",
                success: function() {
                    $(".success-form", "#joinModal").show();
                    $(".form-container", "#joinModal").hide();
                }()
            })
        }
    });

    //Back to top button visibility when scrolling
    $(window).scroll(function() {
        if ($(this).scrollTop() && !modalIsVisible) {
            $('#backToTopBtn:hidden').stop(true, true).fadeIn(300);
        } else {
            $('#backToTopBtn').stop(true, true).fadeOut(300);
        }
    });

    //For printing your receipt
    function printElem(elem){
            var mywindow = window.open('', 'PRINT', 'height=400,width=600');

            mywindow.document.write('<html><head><title>' + document.title  + '</title>');
            mywindow.document.write('</head><body >');
            mywindow.document.write('<h1>' + document.title  + '</h1>');
            mywindow.document.write(document.getElementById(elem).innerHTML);
            mywindow.document.write('</body></html>');

            mywindow.document.close(); // necessary for IE >= 10
            mywindow.focus(); // necessary for IE >= 10*/

            mywindow.print();
            mywindow.close();

            return true;
        }

    $("#print-receipt").click(function(e) {
        e.preventDefault();
        printElem("receipt");
    }); 

    //Smooth scrolling (https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_animate_smoothscroll)
    $("a").on('click', function(event) {

        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var hash = this.hash;

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $(hash).offset().top
            }, 300, function() {

                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        } // End if
    });
});

function toggleResponsiveNav() {
    $("#topnav").toggleClass("responsive");
}

//Pay Dues Custom Form
var email = $("#pay-email");
var shirtSize = $("#pay-shirt-size");
var alerts = $("h3.label-alert-hide");
var presubmitPaymentBtn = $("#pay-presubmit");
var submitPaymentBtn = $("#pay-confirm");

email.on("click", function() {
    alerts.eq(0).attr("class", "label label-alert-hide");
    email.removeClass("alert");
});
shirtSize.on("click", function() {
    alerts.eq(1).attr("class", "label label-alert-hide");
    shirtSize.removeClass("alert");
});

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE"s way of making CORS requests.
        xhr = new XDomainRequest();
        xhr.open(method, url);

    } else {

        // Otherwise, CORS is not supported by the browser.
        xhr = null;

    }
    return xhr;
}

function loadScript(url, callback){

    var script = document.createElement("script")
    script.type = "text/javascript";

    if (script.readyState){  //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" ||
                    script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else {  //Others
        script.onload = function(){
            callback();
        };
    }

    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

function loadPaymentView() {
    loadScript("https://js.braintreegateway.com/web/dropin/1.11.0/js/dropin.min.js", function(){});
    loadScript("https://js.braintreegateway.com/web/3.34.0/js/client.min.js", function(){});
    loadScript("https://js.braintreegateway.com/web/3.34.0/js/venmo.min.js", function(){});
    loadScript("https://js.braintreegateway.com/web/3.34.0/js/data-collector.min.js", function(){});
    $("#loading-payment").show();
    var xhr = createCORSRequest("GET", "https://ua-acm-web-payments.herokuapp.com/client_token");
    xhr.open("GET", "https://ua-acm-web-payments.herokuapp.com/client_token")
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            $("#loading-payment").hide();
            // Create a client.
            braintree.client.create({
                authorization: xhr.responseText
            }, function(clientErr, clientInstance) {
                // Stop if there was a problem creating the client.
                // This could happen if there is a network error or if the authorization
                // is invalid.
                if (clientErr) {
                    console.error("Error creating client:", clientErr);
                    return;
                }

                // Create a Venmo component.
                braintree.venmo.create({
                    client: clientInstance
                }, function(venmoErr, venmoInstance) {

                    // Stop if there was a problem creating Venmo.
                    // This could happen if there was a network error or if it"s incorrectly
                    // configured.
                    if (venmoErr) {
                        console.error("Error creating Venmo:", venmoErr);
                        return;
                    }
                });
            });
            //Accept card payments
            braintree.dropin.create({
                authorization: xhr.responseText,
                container: "#dropin-container",
                venmo: {
                    allowNewBrowserTab: false
                }
            }, function(createErr, instance) {
                $("#pay-cancel").click(function() {
                    $("#pay-confirm-container").hide();
                    $("#confirmation-buttons").hide()
                    $("#pay-presubmit").show();
                    $("#pay-form").show();
                    $("#payment-error").hide();
                    $("#member-error").hide();
                    $("#valid-error").hide();
                });
                $(".braintree-toggle").click(function() {
                    $("#pay-confirm-container").hide();
                    $("#confirmation-buttons").hide()
                    $("#pay-presubmit").show();
                    $("#pay-form").show();
                });
                $("#braintree-hosted-field-cvv").keydown(function(e) {
                    if (e.which == 18)
                        presubmitPaymentBtn.click();
                });
                presubmitPaymentBtn.on("click", function (e) {
                    e.preventDefault();
                    instance.requestPaymentMethod(function (reqErr) {
                        if (!email.val().trim().length) {
                            alerts.eq(0).attr("class", "label-alert-show");
                            email.addClass("alert");
                        }
                        if (shirtSize.val() == "--") {
                            alerts.eq(1).attr("class", "label-alert-show");
                            shirtSize.addClass("alert");
                        }
                        if (reqErr) {
                            return;
                        }
                        else {
                            if (email.val().trim().length && shirtSize.val() != "none") {
                                $("#email-confirmation").html(email.val().trim());
                                $("#size-confirmation").html(shirtSize.val());
                                $("#pay-confirm-container").show();
                                $("#pay-form").hide();
                                $("#pay-presubmit").hide()
                                $("#confirmation-buttons").show();
                        }
                    }
                    });
                    
                });
                submitPaymentBtn.on("click", function(e) {
                    e.preventDefault();
                    if (email.val().trim().length && shirtSize.val() != "none") {
                            $("#processing-status").show();
                            $("#processing-payment").show();
                            instance.requestPaymentMethod(function(err, payload) {
                                // Submit payload to server
                                var xhr2 = createCORSRequest("POST", "https://ua-acm-web-payments.herokuapp.com/checkout");
                                xhr2.open("POST", "https://ua-acm-web-payments.herokuapp.com/checkout");
                                xhr2.setRequestHeader("content-type", "application/json");
                                xhr2.onreadystatechange = function() {
                                    if (xhr2.readyState == 4 && xhr2.status == 200) {
                                        $("#processing-payment").hide()
                                        if (xhr2.responseText == "bad"){
                                            $("#payment-error").show()
                                        }
                                        else {
                                            var response = JSON.parse(JSON.parse(xhr2.responseText)["text"]);
                                            if (response["noUser"] == "true") {
                                                $("#member-error").show();
                                            }
                                            else if (response["notValid"] == "true") {
                                                $("#valid-error").show();
                                            }
                                            else {
                                                $("#pay-complete").show();
                                                $("#pay-confirm-container").hide();
                                                $("#payment-buttons").hide();
                                                $("#payment-wrapper").hide();
                                                $("#confirmation-buttons").hide();
                                                $("#payment-error").hide();
                                                $("#member-error").hide();
                                                $("#payment-button").hide();
                                                $("#processing-status").show();
                                                $("#receipt-name").html(response["name"]);
                                                $("#receipt-type").html(response["paymentType"]);
                                                $("#receipt-id").html(response["id"]);
                                                $("#receipt-date").html(response["date"]);
                                                $("#receipt-card").html(response["cardType"] + " " + response["hiddenCCNumber"]);
                                            }
                                        }
                                    }
                                    else if (xhr2.readyState == 4 && xhr2.status != 200) {
                                        $("#processing-payment").hide();
                                        $("#member-error").hide();
                                        $("#payment-error").show();
                                    }
                                };
                                xhr2.send(JSON.stringify({
                                    "nonce": payload.nonce,
                                    "email": email.val().trim().trim(),
                                    "size": shirtSize.val()
                                }));
                            });
                    }
                });
            });
        }
    };
    xhr.send();
}