$(document).ready(() => {
  $('form').submit((e) => {
    e.preventDefault();

    const data = $('form.container.card').serialize();
    $('#responseView').empty();
    $('form.container.card button').addClass('disabled');
    $('form.container.card button b').text('');
    $('form.container.card button span').removeClass('visually-hidden');
    $.ajax({
      url: '/user/login',
      method: 'POST',
      data,
      success: (result) => {
        $('#responseView').append(createResponseView(result));

        if (result.success) {
          $('form.container.card')[0].reset();
          window.location.href = '/user/';
        }
      },
      complete: () => {
        $('form.container.card button b').text('Log In');
        $('form.container.card button').removeClass('disabled');
        $('form.container.card button span').addClass('visually-hidden');
      },
    });
  });
});
