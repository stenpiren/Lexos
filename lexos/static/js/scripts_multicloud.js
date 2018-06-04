$(function(){
  // Add tooltip to the DOM

  tooltip = d3.select('body').append('div')
    .attr('class', 'd3tooltip tooltip right')
    .style('opacity', 0)
  d3.select('.d3tooltip').attr('role', 'tooltip')

  // Show filename of uploaded file
  $('.multicloud-upload').change(function (ev) {
    const filename = ev.target.files[0].name
    $('#bttnlabel').html(filename)
  })

  // trigger function when 'toggle all' radio button is checked
  $('#allCheckBoxSelector').click(function () {
    if (this.checked) $('.minifilepreview:not(:checked)').trigger('click')
    else $('.minifilepreview:checked').trigger('click')
  })

  vizCreation()// function:Update the Radio button according to the clicks from the user

  // Display the document selection options on page load
  $('#multicloud-selection').show()
  $('#multicloud-upload').hide()
})


// Make pre-Ajax implementation work
$(window).on('load', function (dataset, wordCounts) {
  renderClouds(dataset, wordCounts)
})

//-----------------------------------------------------------------------------
/* #### RADIO CHECK BUTTON #### */
function vizCreation(){
  let prev = -1 // initialize variable
  $('#vizcreateoptions').selectable({
    filter: 'label',  // Makes the label tags the elements that are selectable
    selecting: function (e, ui) {
      let current = $(ui.selecting.tagName, e.target).index(ui.selecting)   // gets index of current target label
      if (e.shiftKey && prev > -1) {      // if you were holding the shift key and there was a box previously clicked
        // take the slice of labels from index prev to index curr and give them the 'ui-selected' class
        $(ui.selecting.tagName, e.target).slice(Math.min(prev, current) + 1, Math.max(prev, current) + 1).addClass('ui-selected')
        prev = -1  // reset prev index
      } else {
        prev = current  // set prev to current if not shift click
      }
    },
    stop: function () {
      // when you stop selecting, all inputs with the class 'ui-selected' get clicked
      $('.ui-selected input').trigger('click')
    }
  })
}
//-----------------------------------------------------------------------------

/* #### RENDER CLOUDS #### */
//draws the word cloud.
function renderClouds (dataset, wordCounts) {
  // Decrease the first wordScale domain numbers to increase size contrast
  let wordScale = d3.scale.linear().domain([1, 5, 50, 500]).range([10, 20, 40, 80]).clamp(true)
  let wordColor = d3.scale.linear().domain([10, 20, 40, 80]).range(['blue', 'green', 'orange', 'red'])
  let numSegments = dataset.length
  let viz

  $('<ul id="sortable">').appendTo('#multicloud-container')
  for (let i = 0; i < numSegments; i++) {
    $('<li class="ui-state-default" id="cloud' + i + '">').appendTo('#sortable')
    viz = d3.select('#cloud' + i).append('svg')
      .attr('width', 300)
      .attr('height', 380)
      .attr('id', 'svg' + i)
  }

  drawWords(wordScale, wordColor, wordCounts,dataset,wordCounts, numSegments)

  const sort = $('#sortable')
  sort.sortable({revert: 100})
  sort.disableSelection()

  // message appears when there is at least one document generated.
  if ($('#svg0')[0]) {
    $('#tips').html('<p>Drag the clouds to rearrange them.</p>')
  }
}

//-----------------------------------------------------------------------------

/* #### DRAW THE WORDS INTO DIFFERENT COLORS AND SIZE ####*/
function drawWords (wordScale, wordColor, wordCount ,dataset, wordCounts, numSegments) {
  let statusText
  let segment
  let label
  let children
  for (let i = 0; i < numSegments; i++) {
    statusText = d3.select('#status')
    segment = dataset[i]
    label = segment['name']
    children = segment['children']
    /* This array is now generated on the server and supplied in the
        ajax response. However, the client-side function is kept for reference. */
      // wordCounts = constructWordCounts(children)
    function draw (words) {
      // Create the tooltip
      let tooltip = d3.select('body').select('div.d3tooltip').attr('id', i)
      let viz = d3.select('#svg' + i)
      viz.append('g')
        .attr('transform', 'translate(150,190)')
        .attr('class', 'bigG' + i)
        .selectAll('text')
        .data(words)
        .enter().append('text')
        .attr('id', function (d) { return wordCounts[d.text] })
        .attr('title', i)
        .style('font-size', function (d) { return d.size + 'px' })
        .style('fill', function (d) { return wordColor(d.size) })
        .style('opacity', 0.75)
        .style('cursor', 'pointer')
        .attr('text-anchor', 'middle')
        .attr('transform', function (d) {
          return 'translate(' + [d.x, d.y] + ')rotate(' + d.rotate + ')'
        })
        .text(function (d) {
          // return decodeURIComponent(escape(d.text));
          return d.text
        })
        .on('mouseover', function (d) {
          tooltip.transition()
            .duration(200)
            .style('opacity', 1)
          tooltip.html('<div class="tooltip-arrow"></div><div class="tooltip-inner">' + (d.text) + ': ' + (d.size) + '</div>')
        })
        .on('mousemove', function () {
          return tooltip
            .style('left', (d3.event.pageX + 5) + 'px')
            .style('top', (d3.event.pageY - 20) + 'px')
          })
          .on('mouseout', function () {
            tooltip.transition()
              .duration(200)
              .style('opacity', 0)
          })
        viz.append('text')
          .data(label)
          .style('font-size', 14)
          .style('font-weight', 900)
          .attr('x', 65) // 100
          .attr('y', 20) // 15
          // .attr("x", function(){ return 150-this.getBBox().width/2; })
          .text(function () {
            return encodeURI(label) // encodes the string.
          })
      }
      d3.layout.cloud().size([280, 290])
        .words(children)
        .rotate(function () { return ~~(Math.random() * 2) * 5 })
        .fontSize(function (d) { return wordScale(d.size) })
        .on('end', draw)
        .start()
    }
  }

//-----------------------------------------------------------------------------
