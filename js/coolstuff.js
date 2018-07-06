var modalIsVisible = false;
var sexyHeaderActivated = false;
$(document).ready(function() {
    $('.cursor').on('click', function(){
        if (!sexyHeaderActivated) {
            $('#normalHeader').hide();
            $('#sexyHeader').show();
            sexyHeaderActivated = true;
        }
        else {
            $('#normalHeader').show();
            $('#sexyHeader').hide();
            sexyHeaderActivated = false;
        }
    });
    $('#submit-join').prop('disabled', true);
    // Add smooth scrolling
    $(".scroll-item").on('click', function(event) {
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
            }, 200, function() {
                // Add hash (#) to URL when done scrolling (default click behavior)
                window.location.hash = hash;
            });
        }
        var x = $("#topnav");
        if (x.attr('class') != "topnav")
            x.attr('class', 'topnav');
    });
    $(".join-btn").on('click', function(event) {
        modalIsVisible = true;
        $("#joinModal").show();
        $("#backToTopBtn").hide();
    });
    $("span", "#joinModal").on('click', function(event) {
        modalIsVisible = false;
        $("#joinModal").hide();
        $("#error").hide();
        $("#joinForm").trigger('reset');
    });
    $(".pay-btn").on('click', function(event) {
        modalIsVisible = true;
        $("#payModal").show();
        $("#backToTopBtn").hide();
    });
    $("span", "#payModal").on('click', function(event) {
        modalIsVisible = false;
        $("#payModal").hide();
        $("#error").hide();
    });
    var getFormData = function($form) {
        var unindexed_array = $form.serializeArray();
        var indexed_array = {};
        $.map(unindexed_array, function(n, i) {
            indexed_array[n['name']] = n['value'];
        });
        return indexed_array;
    }

    var validateJoinForm = function() {
        var fields = $("input", "#joinModal");
        if (fields[0].value != "" && fields[1].value != "" && fields[2].value != "") {
            $('#submit-join').removeClass('disabled');
        } else {
            if (!$('#submit-join').hasClass('disabled')) $('#submit-join').addClass('disabled');
        }
    }

    $(".form-control").on("click change paste keyup", function() {
        validateJoinForm();
    });

    $("#submit-join").on('click', function(event) {
        var fields = $("input", "#joinModal");
        if (fields[0].value != "" && fields[1].value != "" && fields[2].value != "") {
            var $form = $("#joinForm");
            var data = getFormData($form);
            console.log(JSON.stringify(data));
            $.ajax({
                url: 'https://ua-acm-web-util.herokuapp.com/join',
                beforeSend: function(request) {
                    request.setRequestHeader("Access-Control-Allow-Origin", '*');
                },
                data: JSON.stringify(data),
                dataType: 'json',
                contentType: 'application/json',
                type: 'POST',
                success: function() {
                    $(".success-form", "#joinModal").show();
                    $(".form-container", "#joinModal").hide();
                }()
            })
        }
    });
});

function toggleResponsiveNav() {
    var x = document.getElementById("topnav");
    if (x.className === "topnav") {
        x.className += " responsive";
    } else {
        x.className = "topnav";
    }
}
window.onscroll = function() {
    scrollFunction()
};

function scrollFunction() {
    if (!modalIsVisible && (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20)) {
        document.getElementById("backToTopBtn").style.display = "block";
    } else {
        document.getElementById("backToTopBtn").style.display = "none";
    }
}

var text = document.getElementById("pay-input");
var dropDown = document.getElementById("drop-down");
var alerts = document.querySelectorAll("h3.label-alert-hide");
var button = document.getElementById("submit-button");

text.addEventListener('click', function() {
    alerts[0].className = "label label-alert-hide";
    text.classList.remove("alert");
});
dropDown.addEventListener('click', function() {
    alerts[1].className = "label label-alert-hide";
    dropDown.classList.remove("alert");
});

