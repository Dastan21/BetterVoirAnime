function calcElements(activate) {
  console.clear()
  const removeIframe = () => {
    var iframeADS = document.getElementsByTagName('iframe');
    for (var x = 0; x < iframeADS.length; x++) {
      if (iframeADS[x].src === '') {
        iframeADS[x].remove()
      }
    }
  }
  setInterval(removeIframe, 100)

  if (!activate) {
    document.body.classList.remove('page-template')
    return
  }
  document.head.innerHTML = `<link rel="icon" type="image/x-icon" href="${chrome.extension.getURL('favicon/icon16.png')}">` + document.head.innerHTML
  
  if (document.title == 'Just a moment...') {
    document.body.innerHTML = document.body.innerHTML + `<div id="loader"><div id="shadow"></div><div id="box"></div></div><h4 id="load-text">Checking your browser...</h4><style>#loader {
                  position: absolute;
                  top: calc(50% - 20px);
                  left: calc(50% - 20px);
                }
                @keyframes loader {
                  0% { left: -100px }
                  100% { left: 110%; }
                }
                #box {
                  width: 50px;
                  height: 50px;
                  background: #7289DA;
                  animation: animate .5s linear infinite;
                  position: absolute;
                  top: 0;
                  left: 0;
                  border-radius: 3px;
                }
                @keyframes animate {
                  17% { border-bottom-right-radius: 3px; }
                  25% { transform: translateY(9px) rotate(22.5deg); }
                  50% {
                    transform: translateY(18px) scale(1,.9) rotate(45deg) ;
                    border-bottom-right-radius: 40px;
                  }
                  75% { transform: translateY(9px) rotate(67.5deg); }
                  100% { transform: translateY(0) rotate(90deg); }
                } 
                #shadow { 
                  width: 50px;
                  height: 5px;
                  background: #000;
                  opacity: 0.1;
                  position: absolute;
                  top: 59px;
                  left: 0;
                  border-radius: 50%;
                  animation: shadow .5s linear infinite;
                }
                @keyframes shadow {
                  50% {
                    transform: scale(1.2,1);
                  }
                }
                
                h4 {
                  position: absolute;
                  bottom: 20px;
                  left: 20px;
                  margin: 0;
                  font-weight: 200;
                  opacity: .5;
                  font-family: sans-serif;
                  color: #fff;
                }
                
                body {
                  overflow: hidden;
                  background-color: #181A1B;
                }
  
                table, tbody, tr, td, h1, h2, h3, span, p, img, input {
                  display: none!important;
                }
              </style>
              `

    function loader() {
      let state = ''
      const changeText = () => {
        var element = document.getElementById('load-text')
        if (state === '.') {
          element.innerHTML = 'Checking your browser..'
          state = '..'
        } else if (state === '..') {
          element.innerHTML = 'Checking your browser...'
          state = '...'
        } else if (state === '...') {
          element.innerHTML = 'Checking your browser'
          state = ''
        } else if (state === '') {
          element.innerHTML = 'Checking your browser.'
          state = '.'
        }
      }

      setInterval(changeText, 500)
    }
    loader()
  } else if (document.title == "Voiranime - #1 DE L'ANIME EN FRANCE") {
    let data = []

    //Extract data
    var list = document.getElementsByClassName('page-item-detail');

    for (var i = 0; i < list.length; i++) {
      let temp = {
        id: null,
        title: null,
        image: null,
        url: null,
        rating: null,
        vf: false,
        episode: []
      }

      temp.id = list[i].children[0].getAttribute('data-post-id')
      temp.image = list[i].children[0].children[0].children[0].src;
      if (list[i].children[0].children[0].children[1] != undefined) {
        temp.vf = true
      }
      temp.title = list[i].children[1].children[0].children[0].children[0].text
      temp.url = list[i].children[1].children[0].children[0].children[0].href
      temp.rating = parseFloat(list[i].getElementsByClassName('score')[0].textContent)
      var c_list = list[i].getElementsByClassName('list-chapter')[0].children
      for (var x = 0; x < c_list.length; x++) {
        temp.episode.push({
          ep: parseInt(c_list[x].children[0].children[0].text),
          time: String(c_list[x].children[1].textContent).replace('\n', ''),
          url: c_list[x].children[0].children[0].href
        })
      };

      data.push(temp)
    };

    function CreateRating(score) {
      var r = Math.floor((score - Math.floor(score)) * 10) / 10
      let text = ''
      let count = 0
      if (r == 0.7 || r == 0.6 || r == 0.5 || r == 0.4 || r == 0.3) {
        for (var i = 0; i < Math.floor(score); i++) {
          text += `<img src="${chrome.extension.getURL('icons/star_full.svg')}">`
          count++
        }
        text += `<img src="${chrome.extension.getURL('icons/star_half.svg')}">`
        count++
        while (count != 5) {
          text += `<img src="${chrome.extension.getURL('icons/star_empty.svg')}">`
          count++
        }
      } else {
        for (var i = 0; i < Math.round(score); i++) {
          text += `<img src="${chrome.extension.getURL('icons/star_full.svg')}">`
          count++
        }
        while (count != 5) {
          text += `<img src="${chrome.extension.getURL('icons/star_empty.svg')}">`
          count++
        }
      }
      return (text)
    }

    const CreateEp = (ep) => {
      let text = ''
      ep.forEach(episode => {
        text += `<a class="bva_item_ep" href="${episode.url}"><div>${episode.ep}</div><span>${episode.time}</span></a>`
      })
      return (text)
    }

    const CreateContent = () => {
      let row = 0
      let tempText = ''
      let totalText = ''
      data.forEach(item => {
        let vf = ''
        if (item.vf === true) {
          vf = `<div class="bva_item_vf"><img src="${chrome.extension.getURL('icons/vf-mark.svg')}"></div>`
        }
        tempText += `
          <div class="bva_item" data-post-id="${item.id}">
            <a href="${item.url}"><img src="${item.image}" class="bva_item_thumb"></a>
            <a class="bva_item_title" href="${item.url}">${item.title}</a>
            <div class="bva_item_rating">
              ${CreateRating(item.rating)}
            </div>
            <div class="bva_item_ep_container">
              ${CreateEp(item.episode)}
            </div>
            ${vf}
          </div>
        `
        row++
        if (row == 4) {
          row = 0
          totalText += '<div class="bva_content_raw">' + tempText + '</div>'
          tempText = ''
        }
      })

      return (totalText)
    }

    document.getElementsByClassName('c-blog__content')[0].innerHTML = `
      <div class="bva_content_container">
        ${CreateContent()}
      </div>
    ` + document.getElementsByClassName('c-blog__content')[0].innerHTML

    document.body.innerHTML = `
      <div class="bva_header_container">
        <a id="bva_header_va" href="https://voiranime.com"><img src="${chrome.extension.getURL('icons/va_logo.svg')}"></a>
        <div class="bva_header_subcontainer">
          <a id="bva_header_home" class="header_btn" href="https://voiranime.com"><img src="${chrome.extension.getURL('icons/home.svg')}"><div>ACCEUIL</div></a>
          <a id="bva_header_list" class="header_btn" href="https://voiranime.com/liste-danimes/"><img src="${chrome.extension.getURL('icons/list.svg')}"><div>LISTE</div></a>
          <a id="bva_header_new" class="header_btn" href="https://voiranime.com/nouveaux-ajouts/"><img src="${chrome.extension.getURL('icons/new.svg')}"><div>NOUVEAU</div></a>
          <a id="bva_header_soon" class="header_btn" href="https://voiranime.com/prochainement/"><img src="${chrome.extension.getURL('icons/soon.svg')}"><div>PROCHAINEMENT</div></a>
          <a id="bva_header_as" class="header_btn" href="https://voiranime.com/?s=&amp;post_type=wp-manga"><img src="${chrome.extension.getURL('icons/a_search.svg')}"><div>RECHERCHE AV</div></a>
        </div>
      </div>
      <div class="bva_genre_container">
        <div class="bva_separator_up"></div>
        <ul class="bva_genre_subcontainer">
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/action">action</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/adventure">adventure</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/chinese">chinese</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/comedy">comedy</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/drama">drama</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/ecchi">ecchi</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/fantasy">fantasy</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/horror">horror</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/mahou-shoujo">mahou shoujo</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/mecha">mecha</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/music">music</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/mystery">mystery</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/psychological">psychological</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/romance">romance</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/sci-fi">sci-fi</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/slice-of-life">slice of life</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/sports">sports</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/supernatural">supernatural</a></li>
          <li><a class="bva_genre" href="https://voiranime.com/anime-genre/thriller">thriller</a></li>
        </ul>
        <div class="bva_separator_down"></div>
      </div>
      ` + document.body.innerHTML

    function htmlToElement(html) {
      var template = document.createElement('template');
      html = html.trim(); // Never return a text node of whitespace as the result
      template.innerHTML = html;
      return template.content.firstChild;
    }

    document.getElementsByClassName('sidebar-col')[0].replaceChildren
    document.getElementsByClassName('sidebar-col')[0].appendChild(htmlToElement(`
    <div class="bva_search_input">
      <div id="bva_search_vostfr">
        <input type="text" placeholder="Rechercher en VOSTFR...">
        <img id="validate" src="${chrome.extension.getURL('icons/search.svg')}">
      </div>
      <div id="bva_search_vf">
        <input type="text" placeholder="Rechercher en VF...">
        <img id="validate" src="${chrome.extension.getURL('icons/search.svg')}">
      </div>
    </div>
  `))
  document.getElementsByClassName('sidebar-col')[0].innerHTML = document.getElementsByClassName('sidebar-col')[0].innerHTML + `<div class="bva_search_result"></div>`


    document.body.innerHTML = document.body.innerHTML + `
      <div class="action_container">
        <div id="action_params" class="action_btn"><img src="${chrome.extension.getURL('icons/settings.svg')}"><span class="tooltiptext">Paramètres</span></div>
        <div id="action_darkmode" class="action_btn"><img src="${chrome.extension.getURL('icons/dark_mode.svg')}"><span class="tooltiptext">Mode Clair/Sombre</span></div>
        <div id="action_random" class="action_btn"><img src="${chrome.extension.getURL('icons/random.svg')}"><span class="tooltiptext">Animé Aléatoire</span></div>
        <div id="action_continue" class="action_btn"><img src="${chrome.extension.getURL('icons/resume.svg')}"><span class="tooltiptext">Continuer</span></div>
        <div id="action_stats" class="action_btn"><img src="${chrome.extension.getURL('icons/stats.svg')}"><span class="tooltiptext">Statistiques</span></div>
      </div>`

   
    var delayTimer;
    var bva_search_vostfr = document.getElementById('bva_search_vostfr').children[0]
    var bva_search_vf = document.getElementById('bva_search_vf').children[0]
    bva_search_vostfr.addEventListener('keyup', (event) => {
      bva_search_vf.value = ''
        clearTimeout(delayTimer)
        document.getElementsByClassName('bva_search_result')[0].innerHTML = ""
        delayTimer = setTimeout(function() {
          ajax({
            url: 'https://voiranime.com/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
              action: 'ajaxsearchpro_search',
              aspp: bva_search_vostfr.value,
              asid: 4,
              asp_inst_id: '4_2',
              options: 'current_page_id=15&qtranslate_lang=0&filters_changed=0&filters_initial=1&asp_gen%5B%5D=title&asp_gen%5B%5D=content&asp_gen%5B%5D=excerpt&customset%5B%5D=wp-manga&aspf%5Bvf__1%5D=vf'
            },
            success: function (data) {
              var apstart_data = JSON.parse(String(data).slice(String(data).search('!!ASPSTART_DATA!!'), String(data).length).replace('!!ASPSTART_DATA!!', '').replace('!!ASPEND_DATA!!', ''))

              if (apstart_data.results_count != 0) {
                apstart_data.results.forEach(result => {
                  document.getElementsByClassName('bva_search_result')[0].innerHTML = document.getElementsByClassName('bva_search_result')[0].innerHTML + `
                    <div class="bva_search_item">
                      <img class="bva_search_item_thumb" src="${result.image}">
                      <a class="bva_search_item_title" href="${result.link}">${result.title}</a>
                      <p class="bva_search_item_content">${result.content}</p>
                    </div>
                  ` 
                })
              } else {
                document.getElementsByClassName('bva_search_result')[0].innerHTML = '<div class="bva_search_noresult">Aucun résultat</div>'
              }
            }
          });
        },1000)
    })
    bva_search_vf.addEventListener('keyup', (event) => {
      bva_search_vostfr.value = ''
        clearTimeout(delayTimer)
        document.getElementsByClassName('bva_search_result')[0].innerHTML = ""
        delayTimer = setTimeout(function() {
          ajax({
            url: 'https://voiranime.com/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
              action: 'ajaxsearchpro_search',
              aspp: bva_search_vf.value,
              asid: 3,
              asp_inst_id: '3_2',
              options: 'current_page_id=15&qtranslate_lang=0&filters_changed=0&filters_initial=1&asp_gen%5B%5D=title&asp_gen%5B%5D=content&asp_gen%5B%5D=excerpt&customset%5B%5D=wp-manga&aspf%5Bvf__1%5D=vf'
            },
            success: function (data) {
              var apstart_data = JSON.parse(String(data).slice(String(data).search('!!ASPSTART_DATA!!'), String(data).length).replace('!!ASPSTART_DATA!!', '').replace('!!ASPEND_DATA!!', ''))

              if (apstart_data.results_count != 0) {
                apstart_data.results.forEach(result => {
                  document.getElementsByClassName('bva_search_result')[0].innerHTML = document.getElementsByClassName('bva_search_result')[0].innerHTML + `
                    <div class="bva_search_item">
                      <img class="bva_search_item_thumb" src="${result.image}">
                      <a class="bva_search_item_title" href="${result.link}">${result.title}</a>
                      <p class="bva_search_item_content">${result.content}</p>
                    </div>
                  ` 
                })
              } else {
                document.getElementsByClassName('bva_search_result')[0].innerHTML = '<div class="bva_search_noresult">Aucun résultat</div>'
              }
            }
          });
        },1000)
    })


  } else if (String(document.title).search('Regarder gratuitement') === 0) {
    let data = {
      title: {
        native: null,
        romaji: null,
        english: null
      },
      post_id: null,
      note: null,
      type: null,
      status: null,
      episodes: {
        count: null,
        episode: []
      },
      genres: [],
      image: null
    }
    var list_info = document.getElementsByClassName('post-content_item')
    for (x = 0; x < list_info.length; x++) {
      switch (String(list_info[x].children[0].textContent).replace(/\n/g, '').replace(/\s/g, '')) {
        case 'Native':
          data.title.native = String(list_info[x].children[1].textContent).replace(/\n/g, '')
        case 'Romaji':
          data.title.romaji = String(list_info[x].children[1].textContent).replace(/\n/g, '')
        case 'English':
          data.title.english = String(list_info[x].children[1].textContent).replace(/\n/g, '')
        case 'Note':
          let t = String(list_info[x].children[1].textContent).replace(/\n/g, '')
          t = t.slice(0, t.search('/'))
          let num1 = t.match(/\d+/)
          if (num1 != null) {
            num1 = num1[0]
          }
          t = t.replace(num1, '')
          let num2 = t.match(/\d+/)

          let note;
          if (num2 != null) {
            note = parseFloat(`${num1}.${num2[0]}`)
          } else {
            note = parseFloat(num1)
          }
          data.note = note
        case 'Type':
          data.type = String(list_info[x].children[1].textContent).replace(/\n/g, '').replace(/\t/g, '')
        case 'Status':
          data.status = String(list_info[x].children[1].textContent).replace(/\n/g, '').replace(/\t/g, '')
        case 'Episodes':
          data.episodes.count = String(list_info[x].children[1].textContent).replace(/\n/g, '')
        case 'Genre(s)':
          data.genres = String(list_info[x].children[1].textContent).replace(/\n/g, '').replace(/\s/g, '').split(',')
      }
    }
    var chapter_list = document.getElementsByClassName('wp-manga-chapter')
    for (x = 0; x < chapter_list.length; x++) {
      data.episodes.episode.push({
        title: chapter_list[chapter_list.length - 1 - x].children[0].textContent.replace(/\n/g, ''),
        url: chapter_list[chapter_list.length - 1 - x].children[0].href,
        date: chapter_list[chapter_list.length - 1 - x].children[1].textContent.replace(/\n/g, '')
      })
    }
    data.post_id = document.getElementsByName('comment_post_ID')[0].value

    document.body.innerHTML = `
      <div class="bva_header_container">
        <a id="bva_header_va" href="https://voiranime.com"><img src="${chrome.extension.getURL('icons/va_logo.svg')}"></a>
        <div class="bva_header_subcontainer">
          <a id="bva_header_home" class="header_btn" href="https://voiranime.com"><img src="${chrome.extension.getURL('icons/home.svg')}"><div>ACCEUIL</div></a>
          <a id="bva_header_list" class="header_btn" href="https://voiranime.com/liste-danimes/"><img src="${chrome.extension.getURL('icons/list.svg')}"><div>LISTE</div></a>
          <a id="bva_header_new" class="header_btn" href="https://voiranime.com/nouveaux-ajouts/"><img src="${chrome.extension.getURL('icons/new.svg')}"><div>NOUVEAU</div></a>
          <a id="bva_header_soon" class="header_btn" href="https://voiranime.com/prochainement/"><img src="${chrome.extension.getURL('icons/soon.svg')}"><div>PROCHAINEMENT</div></a>
          <a id="bva_header_as" class="header_btn" href="https://voiranime.com/?s=&amp;post_type=wp-manga"><img src="${chrome.extension.getURL('icons/a_search.svg')}"><div>RECHERCHE AV</div></a>
        </div>
      </div>
      <div class="bva_genre_container">
        <div class="bva_separator_up"></div>
      </div>
      ` + document.body.innerHTML


    function htmlToElement(html) {
      var template = document.createElement('template');
      html = html.trim(); // Never return a text node of whitespace as the result
      template.innerHTML = html;
      return template.content.firstChild;
    }

    document.getElementsByClassName('sidebar-col')[0].replaceChildren
    document.getElementsByClassName('sidebar-col')[0].appendChild(htmlToElement(`
    <div class="bva_search_input">
      <div id="bva_search_vostfr">
        <input type="text" placeholder="Rechercher en VOSTFR...">
        <img id="validate" src="${chrome.extension.getURL('icons/search.svg')}">
      </div>
      <div id="bva_search_vf">
        <input type="text" placeholder="Rechercher en VF...">
        <img id="validate" src="${chrome.extension.getURL('icons/search.svg')}">
      </div>
    </div>
  `))
  document.getElementsByClassName('sidebar-col')[0].innerHTML = document.getElementsByClassName('sidebar-col')[0].innerHTML + `<div class="bva_search_result"></div>`


    document.body.innerHTML = document.body.innerHTML + `
      <div class="action_container">
        <div id="action_params" class="action_btn"><img src="${chrome.extension.getURL('icons/settings.svg')}"><span class="tooltiptext">Paramètres</span></div>
        <div id="action_darkmode" class="action_btn"><img src="${chrome.extension.getURL('icons/dark_mode.svg')}"><span class="tooltiptext">Mode Clair/Sombre</span></div>
        <div id="action_random" class="action_btn"><img src="${chrome.extension.getURL('icons/random.svg')}"><span class="tooltiptext">Animé Aléatoire</span></div>
        <div id="action_continue" class="action_btn"><img src="${chrome.extension.getURL('icons/resume.svg')}"><span class="tooltiptext">Continuer</span></div>
        <div id="action_stats" class="action_btn"><img src="${chrome.extension.getURL('icons/stats.svg')}"><span class="tooltiptext">Statistiques</span></div>
      </div>`

   
    var delayTimer;
    var bva_search_vostfr = document.getElementById('bva_search_vostfr').children[0]
    var bva_search_vf = document.getElementById('bva_search_vf').children[0]
    bva_search_vostfr.addEventListener('keyup', (event) => {
      bva_search_vf.value = ''
        clearTimeout(delayTimer)
        document.getElementsByClassName('bva_search_result')[0].innerHTML = ""
        delayTimer = setTimeout(function() {
          ajax({
            url: 'https://voiranime.com/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
              action: 'ajaxsearchpro_search',
              aspp: bva_search_vostfr.value,
              asid: 4,
              asp_inst_id: '4_2',
              options: 'current_page_id=15&qtranslate_lang=0&filters_changed=0&filters_initial=1&asp_gen%5B%5D=title&asp_gen%5B%5D=content&asp_gen%5B%5D=excerpt&customset%5B%5D=wp-manga&aspf%5Bvf__1%5D=vf'
            },
            success: function (data) {
              var apstart_data = JSON.parse(String(data).slice(String(data).search('!!ASPSTART_DATA!!'), String(data).length).replace('!!ASPSTART_DATA!!', '').replace('!!ASPEND_DATA!!', ''))

              if (apstart_data.results_count != 0) {
                apstart_data.results.forEach(result => {
                  document.getElementsByClassName('bva_search_result')[0].innerHTML = document.getElementsByClassName('bva_search_result')[0].innerHTML + `
                    <div class="bva_search_item">
                      <img class="bva_search_item_thumb" src="${result.image}">
                      <a class="bva_search_item_title" href="${result.link}">${result.title}</a>
                      <p class="bva_search_item_content">${result.content}</p>
                    </div>
                  ` 
                })
              } else {
                document.getElementsByClassName('bva_search_result')[0].innerHTML = '<div class="bva_search_noresult">Aucun résultat</div>'
              }
            }
          });
        },1000)
    })
    bva_search_vf.addEventListener('keyup', (event) => {
      bva_search_vostfr.value = ''
        clearTimeout(delayTimer)
        document.getElementsByClassName('bva_search_result')[0].innerHTML = ""
        delayTimer = setTimeout(function() {
          ajax({
            url: 'https://voiranime.com/wp-admin/admin-ajax.php',
            type: 'POST',
            data: {
              action: 'ajaxsearchpro_search',
              aspp: bva_search_vf.value,
              asid: 3,
              asp_inst_id: '3_2',
              options: 'current_page_id=15&qtranslate_lang=0&filters_changed=0&filters_initial=1&asp_gen%5B%5D=title&asp_gen%5B%5D=content&asp_gen%5B%5D=excerpt&customset%5B%5D=wp-manga&aspf%5Bvf__1%5D=vf'
            },
            success: function (data) {
              var apstart_data = JSON.parse(String(data).slice(String(data).search('!!ASPSTART_DATA!!'), String(data).length).replace('!!ASPSTART_DATA!!', '').replace('!!ASPEND_DATA!!', ''))

              if (apstart_data.results_count != 0) {
                apstart_data.results.forEach(result => {
                  document.getElementsByClassName('bva_search_result')[0].innerHTML = document.getElementsByClassName('bva_search_result')[0].innerHTML + `
                    <div class="bva_search_item">
                      <img class="bva_search_item_thumb" src="${result.image}">
                      <a class="bva_search_item_title" href="${result.link}">${result.title}</a>
                      <p class="bva_search_item_content">${result.content}</p>
                    </div>
                  ` 
                })
              } else {
                document.getElementsByClassName('bva_search_result')[0].innerHTML = '<div class="bva_search_noresult">Aucun résultat</div>'
              }
            }
          });
        },1000)
    })
  }

  console.clear()
  console.log("%c        BETTER VOIRANIME", 'font-size: 100px; width: 100px; height: 100px; background-image: url(chrome-extension://binmckgcoeddijbmomdpiceglfgeadci/icons/va_logo.svg); background-size: contain; background-repeat: no-repeat;')
  console.log('                                                    %c Designed and Created by Mallow ', 'background-color: #8096E2; border-radius: 15px; padding: 20px; font-size: 50px;')
  console.log('%c ⚠ OPENING THE DEVELOPPERS CONSOLE MAY CAUSE DAMAGE TO THE FUNCTIONNEMENT OF THE WEBSITE', 'background-color: #EE4343; padding: 15px; border-radius: 10px; font-size: 20px')
  console.log("%c   GREAT WATCHING", 'font-size: 150px; width: 500px; height: 500px; background-image: url(chrome-extension://binmckgcoeddijbmomdpiceglfgeadci/gif/01.gif); background-size: contain; background-repeat: no-repeat; color: #8096e2; text-shadow: 3px 3px 0 #94a4e6 , 6px 6px 0 #a7b3eb , 9px 9px 0 #a7b3eb , 12px 12px 0 #b9c2ef , 15px 15px 0 #cbd1f3 , 18px 18px 0 #dde0f7 , 21px 21px 0 #eeeffb;')  
}

