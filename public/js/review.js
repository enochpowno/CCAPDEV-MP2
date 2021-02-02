$(document).ready(() => {
  $('#comment textarea').keypress((e) => {
    console.log(e);
  });

  $('#vote').submit((e) => e.preventDefault());

  $('#vote button').click((e) => {
    const el = $(e.target);

    if (el.attr('type') == 'submit') {
      const data = {
        hadUpvoted: $('#vote input[name=hadUpvoted]').val(),
        hadDownvoted: $('#vote input[name=hadDownvoted]').val(),
        review: $('#review').val(),
      };

      $.ajax({
        url: `/review/vote/${el.attr('data-type')}`,
        method: 'PUT',
        data,
        success: (result) => {
          if (result.success) {
            if (el.attr('data-type') == 'up') {
              if (data.hadDownvoted == 'true') {
                $('#downvoteCountReview').text(abbreviateNumber(parseInt($('#downvoteCountReview').attr('data-num'), 10) - 1));
                $('#downvoteCountReview').attr('data-num', parseInt($('#downvoteCountReview').attr('data-num'), 10) - 1);
              }

              $('#vote input[name=hadUpvoted]').val('true');
              $('#vote input[name=hadDownvoted]').val('false');

              $('#vote button[data-type=up]').addClass('disabled');
              $('#vote button[data-type=up]').attr('type', 'button');
              $('#vote button[data-type=down]').removeClass('disabled');
              $('#vote button[data-type=down]').attr('type', 'submit');

              $('#upvoteCountReview').text(abbreviateNumber(parseInt($('#upvoteCountReview').attr('data-num'), 10) + 1));
              $('#upvoteCountReview').attr('data-num', parseInt($('#upvoteCountReview').attr('data-num'), 10) + 1);
            } else {
              if (data.hadUpvoted == 'true') {
                $('#upvoteCountReview').text(abbreviateNumber(parseInt($('#upvoteCountReview').attr('data-num'), 10) - 1));
                $('#upvoteCountReview').attr('data-num', parseInt($('#upvoteCountReview').attr('data-num'), 10) - 1);
              }

              $('#vote input[name=hadUpvoted]').val('false');
              $('#vote input[name=hadDownvoted]').val('true');

              $('#vote button[data-type=down]').addClass('disabled');
              $('#vote button[data-type=down]').attr('type', 'button');
              $('#vote button[data-type=up]').removeClass('disabled');
              $('#vote button[data-type=up]').attr('type', 'submit');

              $('#downvoteCountReview').text(abbreviateNumber(parseInt($('#downvoteCountReview').attr('data-num'), 10) + 1));
              $('#downvoteCountReview').attr('data-num', parseInt($('#downvoteCountReview').attr('data-num'), 10) + 1);
            }
          }
        },
      });
    }
  });

  $('#update').submit((e) => {
    e.preventDefault();

    $('form#update button[type=submit]').addClass('disabled');
    $('form#update a').addClass('disabled');
    $('form#update button[type=submit] b').text('');
    $('form#update button[type=submit] span').removeClass('visually-hidden');
    $('#update .responseView').empty();

    const fd = new FormData($('#update')[0]);

    const ajaxOpts = {
      url: '/review',
      method: 'PUT',
      processData: false,
      contentType: false,
      data: fd,
      success: (result) => {
        $('#update .responseView').html(createResponseView(result));

        if (result.success) {
          $("#update input[name=title]").attr('value', result.updates.title);
          $("#update textarea, #reviewContent").text(result.updates.content);
          $("#reviewTitle").text(result.updates.title);
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

  $('#updateBtn').click((e) => {
    $('form#update')[0].reset();
  });
});
