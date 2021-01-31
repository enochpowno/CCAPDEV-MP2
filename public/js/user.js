$(document).ready(() => {
  let updateType = 'details';

  $('#update .nav-pills a').click((event) => {
    updateType = $(event.target).attr('data-type');
  });

  $('#update').submit((e) => {
    e.preventDefault();

    const password = $('form#update input[name=password]').val();
    const name = $('form#update input[name=name]').val();
    const description = $('form#update textarea[name=description]').val();
    const photo = $('form#update input[name=photo]').get(0).files[0];

    const npassword = $('form#update input[name=npassword]').val();
    const cpassword = $('form#update input[name=cpassword]').val();

    $('form#update button[type=submit]').addClass('disabled');
    $('form#update a').addClass('disabled');
    $('form#update button[type=submit] b').text('');
    $('form#update button[type=submit] span').removeClass('visually-hidden');
    $('#update .responseView').empty();

    const fd = new FormData();

    if (updateType == 'details') {
      fd.append('name', name);
      fd.append('description', description);

      if (photo) fd.append('photo', photo);
    } else if (updateType == 'password') {
      fd.append('npassword', npassword);
      fd.append('cpassword', cpassword);
    }

    fd.append('password', password);
    fd.append('type', updateType);
    const ajaxOpts = {
      url: '/user',
      method: 'PUT',
      processData: false,
      contentType: false,
      data: fd,
      success: (result) => {
        $('#update .responseView').html(createResponseView(result));

        if (result.success) {
          if (updateType == 'details') {
            $('form#update input[name=name]').attr('value', name);
            $('form#update textarea[name=description]').attr('value', description);

            console.log(result);

            $('#nameView').text(result.updates.name);
            $('#descriptionView').text(result.updates.description);

            if (photo) {
              $('#photoView').attr('src', img(result.updates.photo));
            }
          }

          $('form#update')[0].reset();
        }
      },
      complete: (result) => {
        $('form#update button[type=submit] b').text('Update');
        $('form#update a').removeClass('disabled');
        $('form#update button[type=submit]').removeClass('disabled');
        $('form#update button[type=submit] span').addClass('visually-hidden');
      },
    };

    $.ajax(ajaxOpts);
  });

  $("#reviews").ready(() => {
    $(".pagination").rPage();
  });
});
