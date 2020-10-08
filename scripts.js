$(document).ready(() => {
  $.get("https://smileschool-api.hbtn.info/quotes", (data) => {
    $("#quoteLoader").hide()
    data.forEach((e, i) => $("#quoteCarousel").append(createQuote(e, i)))
  })

  if (window.location.pathname === "/courses.html") {
    $.get("https://smileschool-api.hbtn.info/courses", ({ topics, sorts }) => {
      const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1)
      topics.forEach((e) => {
        e = capitalize(e)
        $("#topicOptions").append(`<option value="${e}">${e}</option>`)
      })
      sorts.forEach((e) => {
        e = e
          .split("_")
          .map((e) => capitalize(e))
          .join(" ")
        $("#sortByOptions").append(`<option value="${e}">${e}</option>`)
      })
      populateCards()
    })
  }

  $.get("https://smileschool-api.hbtn.info/popular-tutorials", (data) => {
    $("#tutorialLoader").hide()
    data.forEach((e, i) =>
      $("#tutorialCarousel").append(createCarouselItem(e, i))
    )
    startCarousel("#tutorialCarousel")
  })

  $.get("https://smileschool-api.hbtn.info/latest-videos", (data) => {
    $("#latestLoader").hide()
    data.forEach((e, i) =>
      $("#latestCarousel").append(createCarouselItem(e, i))
    )
    startCarousel("#latestCarousel")
  })

  const populateCards = () => {
    $("#popularLoader").show()
    $("#popularCards").empty()
    const search = $("#courseSearch").val()
    const topic = $("#topicOptions option:selected ").val().toLowerCase()
    const sortBy = $("#sortByOptions option:selected ")
      .val()
      .split(" ")
      .map((e) => e.toLowerCase())
      .join("_")
    $.get(
      `https://smileschool-api.hbtn.info/courses?q=${search}&topic=${topic}&sortBy=${sortBy}`,
      ({ courses }) => {
        $("#num-videos").remove()
        $("#popular .active").prepend(
          `<div id="num-videos" class="py-3">${courses.length} videos</div>`
        )
        courses.forEach((e) => {
          $("#popularCards").append(createCard(e))
        })
      }
    )
    $("#popularLoader").hide()
  }

  $(".courseForm").change(() => populateCards())
  $("#courseSearch").on("input", () => populateCards())

  const createQuote = (e, i) => {
    return `
        <div class="carousel-item ${i === 0 ? "active" : ""}">
          <div class="row justify-content-center">
            <div class="col col-md-4 d-flex justify-content-center">
              <img
              class="profile-img"
              src=${e.pic_url}
              />
            </div>
            <div class="profile-caption col col-md-6 col-lg-8">
              <p class="lead">
                ${e.text}
              </p>
              <h5>${e.name}</h5>
              <p class="font-italic">
                ${e.title}
              </p>
            </div>
          </div>
        </div>
      `
  }

  const createCarouselItem = (e, i) => {
    return `
    <div class="carousel-item ${i === 0 ? "active" : ""}">
     ${createCard(e)}
    </div>
    `
  }

  const createCard = (e, i) => {
    let starsString = ""
    for (let j = 0; j < e.star; j++)
      starsString += `<img src="images/star_on.png" class="stars" />`
    return `
      <div class="col-md-3 col-lg-3 card px-2">
          <div class="card-body">
            <img
              src="${e.thumb_url}"
              class="img-fluid"
            />
            <div class="play-button row justify-content-center">
              <img class="purp" src="images/play.png" />
            </div>
            <h4>${e.title}</h4>
            <p class="text-muted">
              ${e["sub-title"]}
            </p>
            <div class="row align-items-center">
              <div class="col-4">
                <img
                  src="${e.author_pic_url}"
                  class="small-profile-img"
                />
              </div>
              <div class="col purp">
                ${e.author}
              </div>
            </div>
            <div class="row justify-content-between pt-3">
              <div class="col stars">
                ${starsString}
              </div>
              <div class="col-4">
                <p class="purp text-right">${e.duration}</p>
              </div>
            </div>
          </div>
      </div>`
  }

  const startCarousel = (carouselId) => {
    $(`${carouselId} .carousel-item`).each(function () {
      var minPerSlide = 3
      var next = $(this).next()
      if (!next.length) {
        next = $(this).siblings(":first")
      }
      next.children(":first-child").clone().appendTo($(this))
      for (var i = 0; i < minPerSlide; i++) {
        next = next.next()
        if (!next.length) {
          next = $(this).siblings(":first")
        }
        next.children(":first-child").clone().appendTo($(this))
      }
    })
  }
})
