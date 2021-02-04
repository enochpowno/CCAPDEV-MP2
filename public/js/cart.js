/* eslint-disable object-shorthand */
/* eslint-disable prefer-arrow-callback */
$(document).ready(() => {
  $('.remove').click((e) => {
    e.preventDefault();

    $.ajax({
      url: '/movie/cart/remove',
      method: 'DELETE',
      data: { movie: $(e.target).attr('data-movie') },
      success: (result) => {
        if (result.success) {
          $(e.target).parents('.movie-row').remove();

          $('.cart-badge').text($('.movie-row').length);

          if ($('.movie-row').length <= 0) {
            $('#movies > .col-md-9').html('<h6 class="display-6">You have no movies in your cart...</h6>');
            $('#movies > .col-md-3').empty();
          }
        }
      },
    });
  });

  paypal.Buttons({
    env: 'sandbox',
    createOrder: function () {
      return fetch('/movie/cart/purchase', {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        console.log(data);
        return data.id; // Use the key sent by your server's response, ex. 'id' or 'token'
      });
    },

    onApprove: function (data) {
      return fetch('/movie/cart/purchase/complete', {
        method: 'post',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
        }),
      }).then(function (res) {
        return res.json();
      }).then(function (details) {
        if (details.success) window.location.href = '/movie/view/cart/purchase/complete';
        else {
          $('#responseView').html(createResponseView(details));
        }
      });
    },
  }).render('#paypal-button');
});
