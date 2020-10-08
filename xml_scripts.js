$(document).ready(() => {
  const xmlMagic = (url, callback) => {
    let xhr = new XMLHttpRequest()
    xhr.open("GET", url)
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return
      xhr.status === 200
        ? callback(
            parse(new DOMParser().parseFromString(xhr.responseText, "text/xml"))
          )
        : console.log("HTTP error", xhr.status, xhr.statusText)
    }
    xhr.send()
  }

  xmlMagic("https://smileschool-api.hbtn.info/xml/quotes", (data) => {
    $("#quoteLoader").hide()
    data.forEach((e, i) => $("#quoteCarousel").append(createQuote(e, i)))
  })

  xmlMagic(
    "https://smileschool-api.hbtn.info/xml/popular-tutorials",
    (data) => {
      $("#tutorialLoader").hide()
      data.forEach((e, i) =>
        $("#tutorialCarousel").append(createCarouselItem(e, i))
      )
      startCarousel("#tutorialCarousel")
    }
  )

  xmlMagic("https://smileschool-api.hbtn.info/xml/latest-videos", (data) => {
    $("#latestLoader").hide()
    data.forEach((e, i) =>
      $("#latestCarousel").append(createCarouselItem(e, i))
    )
    startCarousel("#latestCarousel")
  })

  xmlMagic("https://smileschool-api.hbtn.info/xml/courses", (data) => {
    const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1)
    data.topics.forEach((e) => {
      e = capitalize(e)
      $("#topicOptions").append(`<option value="${e}">${e}</option>`)
    })
    data.sorts.forEach((e) => {
      e = e
        .split("_")
        .map((e) => capitalize(e))
        .join(" ")
      $("#sortByOptions").append(`<option value="${e}">${e}</option>`)
    })
    populateCards()
  })

  const populateCards = () => {
    $("#popularLoader").show()
    $("#popularCards").empty()
    const search = $("#courseSearch").val()
    const topic = $("#topicOptions option:selected ").val()
    const sortBy = $("#sortByOptions option:selected ").val()
    xmlMagic("https://smileschool-api.hbtn.info/xml/courses", (data) => {
      const sortFunc = {
        "Most Recent": (a, b) => b.published_at - a.published_at,
        "Most Viewed": (a, b) => b.views - a.views,
        "Most Popular": (a, b) => b.star - a.star,
      }
      data.courses
        .filter((e) =>
          topic === "All" && search.length === 0
            ? e
            : e.topic === topic
            ? e
            : e.keywords.includes(search)
            ? e
            : null
        )
        .sort(sortFunc[sortBy])
        .forEach((e) => {
          $("#popularCards").append(createCard(e))
        })
    })
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
      <div class="col-md-6 col-lg-3 card">
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

  // https://andrew.stwrt.ca/posts/js-xml-parsing
  // flattens an object (recursively!), similarly to Array#flatten
  // e.g. flatten({ a: { b: { c: "hello!" } } }); // => "hello!"
  function flatten(object) {
    var check = _.isPlainObject(object) && _.size(object) === 1
    return check ? flatten(_.values(object)[0]) : object
  }

  function parse(xml) {
    var data = {}

    var isText = xml.nodeType === 3,
      isElement = xml.nodeType === 1,
      body = xml.textContent && xml.textContent.trim(),
      hasChildren = xml.children && xml.children.length,
      hasAttributes = xml.attributes && xml.attributes.length

    // if it's text just return it
    if (isText) {
      return xml.nodeValue.trim()
    }

    // if it doesn't have any children or attributes, just return the contents
    if (!hasChildren && !hasAttributes) {
      return body
    }

    // if it doesn't have children but _does_ have body content, we'll use that
    if (!hasChildren && body.length) {
      data.text = body
    }

    // if it's an element with attributes, add them to data.attributes
    if (isElement && hasAttributes) {
      data.attributes = _.reduce(
        xml.attributes,
        function (obj, name, id) {
          var attr = xml.attributes.item(id)
          obj[attr.name] = attr.value
          return obj
        },
        {}
      )
    }

    // recursively call #parse over children, adding results to data
    _.each(xml.children, function (child) {
      var name = child.nodeName

      // if we've not come across a child with this nodeType, add it as an object
      // and return here
      if (!_.has(data, name)) {
        data[name] = parse(child)
        return
      }

      // if we've encountered a second instance of the same nodeType, make our
      // representation of it an array
      if (!_.isArray(data[name])) {
        data[name] = [data[name]]
      }

      // and finally, append the new child
      data[name].push(parse(child))
    })

    // if we can, let's fold some attributes into the body
    _.each(data.attributes, function (value, key) {
      if (data[key] != null) {
        return
      }
      data[key] = value
      delete data.attributes[key]
    })

    // if data.attributes is now empty, get rid of it
    if (_.isEmpty(data.attributes)) {
      delete data.attributes
    }

    // simplify to reduce number of final leaf nodes and return
    return flatten(data)
  }
})
