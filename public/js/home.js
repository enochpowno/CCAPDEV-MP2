/* eslint-disable no-undef */
function createMovieCard(movie) {
  const card = $(`
    <a class="item card" href="/movie/view/${movie._id}">
      <img src="${img(movie.poster)}" class="card-img-top" alt="${movie.title}"/>
      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
        <hr/>
        <p class="card-text">${movie.synopsis.substr(0, 100) + ((movie.synopsis.length > 100) ? '...' : '')}</p>
      </div>
    </a>
  `);

  return card;
}

$(document).ready(() => {
  // load top movie
  $.ajax({
    url: '/movie/top',
    method: 'GET',
    success: (result) => {
      const movie = result.results[0];

      $('#topMovie .spinner').remove();

      $('#topMovie .synopsis').text(movie.synopsis);
      $('#topMovie .title').text(movie.title);
      $('#topMovie img').attr('src', img(movie.poster));
      $('#topMovie a').attr('href', `/movie/view/${movie._id}`);
      $('#topMovie .d-none').removeClass('d-none');
    },
  });

  $.ajax({
    url: '/movie/top',
    method: 'GET',
    data: { skip: 1, limit: 15 },
    success: (result) => {
      const movies = result.results;

      $('#top15 .spinner').remove();

      movies.forEach((movie) => {
        $('#top15 .owl-carousel').append(createMovieCard(movie));
      });

      $('.owl-carousel').owlCarousel({
        margin: 25,
        nav: false,
        responsive: {
          0: {
            items: 1,
          },
          412: {
            items: 2,
          },
          768: {
            items: 3,
          },
          1000: {
            items: 4,
          },
        },
      });
    },
  });
});
