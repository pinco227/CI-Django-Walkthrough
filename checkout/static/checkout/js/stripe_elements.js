const stripePublicKey = document.getElementById('id_stripe_public_key').innerText.slice(1, -1);
const clientSecret = document.getElementById('id_client_secret').innerText.slice(1, -1);

const stripe = Stripe(stripePublicKey);
const elements = stripe.elements();
const style = {
    base: {
        iconColor: '#000',
        color: '#000',
        fontWeight: '500',
        fontFamily: 'Roboto, Open Sans, Segoe UI, sans-serif',
        fontSize: '16px',
        fontSmoothing: 'antialiased',
        ':-webkit-autofill': {
            color: '#fce883',
        },
        '::placeholder': {
            color: '#aab7c4',
        },
    },
    invalid: {
        iconColor: '#dc3545',
        color: '#dc3545',
    },
};
const card = elements.create('card', { style: style });
card.mount('#card-element');
const errorDiv = document.getElementById('card-errors');
const submitButton = document.getElementById('submit-button');


// Handle realtime validation errors on the card element
card.on('change', (e) => {
    if (e.error) {
        const html = `
            <span class="icon" role="alert">
                <i class="fas fa-times"></i>
            </span>
            <span>${e.error.message}</span>
        `;
        errorDiv.innerHTML = html;
    } else {
        errorDiv.textContent = '';
    }
});

// Handle form submit
const form = document.getElementById('payment-form');
const overlay = document.getElementById('loading-overlay');

form.addEventListener('submit', (e) => {
    e.preventDefault();
    card.update({ 'disabled': true });
    submitButton.setAttribute('disabled', true);
    fadeToggle(form);
    fadeToggle(overlay);

    let saveInfo = false;
    if (document.getElementById('id-save-info')) {
        saveInfo = Boolean(document.getElementById('id-save-info').checked);
    }
    const csrfToken = document.querySelector('input[name="csrfmiddlewaretoken"]').value;
    const data = new FormData();
    data.append('client_secret', clientSecret);
    data.append('save_info', saveInfo);

    const url = '/checkout/cache_checkout_data/';
    const payload = {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
            'X-CSRFToken': csrfToken
        },
        body: data,
    }
    callApi(url, payload, (response) => {
        stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: card,
                billing_details: {
                    name: form.full_name.value,
                    phone: form.phone_number.value,
                    email: form.email.value,
                    address: {
                        line1: form.street_address1.value,
                        line2: form.street_address2.value,
                        city: form.town_or_city.value,
                        country: form.country.value,
                        postal_code: form.postcode.value,
                        state: form.county.value
                    }
                }
            },
            shipping: {
                name: form.full_name.value,
                phone: form.phone_number.value,
                address: {
                    line1: form.street_address1.value,
                    line2: form.street_address2.value,
                    city: form.town_or_city.value,
                    country: form.country.value,
                    postal_code: form.postcode.value,
                    state: form.county.value
                }
            }
        }).then((result) => {
            if (result.error) {
                // Show error to your customer (e.g., insufficient funds)
                const html = `
                    <span class="icon" role="alert">
                        <i class="fas fa-times"></i>
                    </span>
                    <span>${result.error.message}</span>
                `;
                errorDiv.innerHTML = html;
                fadeToggle(form);
                fadeToggle(overlay);
                card.update({ 'disabled': false });
                submitButton.removeAttribute('disabled');
            } else {
                // The payment has been processed!
                if (result.paymentIntent.status === 'succeeded') {
                    form.submit();
                }
            }
        });
    }, (error) => {
        // just reload the page, the error will be in django messages
        location.reload();
    })
});