$(document).ready(() => {
  let currentPage = 1;
  let maxPages = Number.MAX_VALUE;

  function createReviewRows(docs) {
    const rows = [];

    docs.forEach((doc) => {
      rows.push($(`
        <div class='row'>
          <div class='col-md-3 my-3 text-center'>
            <img src='${img(doc.user.photo)}' style='height: auto; width: 60%;'>
          </div>
          <div class='col-md-9 my-3'>
            <div class='row'>
              <div class='col-md-8'>
                <h6>${doc.title}</h6>
              </div>
              <div class='col-md-4'>
                <span class='text-muted'>Last Updated: ${datePrint(new Date(doc.date))}</span>
              </div>
            </div>
            <div class='row'>
              <p class='col-md-8'> ${(doc.content.length > 250) ? `${doc.content.substr(0, 250)}...` : doc.content} <br/> ~ <a href='/user/view/${doc.user._id}' style='text-decoration: none'>@${doc.user.username}</a></p>
              <div class='col-md-4'>
                <a href='/review/view/${doc._id}' class='w-100 btn btn-sm btn-primary'>View Review</a>
              </div>
            </div>
          </div>
          <hr/>
        </div>
      `));
    });

    return rows;
  }

  function loadReviews(page) {
    if (page <= 0) currentPage = 1;
    else if (page > maxPages) currentPage = maxPages;
    else currentPage = page;

    $('#movieReviews > *:not(.spinner)').remove();
    $('#movieReviews .spinner').removeClass('d-none');
    const pagination = $('<ul class=\'pagination\'></ul>');
    const pagesArray = [];

    $.ajax({
      url: `/review/${$('#movie').val()}`,
      method: 'GET',
      data: {
        page: currentPage,
      },
      success: (results) => {
        maxPages = results.results.totalPages;

        if (results.results.hasPrevPage) {
          pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.prevPage}\' href="#"> << </a></li>`));
        } else {
          pagesArray.push($('<li class="page-item disabled"><a class="page-link"> &laquo; </a></li>'));
        }

        for (let i = 0; i < maxPages; i++) {
          pagesArray.push($(`<li class="page-item ${currentPage == i + 1 ? 'active' : ''}"><a class="page-link" data-page="${i + 1}" href="#">${i + 1}</a></li>`));
        }

        if (results.results.hasNextPage) {
          pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.nextPage}\' href="#"> >> </a></li>`));
        } else {
          pagesArray.push($('<li class="page-item disabled"><a class="page-link"> &raquo; </a></li>'));
        }

        pagination.append(...pagesArray);
        pagination.find('a').each((i, element) => {
          $(element).click((e) => {
            e.preventDefault();

            if ($(element).attr('data-page') == 'next') loadReviews(currentPage + 1);
            else if ($(element).attr('data-page') == 'prev') loadReviews(currentPage - 1);
            else loadReviews(parseInt($(element).attr('data-page'), 10));
          });
        });

        $('#movieReviews').append(pagination, ...createReviewRows(results.results.docs));

        pagination.rPage();
        $('#movieReviews .spinner').addClass('d-none');
      },
    });
  }

  $('#vote').submit((e) => e.preventDefault());

  $('#vote button').click((e) => {
    const el = $(e.target);

    if (el.attr('type') == 'submit') {
      const data = {
        hadUpvoted: $('#vote input[name=hadUpvoted]').val() === 'true',
        hadDownvoted: $('#vote input[name=hadDownvoted]').val() === 'true',
        movie: $('#movie').val(),
      };

      $.ajax({
        url: `/movie/vote/${el.attr('data-type')}`,
        method: 'PUT',
        data,
        success: (result) => {
          if (result.success) {
            if (el.attr('data-type') == 'up') {
              $('#vote input[name=hadUpvoted]').val('true');
              $('#vote input[name=hadDownvoted]').val('false');

              $('#vote button[data-type=up]').addClass('disabled');
              $('#vote button[data-type=up]').attr('type', 'button');
              $('#vote button[data-type=down]').removeClass('disabled');
              $('#vote button[data-type=down]').attr('type', 'submit');

              $('#vote #upvoteCount').text(abbreviateNumber(parseInt($('#vote #upvoteCount').attr('data-num'), 10) + 1));
              $('#vote #upvoteCount').attr('data-num', parseInt($('#vote #upvoteCount').attr('data-num'), 10) + 1);

              if (data.hadDownvoted) {
                $('#vote #downvoteCount').text(abbreviateNumber(parseInt($('#vote #downvoteCount').attr('data-num'), 10) - 1));
                $('#vote #downvoteCount').attr('data-num', parseInt($('#vote #downvoteCount').attr('data-num'), 10) - 1);
              }
            } else {
              $('#vote input[name=hadUpvoted]').val('false');
              $('#vote input[name=hadDownvoted]').val('true');

              $('#vote button[data-type=down]').addClass('disabled');
              $('#vote button[data-type=down]').attr('type', 'button');
              $('#vote button[data-type=up]').removeClass('disabled');
              $('#vote button[data-type=up]').attr('type', 'submit');

              $('#vote #downvoteCount').text(abbreviateNumber(parseInt($('#vote #downvoteCount').attr('data-num'), 10) + 1));
              $('#vote #downvoteCount').attr('data-num', parseInt($('#vote #downvoteCount').attr('data-num'), 10) + 1);

              if (data.hadUpvoted) {
                $('#vote #upvoteCount').text(abbreviateNumber(parseInt($('#vote #upvoteCount').attr('data-num'), 10) - 1));
                $('#vote #upvoteCount').attr('data-num', parseInt($('#vote #upvoteCount').attr('data-num'), 10) - 1);
              }
            }
          }
        },
      });
    }
  });

  loadReviews(1);

  $('#review').submit((e) => {
    e.preventDefault();

    const data = $(e.target).serialize();
    $('#responseView').empty();
    $('#review button').addClass('disabled');
    $('#review button b').text('');
    $('#review button span').removeClass('visually-hidden');
    $.ajax({
      url: '/review',
      method: 'POST',
      data,
      success: (result) => {
        $('#responseView').append(createResponseView(result));

        if (result.success) {
          $('#review')[0].reset();
          loadReviews(1);
          $('#noReviews').remove();
        }
      },
      complete: () => {
        $('#review button b').text('Leave Review');
        $('#review button').removeClass('disabled');
        $('#review button span').addClass('visually-hidden');
      },
    });
  });
});
