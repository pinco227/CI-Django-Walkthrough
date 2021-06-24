const stripe_public_key = document.getElementById('id_stripe_public_key').innerText.slice(1, -1);
const client_secret = document.getElementById('id_client_secret').innerText.slice(1, -1);

const stripe = Stripe(stripe_public_key);
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