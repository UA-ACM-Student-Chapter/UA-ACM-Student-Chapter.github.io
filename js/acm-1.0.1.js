/*!
 * ACM v1.0.1
 * Copyright 2018 (https://github.com/UA-ACM-Student-Chapter/UA-ACM-Student-Chapter.github.io/graphs/contributors)
 * Licensed under MIT (https://github.com/UA-ACM-Student-Chapter/UA-ACM-Student-Chapter.github.io/blob/master/LICENSE)
 */
var modalIsVisible = false;
$(document).ready(function() {

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
    $(".cursor").on("click", function() {
        $("#normalHeader").toggle();
        $("#sexyHeader").toggle();
    });

    //Collapse navbar behavior
    $(".scroll-item").on("click", function(event) {
        var x = $("#topnav");
        if (x.attr("class") != "custom-nav")
            x.attr("class", "custom-nav");
    });

    //Modal visibility behaviors
    $(".join-btn").on("click", function(event) {
        modalIsVisible = true;
        $("#joinModal").show();
        $("#backToTopBtn").hide();
    });
    $("#close-join").on("click", function(event) {
        modalIsVisible = false;
        $("#joinModal").hide();
        $("#error").hide();
    });
    $(".pay-btn").on("click", function(event) {
        modalIsVisible = true;
        $("#payModal").show();
        $("#backToTopBtn").hide();
    });
    $("#close-pay").on("click", function(event) {
        modalIsVisible = false;
        $("#payModal").hide();
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
            console.log(JSON.stringify(data));
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
var button = $("#pay-submit");

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


var xhr = createCORSRequest("GET", "https://ua-acm-web-payments.herokuapp.com/client_token");
xhr.open("GET", "https://ua-acm-web-payments.herokuapp.com/client_token")
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4 && xhr.status == 200) {
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
            button.on("click", function() {
                if (!email.val().length) {
                    alerts.eq(0).attr("class", "label-alert-show");
                    email.addClass("alert");
                }
                if (shirtSize.val() == "--") {
                    alerts.eq(1).attr("class", "label-alert-show");
                    shirtSize.addClass("alert");
                }
                if (email.val().length && shirtSize.val() != "none") {
                    instance.requestPaymentMethod(function(err, payload) {
                        // Submit payload to server
                        var xhr2 = createCORSRequest("POST", "https://ua-acm-web-payments.herokuapp.com/checkout");
                        xhr2.open("POST", "https://ua-acm-web-payments.herokuapp.com/checkout");
                        xhr2.setRequestHeader("content-type", "application/json");
                        xhr2.onreadystatechange = function() {
                            console.log("ReadyState");
                            if (xhr2.readyState == 4 && xhr2.status == 200) {
                                $("#pay-success").show();
                                $("#payment-wrapper").hide();
                                $("#payForm.form-container").hide();
                            }
                        };
                        xhr2.send(JSON.stringify({
                            "nonce": payload.nonce,
                            "email": email.value,
                            "size": shirtSize.options[shirtSize.selectedIndex].value
                        }));
                    });
                }
            });
        });
    }
};
xhr.send();