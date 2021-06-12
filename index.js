const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = [] //API movies
let filteredMovies = [] //空則表示沒有搜尋(80 movies)
let ButtonListORCardID = "card" //click to chose card or list
let currentPAGE = 1 //目前頁數

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const ButtonPartClickListORCard = document.querySelector("#btn-part")



function renderMovieList (data){
  let rawHTML = ''
  if(ButtonListORCardID === "card"){ //case1 card
    data.forEach((item) => {
      rawHTML +=`
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img class="card-img-top" src="${POSTER_URL + item.image}" alt="Movie Poster">
              <div class="card-body">
                <h5 class="card-text">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
              </div>
            </div>
          </div>
        </div>
    `      
    })
  }else if(ButtonListORCardID === "list"){ //case2 list
  rawHTML = `<ul class="list-group list-group-flush" id="list-group-show">`

  data.forEach((item) => {
    rawHTML +=`  
      <li class="list-group-item d-flex justify-content-between align-items-center">
        ${item.title}
        <div class="list-right">
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#movie-modal"
            data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </li>
      `
  })

  rawHTML += `</ul>`
}
  dataPanel.innerHTML = rawHTML
}

//幾頁
function renderPaginator(){
  const numberOfPages = filteredMoviesORMovies()
  let rawHTML = ''
  for (let  page = 1; page <= numberOfPages; page++){
    rawHTML +=`<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML;
}

//page ->顯示對應頁
function getMoviesByPage(page){
  const data = filteredMovies.length ? filteredMovies : movies 
  const startIndex = (page -1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

//判斷該用 filteredMovies / movies 的頁數--> 如果filteredMovies有值則目前在搜尋
function filteredMoviesORMovies(){   
  if(filteredMovies.length !== 0){
    return Math.ceil(filteredMovies.length / MOVIES_PER_PAGE) 
  }else{
    return Math.ceil(movies.length / MOVIES_PER_PAGE) 
  }
}

function showMovieModal(id){
  const movieTitle = document.querySelector('#movie-modal-title')
  const movieImg = document.querySelector('#movie-modal-image')
  const movieDate = document.querySelector('#movie-modal-date')
  const movieDescription = document.querySelector('#movie-modal-description')
  axios
  .get(INDEX_URL + id)
  .then((response) => {
    const data = response.data.results
    movieTitle.innerHTML = data.title
    movieImg.innerHTML = `<img class="card-img-top" src="${POSTER_URL + data.image}" alt="Movie Poster"></img>`
    movieDate.innerHTML = `release date : ` + data.release_date
    movieDescription.innerHTML = data.description
  })
  .catch((err) => console.log(err))
}

function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if(list.some(movie => movie.id === id)){
    return alert('電影已經在收藏清單中!!')
  }

  list.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

//點擊more/+後，觸發動作
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if(event.target.matches('.btn-show-movie')){
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
  }
})

//page 對應相對的電影
paginator.addEventListener('click', function onPaginatorClicked(event){
  if(event.target.tagName !== 'A') return
  currentPAGE = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(currentPAGE))
})

//click to submit the search
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  if (!keyword.length){
    return alert('請輸入有效字串')
  }
   
  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )

  if(filteredMovies.length === 0){
    searchInput.value = ""
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  //重新輸出至畫面
  renderPaginator()
  currentPAGE = 1 //搜尋後 - 首頁
  renderMovieList(getMoviesByPage(currentPAGE))
})

//click to choose card or list
ButtonPartClickListORCard.addEventListener('click', function onBtnPartClicked(event){
  if(event.target.matches(".fa-th")) {
    ButtonListORCardID = "card"  
  }else if(event.target.matches(".fa-bars")) {
    ButtonListORCardID = "list"
  }
  renderMovieList(getMoviesByPage(currentPAGE))
  renderPaginator()
})

//第一次載入
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator()
  })
  .catch((err) => console.log(err))