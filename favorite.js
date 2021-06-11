const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")




function renderMovieList (data){
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML +=`
          <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top"
              src="${POSTER_URL + item.image}"
              alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-text">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-toggle="modal"
                data-target="#movie-modal" data-id="${item.id}">More</button>
              <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">x</button>
            </div>
          </div>
        </div>
      </div>
    `
  });
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id){
  //確定那些資料需要動態改變
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImg = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')
  axios
  .get(INDEX_URL + id)
  .then((response) => {
    //response.data.results
    const data = response.data.results
    movieTitle.innerHTML = data.title
    movieImg.innerHTML = `<img class="card-img-top"
              src="${POSTER_URL + data.image}"
              alt="Movie Poster"></img>`
    movieDate.innerHTML = `release date : ` + data.release_date
    movieDescription.innerHTML = data.description


  })
  .catch((err) => console.log(err))
}

function removeFromFavorite(id){
  console.log(id)
  const movieIndex = movies.findIndex(movie => movie.id === id) //位置
  movies.splice(movieIndex, 1)

  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)

}





//點擊more後，做資料替換
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if(event.target.matches('.btn-show-movie')){
    console.log(event.target)
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.matches('.btn-remove-favorite')){
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

renderMovieList(movies)