function ajax(data) {
  var formdata = new FormData();
  Object.keys(data.data).forEach(key => {
    formdata.append(key, data.data[key]);
  });

  var request = new XMLHttpRequest;

  request.onreadystatechange = () => {
    if (request.readyState === 4) {
      data.success(request.response);
    };
  };

  request.open(data.type, data.url);
  request.send(formdata)
}

// VF => asid=3 & asp_inst_id = '3_2'
// VOSTFR => asid=4 & asp_inst_id = '4_2'


// GET VIDEO

function get_video(manga, chapter, host) {
  var cap = grecaptcha.getResponse()
  $.ajax({
    url: 'https://voiranime.com/wp-admin/admin-ajax.php',
    type: 'POST',
    data: {
      action: 'get_video_chapter_content',
      grecaptcha: cap,
      manga: manga,
      chapter: chapter,
      host: host,
    },
    success: function (data) {
      alert(data)
    }
  });
}

// #chapter-video-captcha-validator --> form
//#g-recaptcha-response --> response


// .host-select > <option> .attr('value')
//ex: LECTEUR VOE - LECTEUR SB - LECTEUR STRAPE - LECTEUR FHD1

// Où trouver le chapter et manga:
//.wp-manga-action-button .attr('data-post')
//.wp-manga-action-button .attr('data-chapter')

