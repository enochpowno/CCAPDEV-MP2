$(document).ready(() => {
  $('form').submit((e) => {
    e.preventDefault();

    const fd = new FormData($('form.container.card')[0]);
    $('#responseView').empty();
    $('form.container.card button').addClass('disabled');
    $('form.container.card button b').text('');
    $('form.container.card button span').removeClass('visually-hidden');
    $.ajax({
      url: '/user/register',
      method: 'POST',
      processData: false,
      contentType: false,
      data: fd,
      success: (result) => {
        $('#responseView').append(createResponseView(result));

        if (result.success) {
          $('form.container.card')[0].reset();
        }
      },
      complete: () => {
        $('form.container.card button b').text('Register');
        $('form.container.card button').removeClass('disabled');
        $('form.container.card button span').addClass('visually-hidden');
      },
    });
  });
});
