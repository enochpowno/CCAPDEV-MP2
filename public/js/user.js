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
                <a href='/review/view?review=${doc._id}&movie=${doc.movie}' class='w-100 btn btn-sm btn-primary'>View Review</a>
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

    $('#userReviews > *:not(.spinner)').remove();
    $('#userReviews .spinner').removeClass('d-none');
    const pagination = $('<ul class=\'pagination\'></ul>');
    const pagesArray = [];

    $.ajax({
      url: `/user/reviews/${$('#user').val()}`,
      method: 'GET',
      data: {
        page,
      },
      success: (results) => {
        if (results.results.totalDocs > 0) {
          $('#noReviews').remove();

          maxPages = results.results.totalPages;

          if (results.results.hasPrevPage) {
            pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.prevPage}\' href="#"> << </a></li>`));
          } else {
            pagesArray.push($('<li class="page-item disabled"><a class="page-link"> << </a></li>'));
          }

          for (let i = 0; i < maxPages; i++) {
            pagesArray.push($(`<li class="page-item ${currentPage == i + 1 ? 'active' : ''}"><a class="page-link" data-page="${i + 1}" href="#">${i + 1}</a></li>`));
          }

          if (results.results.hasNextPage) {
            pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.nextPage}\' href="#"> >> </a></li>`));
          } else {
            pagesArray.push($('<li class="page-item disabled"><a class="page-link"> >> </a></li>'));
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

          pagination.rPage();
          $('#userReviews').append(pagination, ...createReviewRows(results.results.docs));
        }

        $('#userReviews .spinner').addClass('d-none');
      },
    });
  }

  function createWatchedRows(docs) {
    const rows = [];

    docs.forEach((doc) => {
      rows.push($(`
        <a style='text-decoration: none' href='/movie/view/${doc._id}' class='row my-2'>
          <div class='col-md-3 my-3 text-center'>
            <img src='${img(doc.poster)}' style='height: 50px; width: auto;'>
          </div>
          <div class='col-md-9 my-3'>
            <div class='row'>
              <div class='col-md-8'>
                <h6>${doc.title}</h6>
              </div>
            </div>
          </div>
        </a>
        <hr/>
      `));
    });

    return rows;
  }

  function loadVideos(page) {
    if (page <= 0) currentPage = 1;
    else if (page > maxPages) currentPage = maxPages;
    else currentPage = page;

    $('#userWatched > *:not(.spinner)').remove();
    $('#userWatched .spinner').removeClass('d-none');
    const pagination = $('<ul class=\'pagination\'></ul>');
    const pagesArray = [];

    $.ajax({
      url: `/user/watched/${$('#user').val()}`,
      method: 'GET',
      data: {
        page,
      },
      success: (results) => {
        if (results.results.totalDocs > 0) {
          $('#noWatched').remove();

          maxPages = results.results.totalPages;

          if (results.results.hasPrevPage) {
            pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.prevPage}\' href="#"> << </a></li>`));
          } else {
            pagesArray.push($('<li class="page-item disabled"><a class="page-link"> << </a></li>'));
          }

          for (let i = 0; i < maxPages; i++) {
            pagesArray.push($(`<li class="page-item ${currentPage == i + 1 ? 'active' : ''}"><a class="page-link" data-page="${i + 1}" href="#">${i + 1}</a></li>`));
          }

          if (results.results.hasNextPage) {
            pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.nextPage}\' href="#"> >> </a></li>`));
          } else {
            pagesArray.push($('<li class="page-item disabled"><a class="page-link"> >> </a></li>'));
          }

          pagination.append(...pagesArray);
          pagination.find('a').each((i, element) => {
            $(element).click((e) => {
              e.preventDefault();

              if ($(element).attr('data-page') == 'next') loadVideos(currentPage + 1);
              else if ($(element).attr('data-page') == 'prev') loadVideos(currentPage - 1);
              else loadVideos(parseInt($(element).attr('data-page'), 10));
            });
          });

          pagination.rPage();
          $('#userWatched').append(pagination, ...createWatchedRows(results.results.docs));
        } else {
          $('#userWatched').html('<h5>This user hasn\'t watched any movies yet...</h5>');
        }
      },
      complete: () => {
        $('#userWatched .spinner').addClass('d-none');
      },
    });
  }

  loadVideos(1);
  loadReviews(1);
});