// NEXT / PREVIOUS
// .nav-links > .nav-previous a
// .nav-links > .nav-next a


//https://clients1.google.com/complete/search?callback=jQuery351025294768015027635_1659358754766&q=${QUERY}&hl=en&nolabels=t&client=hp&ds=&_=1659358754773

/*
action: get_video_chapter_content
grecaptcha: 03ANYolquaOIW3OSK7vkvIEqdykaM0BIma8kmsLE_Uv43PdFEZxzHqhMQHk6pZv6mx5wnZQsFxMtXQyRrIqyMgVwcxjbkPUreAYALUHyXa_wXNLh4lu18Y0GCX-NaoVWpze_O0nJVN1GRU2-dN14OJS5vyAaLZRNsWQN2FWDOsnqHaNfHEDVIqi0UTZYN-LJv9Ke5jAGSihEapmd0TR0BTPqAUrwKHS0mRoKPX3M7i-pSyZ6uguJSodowyi4rdWiGlRw5y2pkJevnkkhulusRY6b1HTBiriqaurGE4pIixCsbRNyEJp4H6uqw8PJznJwIr0swLYMmmh5IN_Gjj6d9fwHdUBUSZhG1Mm36S0MSz2qzwgO-pUx0ty-LNM72jk34oNUlArbgxP1iw0NztRLvB5DWcFYYqaYOZf61ftQXZp5hU1YnjDL553EO6kdQSKhRQzlf23BWYfIpIEaXjxOOTTQQtBQbWStmYmQylceGSRGr-36i5oqUUn00xv7A2os0f2P4u2vETFRo4CgRsUkYVmXt-g6uBFdWIbmjlEsb0cBYJK6m7UQRLB3W1seOPgS_-Z8GTP3Pab60eWnGAftrPknEoFHHWa1L-iw
manga: 89241
chapter: 77311
host: LECTEUR VOE
*/