function createCORSRequest(method, url) {
    var xhr = new XMLHttpRequest();
    if ("withCredentials" in xhr) {

        // Check if the XMLHttpRequest object has a "withCredentials" property.
        // "withCredentials" only exists on XMLHTTPRequest2 objects.
        xhr.open(method, url, true);

    } else if (typeof XDomainRequest != "undefined") {

        // Otherwise, check if XDomainRequest.
        // XDomainRequest only exists in IE, and is IE's way of making CORS requests.
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
        }, function (clientErr, clientInstance) {
            // Stop if there was a problem creating the client.
            // This could happen if there is a network error or if the authorization
            // is invalid.
            if (clientErr) {
            console.error('Error creating client:', clientErr);
            return;
            }
        
            // Create a Venmo component.
            braintree.venmo.create({
            client: clientInstance
            }, function (venmoErr, venmoInstance) {
        
            // Stop if there was a problem creating Venmo.
            // This could happen if there was a network error or if it's incorrectly
            // configured.
            if (venmoErr) {
                console.error('Error creating Venmo:', venmoErr);
                return;
            }
        
            // ...
            });
        });
        //Accept card payments
        braintree.dropin.create({
            authorization: xhr.responseText,
            container: '#dropin-container',
            venmo: {
                allowNewBrowserTab: false
            }
        }, function(createErr, instance) {
            button.addEventListener('click', function() {
                if (!text.value.length) {
                    alerts[0].className = "label label-alert-show";
                    text.classList.add("alert");
                }
                if (dropDown.value == "--") {
                    alerts[1].className = "label label-alert-show";
                    dropDown.classList.add("alert");
                }
                if (text.value.length && dropDown.value != "none") {
                    instance.requestPaymentMethod(function(err, payload) {
                        // Submit payload to server
                        var xhr2 = createCORSRequest("POST", "https://ua-acm-web-payments.herokuapp.com/checkout");
                        xhr2.open("POST", "https://ua-acm-web-payments.herokuapp.com/checkout");
                        xhr2.setRequestHeader("content-type", "application/json");
                        xhr2.onreadystatechange = function() {
                            console.log("ReadyState");
                            if (xhr2.readyState == 4 && xhr2.status == 200) {
                                $("#success-form").show();
                                $("#payment-wrapper").hide();
                                $("#form").hide();
                            }
                        };
                        xhr2.send(JSON.stringify({
                            "nonce": payload.nonce,
                            "email": text.value,
                            "size": dropDown.options[dropDown.selectedIndex].value
                        }));
                    });
                }
            });
        });
        //Paypal support
        //Create a client.
        // braintree.client.create({
        //     authorization: xhr.responseText
        // }, function(clientErr, clientInstance) {

        //     // Stop if there was a problem creating the client.
        //     // This could happen if there is a network error or if the authorization
        //     // is invalid.
        //     if (clientErr) {
        //         console.error('Error creating client:', clientErr);
        //         return;
        //     }

        //     // Create a PayPal Checkout component.
        //     braintree.paypalCheckout.create({
        //         client: clientInstance
        //     }, function(paypalCheckoutErr, paypalCheckoutInstance) {

        //         // Stop if there was a problem creating PayPal Checkout.
        //         // This could happen if there was a network error or if it's incorrectly
        //         // configured.
        //         if (paypalCheckoutErr) {
        //             console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
        //             return;
        //         }

        //         // Set up PayPal with the checkout.js library
        //         paypal.Button.render({
        //             env: 'sandbox',

        //             payment: function() {
        //                 return paypalCheckoutInstance.createPayment({
        //                     flow: 'checkout', // Required
        //                     amount: 10.00, // Required
        //                     currency: 'USD', // Required
        //                 });
        //             },

        //             onAuthorize: function(data, actions) {
        //                 return paypalCheckoutInstance.tokenizePayment(data)
        //                     .then(function(payload) {
        //                         // Submit payload to server.
        //                         var xhr2 = new XMLHttpRequest();
        //                         xhr2.open("POST", "https://ua-acm-web-payments.herokuapp.com/checkout");
        //                         xhr2.setRequestHeader("content-type", "application/json");
        //                         xhr2.send(JSON.stringify({
        //                             "nonce": payload.nonce
        //                         }));
        //                     });
        //             },

        //             onCancel: function(data) {
        //                 console.log('checkout.js payment cancelled', JSON.stringify(data, 0, 2));
        //             },

        //             onError: function(err) {
        //                 console.error('checkout.js error', err);
        //             }
        //         }, '#paypal-button').then(function() {
        //             // The PayPal button will be rendered in an html element with the id
        //             // `paypal-button`. This function will be called when the PayPal button
        //             // is set up and ready to be used.
        //         });

        //     });

        // });
        
        
    }
};
xhr.send();