$(document).ready(() => {
  let currentPage = 1;
  let maxPages = Number.MAX_SAFE_INTEGER;

  function createMovieCard(movie) {
    const card = $(`
    <div class='col-md-3 my-3'>
      <a class="item card" href="/movie/view/${movie._id}">
        <img src="${img(movie.poster)}" class="card-img-top" alt="${movie.title}"/>
        <div class="card-body">
          <h5 class="card-title">${movie.title}</h5>
          <hr/>
          <p class="card-text">${movie.synopsis.substr(0, 100) + ((movie.synopsis.length > 100) ? '...' : '')}</p>
        </div>
      </a>
    </div>
  `);

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
        console.log(results);
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
