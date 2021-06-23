from django.shortcuts import redirect, render, reverse
from django.contrib import messages

from checkout.forms import OrderForm


def checkout(request):
    bag = request.session.get('bag', {})
    if not bag:
        messages.error(
            request, "There is no products in your bag. Add some products to continue!")
        return redirect(reverse('products'))

    order_form = OrderForm()
    template = 'checkout/checkout.html'

    context = {
        'order_form': order_form,
    }

    return render(request, template, context)
