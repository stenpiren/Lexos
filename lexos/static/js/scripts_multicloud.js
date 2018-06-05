$(function () {
  // Add tooltip to the DOM
  const getMultiviz = $('#getmultiviz')
  const multiCloudSelection = $('#multicloud-selection')
  const multiCloudUpload = $('#multicloud-upload')

  // Set form display based on toggle state on page load
  const toggleState = $('input[name="options-toggle"]').bootstrapSwitch('state')
  // Topic clouds
  if (toggleState === false) {
    $('#analysisType').val('topicfiles')
    multiCloudSelection.hide()
    getMultiviz.hide()
    multiCloudUpload.show()
  }
  // Document clouds
  else {
    $('#analysisType').val('userfiles')
    multiCloudSelection.show()
    multiCloudUpload.hide()
    getMultiviz.show()
  }

  // Show the Get Graphs button when a file is uploaded
  $('#optuploadname').change(function () {
    getMultiviz.show()
  })

  // Handle the continue button on the warning dialog
  $(document).on('click', '#continue', function () {
    $('#warning-modal').modal('hide')
    window.setTimeout(300)
    doAjax()
  })

  // Trigger validation when the Get Graphs button is clicked
  getMultiviz.click(function () {
    const valid = validate()
    if (valid === true) {
      $('#multicloud-container').empty()
      confirmation()
    }
  })

  tooltip = d3.select('body').append('div')
    .attr('class', 'd3tooltip tooltip right')
    .style('opacity', 0)
  d3.select('.d3tooltip').attr('role', 'tooltip')

  // Show filename of uploaded file
  multiCloudUpload.change(function (ev) {

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
  multiCloudSelection.show()
  multiCloudUpload.hide()
})


//=============================================================================
// Validate
function validate () {
  let toggleState
  toggleState = $('input[name="options-toggle"]').bootstrapSwitch('state')
  // For document clouds, make sure there are active documents
  if (toggleState === true && numActiveDocs < 1) {
    msg = 'You have no active documents. Please activate at least one document using the <a href=\'./manage\'>Manage</a> tool or <a href=\'./upload\'>upload</a> a new document.'
    $('#error-modal-message').html(msg)
    $('#error-modal').modal()
    e.preventDefault()
    return false
  }
  // For document clouds, make sure documents have been selected
  else if (toggleState === true && $('input[name=\'segmentlist\']:checked').length < 1) {
    msg = 'Please select at least one document. If no documents are listed, go to the <a href="./manage">Manage</a> tool to activate documents or <a href="./upload">upload</a> new documents.'
    $('#error-modal-message').html(msg)
    $('#error-modal').modal()
    e.preventDefault()
    return false
  }
  // For topic clouds, make sure a Mallet file has been uploaded.
  else if (toggleState === false && $('input[type=file]').val() === '') {
    $('#error-modal-message').html('No MALLET topic file uploaded.')
    $('#error-modal').modal()
    return false
  }
  else {
    $('#status-visualize').css({'visibility': 'visible', 'z-index': '400000'})
    return true
  }
}

// Function to convert the form data into a JSON object
function jsonifyForm () {
  const form = {}
  $.each($('form').serializeArray(), function (i, field) {
    form[field.name] = field.value || ''
  })
  return form
}

function doAjax () {
  /* It's not really efficient to create a FormData and a json object,
  but the former is easier to pass to run.py functions, and the
  latter is easier for the ajax response to use. */
  let formData = new FormData($('form')[0])
  const url = '/doMulticloud'
  formData.append('action', 'post')
  let jsonform = jsonifyForm()
  $.extend(jsonform, {'action': 'post'})

  sendAjaxRequest(url, formData)
    .fail(function (jqXHR, textStatus, errorThrown) {
      $('#status-visualize').css({'visibility': 'hidden'})
      // Show an error if the user has not cancelled the action
      if (errorThrown !== 'abort') {
        $('#error-modal-message').html('Lexos could not process the data. If you are trying to generate topic clouds, make sure that you have uploaded a valid file produced by the MALLET <code>--words-topic-counts-file</code> or the <code>--output_state</code> command. The latter is a zip archive that must be unzipped before you upload it to Lexos.')
        $('#error-modal').modal()
      }
      console.log('bad: ' + textStatus + ': ' + errorThrown)
    })
    .done(function (response) {
      response = JSON.parse(response)
      renderClouds(response[0], response[1])
      $('#status-visualize').css({'visibility': 'hidden'})
    })
}


function sendAjaxRequest (url, formData) {
  return $.ajax({
    url: url,
    type: 'POST',
    processData: false, // important
    contentType: false, // important
    data: formData
  })
}
/* #### this function runs right after you click the 'get graph' button. ####*/
// warning modal to confirm that the user wants to continue to draw the word cloud
function confirmation () {
  const warningModal = $('#warning-modal')
  $('#formAction').val('post')
  $('#status-visualize').css({'visibility': 'visible', 'z-index': '400000'})
  const warning = '<p>Rendering multiclouds takes a long time and will likely cause your browser to freeze temporarily. Please be patient.</p><p>Do you want to continue?</p>'
  let footerButtons = '<button type="button" class="btn btn-default" id="continue">Yes</button><button type="button" class="btn btn-default" data-dismiss="modal">No</button>'
  warningModal.children().first().removeClass('modal-lg').addClass('modal-sm')
  $('#warning-modal-footer').html(footerButtons)
  $('#warning-modal-message').html(warning)
  warningModal.modal()
  warningModal.on('hide.bs.modal', function () {
    $('#status-visualize').css('visibility', 'hidden')
  })
}

//-----------------------------------------------------------------------------
// Make pre-Ajax implementation work
$(window).on('load', function (dataset, wordCounts) {
  renderClouds(dataset, wordCounts)
})

//-----------------------------------------------------------------------------
/* #### RADIO CHECK BUTTON #### */
function vizCreation () {
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
//draws the cloud.
function renderClouds (dataset, wordCounts) {
  // Decrease the first wordScale domain numbers to increase size contrast
  let wordScale = d3.scale.linear().domain([1, 5, 50, 500]).range([10, 20, 40, 80]).clamp(true)
  let wordColor = d3.scale.linear().domain([10, 20, 40, 80]).range(['blue', 'green', 'orange', 'red'])
  let numSegments = dataset.length
  let viz

  $('<ul id="sortable">').appendTo('#multicloud-container')//add the id 'sortable'
  for (let i = 0; i < numSegments; i++) {
    $('<li class="ui-state-default" id="cloud' + i + '">').appendTo('#sortable')
    viz = d3.select('#cloud' + i).append('svg')
      .attr('width', 300)
      .attr('height', 380)
      .attr('id', 'svg' + i)
  }

  //draw words into different colors and sizes.
  drawWords(wordScale, wordColor, wordCounts, dataset, wordCounts, numSegments)

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
function drawWords (wordScale, wordColor, wordCount, dataset, wordCounts, numSegments) {
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
            .duration(1)
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
            .duration(1)
            .style('opacity', 0)
        })
      viz.append('text')
        .data(label)
        .style('font-size', 14)
        .style('font-weight', 900)
        .attr('x', 65) // 100
        .attr('y', 20) // 15
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
