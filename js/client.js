(function() {
    var text = document.getElementById("input");
    var dropDown = document.getElementById("drop-down");
    var alerts = document.querySelectorAll("h3.label-alert-hide");
    var button = document.querySelector("#submit-button");

    text.addEventListener('click', function () {
        alerts[0].className = "label label-alert-hide";
        text.classList.remove("alert");
    });
    dropDown.addEventListener('click', function () {
        alerts[1].className = "label label-alert-hide";
        dropDown.classList.remove("alert");
    });


    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/client_token")
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            //Accept card payments
            braintree.dropin.create({
                    authorization: xhr.responseText,
                    container: '#dropin-container'
                }, function (createErr, instance) {
                    button.addEventListener('click', function () {
                        if (!text.value.length) {
                            alerts[0].className = "label label-alert-show";
                            text.classList.add("alert");
                        }
                        if (dropDown.value == "none") {
                            alerts[1].className = "label label-alert-show";
                            dropDown.classList.add("alert");
                        }
                        if (text.value.length && dropDown.value != "none") {
                            instance.requestPaymentMethod(function (err, payload) {
                                // Submit payload to server
                                var xhr2 = new XMLHttpRequest();
                                xhr2.open("POST", "/checkout");
                                xhr2.setRequestHeader("content-type", "application/json");
                                xhr2.onreadystatechange = function() {
                                    console.log("ReadyState");
                                    if(xhr2.readyState == 4 && xhr2.status == 200) {
                                        window.location.href = "../pages/success.html";
                                    }
                                };
                                xhr2.send(JSON.stringify({"nonce": payload.nonce, "email": text.value, "size": dropDown.options[dropDown.selectedIndex].value}));
                            });
                        }
                    });
            });
            //Paypal support
            //Create a client.
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

                // Create a PayPal Checkout component.
                braintree.paypalCheckout.create({
                    client: clientInstance
                }, function (paypalCheckoutErr, paypalCheckoutInstance) {

                    // Stop if there was a problem creating PayPal Checkout.
                    // This could happen if there was a network error or if it's incorrectly
                    // configured.
                    if (paypalCheckoutErr) {
                        console.error('Error creating PayPal Checkout:', paypalCheckoutErr);
                        return;
                    }

                    // Set up PayPal with the checkout.js library
                    paypal.Button.render({
                        env: 'sandbox', 

                        payment: function () {
                            return paypalCheckoutInstance.createPayment({
                                flow: 'checkout', // Required
                                amount: 10.00, // Required
                                currency: 'USD', // Required
                            });
                        },

                        onAuthorize: function (data, actions) {
                            return paypalCheckoutInstance.tokenizePayment(data)
                                .then(function (payload) {
                                    // Submit payload to server.
                                    var xhr2 = new XMLHttpRequest();
                                    xhr2.open("POST", "/checkout");
                                    xhr2.setRequestHeader("content-type", "application/json");
                                    xhr2.send(JSON.stringify({"nonce": payload.nonce}));
                                });
                        },

                        onCancel: function (data) {
                            console.log('checkout.js payment cancelled', JSON.stringify(data, 0, 2));
                        },

                        onError: function (err) {
                            console.error('checkout.js error', err);
                        }
                    }, '#paypal-button').then(function () {
                        // The PayPal button will be rendered in an html element with the id
                        // `paypal-button`. This function will be called when the PayPal button
                        // is set up and ready to be used.
                    });

                });

            });
        }
    };
    xhr.send();
})();