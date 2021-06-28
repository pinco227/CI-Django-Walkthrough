from django.shortcuts import get_object_or_404, redirect, render, reverse, HttpResponse
from django.contrib import messages
from django.conf import settings
from django.views.decorators.http import require_POST

from checkout.forms import OrderForm
from bag.contexts import bag_contents
from .models import Order, OrderLineItem
from products.models import Product

import json
import stripe


def checkout(request):
    stripe_public_key = settings.STRIPE_PUBLIC_KEY
    stripe_secret_key = settings.STRIPE_SECRET_KEY
    bag = request.session.get('bag', {})

    # POST METHOD
    if request.method == 'POST':
        form_data = {
            'full_name': request.POST['full_name'],
            'email': request.POST['email'],
            'phone_number': request.POST['phone_number'],
            'country': request.POST['country'],
            'postcode': request.POST['postcode'],
            'town_or_city': request.POST['town_or_city'],
            'street_address1': request.POST['street_address1'],
            'street_address2': request.POST['street_address2'],
            'county': request.POST['county'],
        }
        order_form = OrderForm(form_data)

        # FORM IS VALID
        if order_form.is_valid():
            order = order_form.save(commit=False)
            pid = request.POST.get('client_secret').split('_secret')[0]
            order.stripe_pid = pid
            order.original_bag = json.dumps(bag)
            order.save()
            for item_id, item_data in bag.items():
                try:
                    product = Product.objects.get(id=item_id)
                    if isinstance(item_data, int):
                        order_line_item = OrderLineItem(
                            order=order,
                            product=product,
                            quantity=item_data,
                        )
                        order_line_item.save()
                    else:
                        for size, quantity in item_data['items_by_size'].items():
                            order_line_item = OrderLineItem(
                                order=order,
                                product=product,
                                quantity=quantity,
                                product_size=size,
                            )
                            order_line_item.save()
                except Product.DoesNotExist:
                    messages.error(request, (
                        "One of the products in your bag wasn't "
                        "found in our database. "
                        "Please call us for assistance!")
                    )
                    order.delete()
                    return redirect(reverse('view_bag'))

            request.session['save_info'] = 'save_info' in request.POST
            return redirect(reverse('checkout_success', args=[order.order_number]))
        # FORM INVALID
        else:
            messages.error(request, 'There was an error with your form. \
                Please double check your information.')

    # GET METHOD
    else:
        if not bag:
            messages.error(
                request, "There is no products in your bag. Add some products to continue!")
            return redirect(reverse('products'))

        current_bag = bag_contents(request)
        total = current_bag['grand_total']
        stripe_total = round(total * 100)
        stripe.api_key = stripe_secret_key
        intent = stripe.PaymentIntent.create(
            amount=stripe_total,
            currency=settings.STRIPE_CURRENCY,
        )

        order_form = OrderForm()

    if not stripe_public_key:
        messages.warning(request, 'Stripe public key is missing. \
            Did you forget to set it in your environment?')

    template = 'checkout/checkout.html'
    context = {
        'order_form': order_form,
        'stripe_public_key': stripe_public_key,
        'client_secret': intent.client_secret,
    }

    return render(request, template, context)


def checkout_success(request, order_number):
    """ Handle successful checkputs """

    save_info = request.session.get('save_info')
    order = get_object_or_404(Order, order_number=order_number)
    messages.success(request, f'<strong>Order successfully submitted!</strong>\
        <br> Your order number is <strong>{ order.order_number }</strong>. \
        A confirmation email will be sent to <strong><em>{ order.email }\
        </em></strong>.')

    if 'bag' in request.session:
        del request.session['bag']

    template = 'checkout/checkout_success.html'
    context = {
        'order': order,
    }

    return render(request, template, context)


@require_POST
def cache_checkout_data(request):
    try:
        post_data = request.POST
        pid = post_data.get('client_secret').split('_secret')[0]
        stripe.api_key = settings.STRIPE_SECRET_KEY
        stripe.PaymentIntent.modify(pid, metadata={
            'bag': json.dumps(request.session.get('bag', {})),
            'save_info': post_data.get('save_info'),
            'username': request.user
        })
        return HttpResponse(status=200)
    except Exception as e:
        messages.error(request, 'Sorry, your payment cannot be processed \
            right now. Please try again later.')
        return HttpResponse(content=e, status=400)
