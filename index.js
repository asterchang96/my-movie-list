const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12

const movies = [] 
let filteredMovies = [] //空則表示沒有搜尋(80 movies)
let BtnListORCard = "card" //card or list

const dataPanel = document.querySelector("#data-panel")
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const paginator = document.querySelector("#paginator")
const btnPart = document.querySelector("#btn-part")



function renderMovieList (data){
  let rawHTML = ''
  //case1 card
  if(BtnListORCard === "card"){
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
  }
  //case2 list
else if(BtnListORCard === "list"){
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

//幾部電影
function renderPaginator(amount){
  const numberOfpages = Math.ceil(amount / MOVIES_PER_PAGE) //無條件進位
  let rawHTML=''
  for (let  page = 1; page <= numberOfpages; page++){
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

function addToFavorite(id){
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find(movie => movie.id === id)

  if(list.some(movie => movie.id === id)){
    return alert('電影已經在收藏清單中!!')
  }

  list.push(movie)
  console.log(list)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}


//點擊more後，做資料替換
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if(event.target.matches('.btn-show-movie')){
    console.log(event.target)
    showMovieModal(Number(event.target.dataset.id))
  }else if(event.target.matches('.btn-add-favorite')){
    addToFavorite(Number(event.target.dataset.id))
  }
})

//page對應相對的電影
paginator.addEventListener('click', function onPaginatorClicked(event){
  if(event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(page))
})

//click to submit the search
searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  //取消預設事件
  event.preventDefault()
  console.log(searchInput.value)
  //取得搜尋關鍵字
  const keyword = searchInput.value.trim().toLowerCase()
  console.log(keyword)
  //儲存符合篩選條件的項目
   if (!keyword.length){
   return alert('請輸入有效字串')
 }
   
  //條件篩選
  filteredMovies = movies.filter((movie) => 
    movie.title.toLowerCase().includes(keyword)
  )
  console.log(filteredMovies)  

  //錯誤處理：輸入無效字串
   if(filteredMovies.length === 0){
     return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
   }
  //重新輸出至畫面
  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(1))
  
})

//click to choose card or list
btnPart.addEventListener('click', function onBtnPartClicked(event){
  if(event.target.matches(".fa-th")) {
    BtnListORCard = "card"  
  }else if(event.target.matches(".fa-bars")) {
    BtnListORCard = "list"
  }
  renderMovieList(getMoviesByPage(1))
  renderPaginator(movies.length)
})

//第一次載入
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderMovieList(getMoviesByPage(1))
    renderPaginator(movies.length)
  })
  .catch((err) => console.log(err))
