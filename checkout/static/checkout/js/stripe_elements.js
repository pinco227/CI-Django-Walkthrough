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

form.addEventListener('submit', (e) => {
    e.preventDefault();
    card.update({ 'disabled': true });
    submitButton.setAttribute('disabled', true);
    // If the client secret was rendered server-side as a data-secret attribute
    // on the <form> element, you can retrieve it here by calling `form.dataset.secret`
    stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: card,
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
            card.update({ 'disabled': false });
            submitButton.removeAttribute('disabled');
        } else {
            // The payment has been processed!
            if (result.paymentIntent.status === 'succeeded') {
                form.submit();
            }
        }
    });
});