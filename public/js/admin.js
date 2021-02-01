$(document).ready(() => {
  let currentPage = 1;
  let maxPages = Number.MAX_SAFE_INTEGER;

  $('#addMovie').submit((e) => {
    e.preventDefault();

    const fd = new FormData($('#addMovie')[0]);
    $('#responseView').empty();
    $('#addMovie button').addClass('disabled');
    $('#addMovie button b').text('');
    $('#addMovie button span').removeClass('visually-hidden');
    $.ajax({
      url: '/movie',
      method: 'POST',
      processData: false,
      contentType: false,
      data: fd,
      success: (result) => {
        $('#responseView').append(createResponseView(result));

        if (result.success) {
          $('#addMovie')[0].reset();
          loadMovies(1);
        }
      },
      complete: () => {
        $('#addMovie button b').text('Add Movie');
        $('#addMovie button').removeClass('disabled');
        $('#addMovie button span').addClass('visually-hidden');
      },
    });
  });

  $('#update').submit((e) => {
    e.preventDefault();

    $('form#update button[type=submit]').addClass('disabled');
    $('form#update a').addClass('disabled');
    $('form#update button[type=submit] b').text('');
    $('form#update button[type=submit] span').removeClass('visually-hidden');
    $('#update #responseViewUpdate').empty();
    const fd = new FormData($('#update')[0]);
    const ajaxOpts = {
      url: '/movie',
      method: 'PUT',
      processData: false,
      contentType: false,
      data: fd,
      success: (result) => {
        $('#update #responseViewUpdate').html(createResponseView(result));

        if (result.success) {
          $('#update [name=title]').attr('value', result.updates.title);
          $('#update [name=synopsis]').text(result.updates.synopsis);
          $('#update [name=price]').attr('value', result.updates.price);
          $('#update [name=status]').attr('value', result.updates.status);

          if (result.updates.poster) {
            $(`.card[data-movie='${$('#update input[name=id]').val()}'] img`).attr('src', img(result.updates.poster));
            $(`.card[data-movie='${$('#update input[name=id]').val()}'] img`).attr('alt', img(result.updates.title));
          }

          $(`.card[data-movie='${$('#update input[name=id]').val()}'] .card-title a`).text(result.updates.title);
          $(`.card[data-movie='${$('#update input[name=id]').val()}'] .card-text`).text(result.updates.synopsis.substr(0, 100) + ((result.updates.synopsis.length > 100) ? '...' : ''));

          $(`.card[data-movie='${$('#update input[name=id]').val()}'] .update-movie`).off('click');
          $(`.card[data-movie='${$('#update input[name=id]').val()}'] .update-movie`).click((e) => {
            e.preventDefault();

            $('#update').get(0).reset();
            $('#update [name=title]').attr('value', result.updates.title);
            $('#update [name=synopsis]').text(result.updates.synopsis);
            $('#update [name=price]').attr('value', result.updates.price);
            $('#update [name=status]').attr('value', result.updates.status);
            $('#update [name=id]').attr('value', $('#update input[name=id]').val());

            $('#update').modal('show');
            $('#update #responseViewUpdate').empty();
          });

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

  function createMovieCard(movie) {
    const card = $(`
      <div class='col-lg-3 my-3'>
        <div class="item card" data-movie="${movie._id}">
          <img src="${img(movie.poster)}" class="card-img-top" alt="${movie.title}"/>
          <div class="card-body">
            <h5 class="card-title"><a href="/movie/view/${movie._id}">${movie.title}</a></h5>
            <hr/>
            <p class="card-text">${movie.synopsis.substr(0, 100) + ((movie.synopsis.length > 100) ? '...' : '')}</p>
          </div>
          <div class="card-footer">
            <button class="update-movie btn btn-sm btn-primary">Update Movie</button>
            <button class="delete-movie btn btn-sm btn-danger">Delete Movie</button>
          </div>
        </div>
      </div>
    `);

    card.find('button.update-movie').click((e) => {
      e.preventDefault();

      $('#update').get(0).reset();
      $('#update [name=title]').attr('value', movie.title);
      $('#update [name=synopsis]').text(movie.synopsis);
      $('#update [name=price]').attr('value', movie.price);
      $('#update [name=status]').attr('value', movie.status);
      $('#update [name=id]').attr('value', movie._id);

      $('#update').modal('show');
      $('#update #responseViewUpdate').empty();
    });

    card.find('button.delete-movie').click((e) => {
      e.preventDefault();

      $.ajax({
        url: '/movie',
        method: 'DELETE',
        data: { movie: movie._id },
        success: (result) => {
          if (result.success) {
            card.remove();
          }
        },
      });
    });
    return card;
  }

  function loadMovies(page) {
    if (page < 0) currentPage = 1;
    else if (page > Number.MAX_SAFE_INTEGER) currentPage = maxPages;
    else currentPage = page;

    $('#movies > *:not(.spinner)').remove();
    $('#movies .spinner').removeClass('d-none');
    const pagination = $('<ul class=\'pagination\'></ul>');
    const pagesArray = [];

    $.ajax({
      url: '/movie/search/',
      method: 'GET',
      data: { page: currentPage, q: $('input[name=q]').val() },
      success: (results) => {
        maxPages = results.results.totalPages;

        if (results.results.hasPrevPage) {
          pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.prevPage}\' href="#"> &laquo; </a></li>`));
        } else {
          pagesArray.push($('<li class="page-item disabled"><a class="page-link"> &laquo; </a></li>'));
        }

        for (let i = 0; i < maxPages; i++) {
          pagesArray.push($(`<li class="page-item ${currentPage == i + 1 ? 'active' : ''}"><a class="page-link" data-page="${i + 1}" href="#">${i + 1}</a></li>`));
        }

        if (results.results.hasNextPage) {
          pagesArray.push($(`<li class="page-item"><a class="page-link" data-page=\'${results.results.nextPage}\' href="#"> &raquo; </a></li>`));
        } else {
          pagesArray.push($('<li class="page-item disabled"><a class="page-link"> &raquo; </a></li>'));
        }

        pagination.append(...pagesArray);
        pagination.find('a').each((i, element) => {
          $(element).click((e) => {
            e.preventDefault();

            if ($(element).attr('data-page') == 'next') loadReviews(currentPage + 1);
            else if ($(element).attr('data-page') == 'prev') loadReviews(currentPage - 1);
            else loadMovies(parseInt($(element).attr('data-page'), 10));
          });
        });

        $('#movies').append(pagination);
        pagination.rPage();
        $('#movies .spinner').addClass('d-none');

        if (results.results.totalDocs > 0) {
          results.results.docs.forEach((movie) => {
            $('#movies').append(createMovieCard(movie));
          });
        } else {
          $('#movies').append($('<h5>No Results Found</h5>'));
        }
      },
    });
  }

  loadMovies(1);
});
