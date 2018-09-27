/*!
 * ACM v1.0.1
 * Copyright 2018 (https://github.com/UA-ACM-Student-Chapter/UA-ACM-Student-Chapter.github.io/graphs/contributors)
 * Licensed under MIT (https://github.com/UA-ACM-Student-Chapter/UA-ACM-Student-Chapter.github.io/blob/master/LICENSE)
 */

/* Navigation Bar Active Section */
var navbar = document.getElementById("topnav");
var items = navbar.getElementsByClassName("nav-item");
for (var i = 0; i < items.length; i++) {
  items[i].addEventListener("click", function() {
    var current = document.getElementsByClassName("active");
    current[0].className = current[0].className.replace(" active", "");
    this.className += " active";
    toggleResponsiveNav();
  });
}

var modalIsVisible = false;
var paymentLoaded = false;
var secretModeActivated = false;
var videoHasNotBeenLoaded = true;
var pendingVideoRequest = false;
var braintreeClientAlreadyCreated = false;
function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {
        xhr.open(method, url, true);
    } else if (typeof XDomainRequest != "undefined") {
        xhr = new XDomainRequest();
        xhr.open(method, url);
    } else {
        xhr = null;
    }
    return xhr;
}
$(document).ready(function() {
    //Wakeup ACMWebUtil
    $.ajax({
        url: "https://" + UTIL_INSTANCE_NAME + ".herokuapp.com/member/wakeup",
        type: "GET",
    });

    //Wakeup payments util
    $.ajax({
        url: "https://" + PAYMENTS_INSTANCE_NAME + ".herokuapp.com/wakeup",
        type: "GET",
    });

    $.validator.methods.email = function( value, element ) {
        return this.optional( element ) || /[^@]+@.+[^@]ua.edu/.test( value );
    }

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
            email: "Please enter a valid Crimson email address"
        }
    });
    $("#joinForm").submit(function(e) {
        e.preventDefault();
    });

    // Cursor easter egg
    $("#secret-mode").on("click", function() {
        $("#normalHeader").toggle();
        if(!$('#normalHeader').is(':visible')) {
            $("#sexyHeader").css("display", "flex");
        }
        else
            $("#sexyHeader").css("display", "none");
        if (secretModeActivated) {
            $("#secret-mode").text("secret mode");
            $("body").css("font-family", "'Trebuchet MS', Helvetica, sans-serif");
            secretModeActivated = false;
        }
        else {
            $("#secret-mode").text("revert to classic");
            $("body").css("font-family", "Courier");
            secretModeActivated = true;
        }
        $("html, body").animate({ scrollTop: 0 }, "slow");
    });

    $("#super-secret-admin-portal").on("click", function() {
        window.open('admin_portal.html');
    });

    $("#email-btn").on("input", function(){
        $("#join-email-field").val($("#email-btn").val());
        $("#pay-email").val($("#email-btn").val());
    })

    //Collapse navbar behavior
    $(".scroll-item").on("click", function(event) {
        var x = $("#topnav");
        if (x.attr("class") != "custom-nav")
            x.attr("class", "custom-nav");
    });

    $(window).on("scroll", function() {
        var aTop = $('#home').height();
        if($(this).scrollTop()>=aTop){
            if (!$("#topnav").hasClass("sticky")) {
                $("#topnav").addClass("sticky");
                $("#topnav").hide();
                $("#topnav").fadeIn(300);
            }
            // instead of alert you can use to show your ad
            // something like $('#footAd').slideup();
        }
        else if ($(this).scrollTop() == 0) {
            if (!$("#home-link").hasClass("active")) {
                $("#home-link").addClass("active");
            }
            $(".nav-item").each(function(){
                if ($(this).attr("id") != "home-link") {
                    $(this).removeClass("active");
                } 
            });
        }
        else {
            $("#topnav").removeClass("sticky");
        }
    });

    //Modal visibility behaviors
    $(".join-btn").on("click keydown", function(event) {
        if (event.which == 13 || (event.which > 0 && event.which < 4)) {
            modalIsVisible = true;
            $("#joinModal").show();
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
    $("#submit-join").on("click", function(e) {
        var form = $("#joinForm");
        form.validate()
        if (form.valid()) {
            var $form = $("#joinForm");
            var data = getFormData($form);
            $("#loading-join").show();
            $("#submit-join").hide();
            $.post({
                url: "https://" + UTIL_INSTANCE_NAME + ".herokuapp.com/join",
                beforeSend: function(request) {
                    request.setRequestHeader("Access-Control-Allow-Origin", "*");
                },
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: function(response) {
                    if (response["success"] == true) {
                        $('#joinModal').animate({ scrollTop: 0 }, 300);
                        $(".success-form", "#joinModal").show();
                        $(".form-container", "#joinModal").hide();
                    }
                    else {
                        alert(response['errorMessage']);
                    }
                    $("#loading-join").hide();
                    $("#submit-join").show();
                }
            });
        }
        e.preventDefault();
    });

    //For printing your receipt
    function printElem(elem){
            var mywindow = window.open('', 'PRINT', 'height=400,width=600');

            mywindow.document.write('<html><head><title>' + document.title  + '</title>');
            mywindow.document.write('</head><body >');
            mywindow.document.write('<h1>' + document.title  + '</h1>');
            mywindow.document.write(document.getElementById(elem).innerHTML);
            mywindow.document.write('<div><button onclick="printPage()">Print this page</button></div>')
            mywindow.document.write('</body><script>function printPage() {window.print();}</script></html>');

            mywindow.focus(); // necessary for IE >= 10*/

            return true;
        }

    $("#print-receipt").click(function(e) {
        e.preventDefault();
        printElem("receipt");
    });

    //Smooth scrolling (https://www.w3schools.com/jquery/tryit.asp?filename=tryjquery_eff_animate_smoothscroll)
    $("a").on('click', function(event) {

        var navbarOffset = $("#topnav").height() * 2;
        if ($("#topnav").hasClass("sticky")) {
            navbarOffset = $("#topnav").height();
        }

        // Make sure this.hash has a value before overriding default behavior
        if (this.hash !== "") {
            // Prevent default anchor click behavior
            event.preventDefault();

            // Store hash
            var target = this.hash,
            $target = $(target);

            // Using jQuery's animate() method to add smooth page scroll
            // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
            $('html, body').animate({
                scrollTop: $target.offset().top - navbarOffset
            }, 900, 'swing', function() {

                // Add hash (#) to URL when done scrolling (default click behavior)
                // window.location.hash = target;
            });
        } // End if
    });
});

function validateCrimsonEmail(email) {
    var emailAddress = email.trim();
    return /[^@]+@.+[^@]ua.edu/.test( emailAddress );
}

function toggleResponsiveNav(event) {
    $("#topnav").toggleClass("responsive");
    $("#hamburger").toggleClass("hamburger-margin");
}

//Pay Dues Custom Form
var email = $("#pay-email");
var shirtSize = $("#pay-shirt-size");
var alerts = $(".label-alert-hide");
var presubmitPaymentBtn = $("#proceed-to-payment-btn");
var submitPaymentBtn = $("#pay-confirm");

email.on("click", function() {
    alerts.eq(0).attr("class", "label label-alert-hide");
    email.removeClass("alert");
});
shirtSize.on("click", function() {
    alerts.eq(1).attr("class", "label label-alert-hide");
    shirtSize.removeClass("alert");
});

function loadPaymentScript(url, callback){
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
    presubmitPaymentBtn.on("click", function (e) {
        e.preventDefault();
        $("#loading-presubmit-wheel").show();
        $("#proceed-to-payment-btn").hide();
        var valid = true;
        if (!validateCrimsonEmail(email.val())) {
            alerts.eq(0).attr("class", "label-alert-show");
            email.addClass("alert");
            valid = false;
        }
        if (shirtSize.val() == "none") {
            alerts.eq(1).attr("class", "label-alert-show");
            shirtSize.addClass("alert");
            valid = false;
        }
        if (valid) {
            $.post({
                url: "https://" + UTIL_INSTANCE_NAME + ".herokuapp.com/member/checkMemberForDues",
                beforeSend: function(request) {
                    request.setRequestHeader("Access-Control-Allow-Origin", "*");
                },
                data: JSON.stringify({ "email": email.val().trim() }),
                contentType: "application/json",
                dataType: "json",
                success: function(response) {
                    if (response["success"] == true) {
                        $('#payModal').animate({ scrollTop: 0 }, 300);
                        $("#pay-selection-header").show();
                        $("#pay-review-btn").show();
                        $("#payment-card-details-wrapper").show();
                        $("#payment-dropin").show();
                        $("#loading-payment-details").show();
                        $("#pay-dropin-cancel-btn").show();
                        $("#loading-presubmit-wheel").hide();
                        $("#member-pay-details-form").hide();
                        $("#pay-dropin-cancel-btn").on("click", function(e) {
                            e.preventDefault();
                            $('#payModal').animate({ scrollTop: 0 }, 300);
                            $("#pay-review-btn").show();
                            $("#pay-dropin-cancel-btn").hide();
                            $("#pay-selection-header").hide();
                            $("#pay-review-btn").hide();
                            $("#proceed-to-payment-btn").show();
                            $("#payment-card-details-wrapper").hide();
                            $("#payment-dropin").hide();
                            $("#member-pay-details-form").show();
                            $("#loading-payment-details").remove();
                        });
                        if (!braintreeClientAlreadyCreated) {
                            //Nested functions so that all scripts are loaded before trying to load dropin module
                            loadPaymentScript("https://js.braintreegateway.com/web/dropin/1.11.0/js/dropin.min.js", function(){
                                loadPaymentScript("https://js.braintreegateway.com/web/3.34.0/js/venmo.min.js", function(){
                                    loadPaymentScript("https://js.braintreegateway.com/web/3.34.0/js/client.min.js", function(){
                                        loadPaymentScript("https://js.braintreegateway.com/web/3.34.0/js/data-collector.min.js", function(){
                                            braintreeClientAlreadyCreated = true;
                                            var xhr = createCORSRequest("GET", "https://" + PAYMENTS_INSTANCE_NAME + ".herokuapp.com/client_token");
                                            xhr.open("GET", "https://" + PAYMENTS_INSTANCE_NAME + ".herokuapp.com/client_token")
                                            xhr.onreadystatechange = function() {
                                                if (xhr.readyState == 4 && xhr.status == 200) {
                                                    $("#loading-payment-details").hide();
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

                                                        //Create a client device data collector for fraud prevention
                                                        braintree.dataCollector.create({
                                                            client: clientInstance,
                                                            kount: true
                                                          }, function (err, dataCollectorInstance) {
                                                            if (err) {
                                                              // Handle error in creation of data collector
                                                              return;
                                                            }
                                                            // At this point, you should access the dataCollectorInstance.deviceData value and provide it
                                                            // to your server, e.g. by injecting it into your form as a hidden input.
                                                            var deviceData = dataCollectorInstance.deviceData;
                                                          });

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
                                                        },
                                                        dataCollector: {
                                                            kount: true // Required if Kount fraud data collection is enabled
                                                        }
                                                    }, function(createErr, instance) {
                                                        $(".braintree-toggle").click(function() {
                                                            if ($("#pay-confirm-container").is(":visible")) {
                                                                $('#payModal').animate({ scrollTop: 0 }, 300); //Switching pay to preconfirmation screen
                                                                $("#pay-dropin-cancel-btn").show();
                                                                $("#pay-review-btn").show();
                                                                $("#confirmation-buttons").show();
                                                                $("#pay-selection-header").show();
                                                                $("#confirmation-buttons").hide();
                                                                $("#pay-confirm-container").hide();
                                                            }
                                                        });
                                                        $("#pay-review-btn").on("click", function(e){
                                                            e.preventDefault();
                                                            $('#payModal').animate({ scrollTop: 0 }, 300);
                                                            $("#proceed-to-payment-btn").hide();
                                                            $("#member-pay-details-form").hide();
                                                            $("#pay-dropin-cancel-btn").hide();
                                                            $("#pay-review-btn").hide();
                                                            $("#loading-verifying-payment").show();

                                                            $("#back-to-payment-selection-btn").click(function(e) {
                                                                e.preventDefault();
                                                                $('#payModal').animate({ scrollTop: 0 }, 300);
                                                                $("#pay-dropin-cancel-btn").show();
                                                                $("#pay-review-btn").show();
                                                                $("#confirmation-buttons").show();
                                                                $("#pay-selection-header").show();
                                                                $("#confirmation-buttons").hide();
                                                                $("#pay-confirm-container").hide();
                                                            });
                                                            instance.requestPaymentMethod(function (reqErr) {
                                                                if (!reqErr) {
                                                                    $("#loading-verifying-payment").hide();
                                                                    $("#confirmation-buttons").hide();
                                                                    $("#pay-selection-header").hide();
                                                                    $("#confirmation-buttons").show();
                                                                    $("#pay-confirm-container").show();
                                                                    $("#email-confirmation").html(email.val().trim());
                                                                    $("#size-confirmation").html(shirtSize.val());
                                                                    $("#pay-confirm").on("click", function(e) {
                                                                        e.preventDefault();
                                                                        instance.requestPaymentMethod(function(err, payload) {
                                                                            // Submit payload to server
                                                                            $("#processing-payment").show();
                                                                            $("#confirmation-buttons").hide();
                                                                            var xhr2 = createCORSRequest("POST", "https://" + PAYMENTS_INSTANCE_NAME + ".herokuapp.com/checkout");
                                                                            xhr2.open("POST", "https://" + PAYMENTS_INSTANCE_NAME + ".herokuapp.com/checkout");
                                                                            xhr2.setRequestHeader("content-type", "application/json");
                                                                            xhr2.onreadystatechange = function() {
                                                                                if (xhr2.readyState == 4 && xhr2.status == 200) {
                                                                                    $('#payModal').animate({ scrollTop: 0 }, 300);
                                                                                    $("#processing-payment").hide();
                                                                                        var response = JSON.parse(JSON.parse(xhr2.responseText)["text"]);
                                                                                        if (response["success"] == false) {
                                                                                            alert(response["errorMessage"]);
                                                                                            $("#payment-error").show()
                                                                                            $("#confirmation-buttons").show();
                                                                                        }
                                                                                        else {
                                                                                            $("#payForm").hide();
                                                                                            $("#pay-complete").show();
                                                                                            $("#pay-confirm-container").hide();
                                                                                            $("#payment-card-details-wrapper").hide();
                                                                                            $("#confirmation-buttons").hide();
                                                                                            $("#payment-error").hide();
                                                                                            $("#member-error").hide();
                                                                                            $("#processing-status").show();
                                                                                            $("#receipt-name").html(response["name"]);
                                                                                            $("#receipt-type").html(response["paymentType"]);
                                                                                            $("#receipt-id").html(response["id"]);
                                                                                            $("#receipt-date").html(response["date"]);
                                                                                            $("#receipt-card").html(response["cardType"] + " " + response["hiddenCCNumber"]);
                                                                                        }
                                                                                    }
                                                                                else if (xhr2.readyState == 4 && xhr2.status != 200) {
                                                                                    $("#processing-payment").hide();
                                                                                    $("#payment-error").show();
                                                                                }
                                                                            };
                                                                            xhr2.send(JSON.stringify({
                                                                                "nonce": payload.nonce,
                                                                                "device_data": payload.deviceData,
                                                                                "email": email.val().trim(),
                                                                                "size": shirtSize.val()
                                                                            }));
                                                                        });
                                                                    });
                                                                }
                                                                else {
                                                                $("#loading-verifying-payment").hide();
                                                                $("#pay-dropin-cancel-btn").show();
                                                                $("#pay-review-btn").show();
                                                                }
                                                            });
                                                        });
                                                    });
                                                }
                                            };
                                            xhr.send();
                                        })
                                    })
                                })
                            });
                        }
                    }
                    else {
                        alert(response['errorMessage']);
                        $("#loading-presubmit-wheel").hide();
                        $("#proceed-to-payment-btn").show();
                        }
                    }
                });
            }
            else {
                $("#loading-presubmit-wheel").hide();
                $("#proceed-to-payment-btn").show();
            }
        });
}
