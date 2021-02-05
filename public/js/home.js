/* eslint-disable no-undef */
function createMovieCard(movie) {
  const card = $(`
    <a class="item card" href="/movie/view/${movie._id}">
      <img src="${img(movie.poster)}" class="card-img-top" alt="${movie.title}"/>
      <div class="card-body">
        <h5 class="card-title">${movie.title}</h5>
        <hr/>
        <p class="card-text">${movie.synopsis.substr(0, 70) + ((movie.synopsis.length > 70) ? '...' : '')}</p>
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

  $('.slick-carousel').slick({
    speed: 300,
    slidesToShow: 4,
    slidesToScroll: 4,
    dots: false,
    infinite: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  });

  $.ajax({
    url: '/movie/top',
    method: 'GET',
    data: { skip: 1, limit: 15 },
    success: (result) => {
      const movies = result.results;

      $('#top15 .spinner').remove();

      movies.forEach((movie) => {
        $('#top15 .slick-carousel').slick("slickAdd", createMovieCard(movie));
      });
    },
  });
});
