/**
 * Function to create popover help for new lexos users.
 * @returns {void}
 */
function sidebarPopover () {
  if (localStorage.getItem('visited') !== 'yes') {
    localStorage.setItem('visited', 'yes')
    $('#toggler').popover({
      'html': 'true',
      'title': 'In the Margins!',
      'content': 'View instructions for any screen in Lexos by clicking the In the Margins Tab!\n<div class="text-center"><button type="button" id="gotit" class="btn btn-primary" style="background-color: #0068AF">Got it!</button></div>'
    }).popover('show').data('bs.popover').tip().css({
      'width': '170px',
      'text-align': 'center'
    })
    $('#gotit').click(function () {
      $('#toggler').popover('destroy')
    })
    $('#toggler').click(function () {
      $('#toggler').popover('destroy')
    })
  }
}

$.fn.center = function () {
  this.css('top', Math.max(0, ((($(window).height()) - $(this).outerHeight()) / 2) - 200) + 'px')
  this.css('left', Math.max(0, (($(window).width() - $(this).outerWidth()) / 2)) + 'px')
  return this
}

$('form').attr('method', 'post')

$(document).ready(function () {
  $('#getviz').click(function (e) {
    if (numActiveDocs < 1) {
      msg = 'You have no active documents. Please activate at least one document using the <a href="./manage">Manage</a> tool or <a href="./upload">upload</a> a new document.'
      $('#error-modal-message').html(msg)
      $('#error-modal').modal()
      e.preventDefault()
      return false
    } else if ($("input[name='segmentlist']:checked").length < 1) {
      msg = 'You have no active documents. Please activate at least one document using the <a href="./manage">Manage</a> tool or <a href="./upload">upload</a> a new document.'
      $('#error-modal-message').html(msg)
      $('#error-modal').modal()
      e.preventDefault()
      return false
    }
  })
  browserDetection()
})

$(function () {
  sidebarPopover();
  // Load the Scalar API and cache it.
  /*	$.ajax({
          url: "/static/lib/scalarapi.js",
          dataType: "script",
          cache: true
      }); */

  // Initialise tooltips
	/* Note: The standard Lexos tooltip will have the following html:

	   <i class="fa fa-question-circle lexos-tooltip-trigger" data-toggle="tooltip"\
	    data-html="true" data-placement="right" data-container="body" title="Some content"\
	    style=""></i>

	   @style may be used to adjust the size and placement of the trigger icon.
	   The default is margin-right:10px;font-size:14px;.
	*/

  $('[data-toggle="tooltip"]').tooltip()

  // Initialise popovers -- mouseleave handling from http://www.bootply.com/98529

	/* Note: The standard Lexos popover will have the following html:

	   <i class="fa fa-question-circle lexos-popover-trigger" data-trigger="hover"
	   data-html="true" data-toggle="popover" data-placement="right" data-container="body"
	   data-content="Some content" style="" title=""></i>

	   @style may be used to give to adjust the size and placement of the trigger icon.
	   @title may be used to give the popover a header.
	*/

  $('[data-toggle=popover]').popover({
    trigger: 'manual',
    animate: false,
    html: true,
    placement: 'right',
    template:
    '<div class="popover" onmouseover="$(this).mouseleave(function() {$(this).hide();});">\
			<div class="arrow"></div>\
			<h3 class="popover-title"></h3>\
			<div class="popover-content"><p></p></div>\
	  	  </div>'
  }).click(function (e) {
    e.preventDefault()
  }).mouseenter(function (e) {
    $(this).popover('show')
  })
})

$(function () {
  // Handle exceptions for submitting forms and display error messages on screen
  $('form').attr('method', 'post')
  $('form').submit(function () {
    $('#num_active_files').val()
    if ($('#num_active_files').val() == '0') {
      $('#error-modal').modal()
      return false
    } else {
      return true
    }
  })

  // Add "selected" class to parent of selected link
  $('.sublist li .selected').parents('.headernavitem').addClass('selected')

  // display/hide expandable divs here
  $('.has-expansion .icon-arrow-right').click(function () {
    $(this).toggleClass('showing')

    $(this).parent('legend').siblings('.expansion').slideToggle(500)
  })

  // Gray out all disabled inputs
  $.each($('input'), function () {
    if ($(this).prop('disabled')) {
      $(this).parent('label').addClass('disabled')
    }
  })

  // Redirect all clicks on "Upload Buttons" to their file upload input
  $('.upload-bttn').click(function () {
    $(this).siblings('input[type=file]').click()
  })

  // Show the nested submenu of clustering when mouse hover over the corresponding navbar, otherwise hide the nested menu
  $('#clustering-menu, #clustering-submenu').mouseover(function () {
    $('#clustering-submenu').css({ 'opacity': 1, 'visibility': 'visible' })
  }).mouseleave(function () {
    $('#clustering-submenu').css({ 'opacity': 0, 'visibility': 'hidden' })
  })

  // Highlight the nested label of the navBar when nested pages are active
  if ($('.nestedElement').hasClass('selected')) {
    $('.nestedLabel').addClass('selected')
  }

  $(document).on('click', '#savesettings', function (event) {
    event.preventDefault()
    var form = {}
    $.each($('#settingsform').serializeArray(), function (i, field) {
      form[field.name] = field.value || ''
    })

    if ($('#beta_onbox').is(':checked')) {
      form['beta_onbox'] = true
    } else {
      $.extend(form, { 'beta_onbox': false })
    }
    $.ajax({
      'url': '/updatesettings',
      'type': 'POST',
      'contentType': 'application/json; charset=utf-8',
      'dataType': 'json',
      'data': JSON.stringify(form),
      'error': function () {
        alert('Error! Your settings could not be saved.')
      }
    }).done(function (response) {
      window.location = window.location.pathname
      // console.log("Response: "+JSON.stringify(response));
    })
  })
})

function getFormValues () {
	/* Gathers all the form values and returns them as a FormData object. In Flask,
	access form values through request.form and files through request.files. Returns
	a JSON object. */

  var formData = new FormData($('form')[0])

  $.ajax({
    url: '/previewScrubbing',
    type: 'POST',
    processData: false, // important
    contentType: false, // important
    data: formData,
    'error': function () { alert('error') }
  }).done(function (response) {
    response = JSON.parse(response)
    return response
  })
}

/**
 * Display a warning in an alert if using an unsupported browser. Supported
 * browsers include Chrome and Firefox.
 */
function browserDetection () {

  const browserWarningMsg = `You are currently using an unsupported browser.\
  Some Lexos features may not function properly or be unavailable. Please\
  use either Chrome or Firefox when using Lexos.`

  // Opera 8.0+
  const isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;

  // Firefox 1.0+
  const isFirefox = typeof InstallTrigger !== 'undefined';

  // Safari 3.0+ "[object HTMLElementConstructor]"
  const isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

  // Internet Explorer 6-11
  const isIE = /*@cc_on!@*/false || !!document.documentMode;

  // Edge 20+
  const isEdge = !isIE && !!window.StyleMedia;

  // Chrome 1+
  const isChrome = !!window.chrome && !!window.chrome.webstore;

  // If first time on page, show error message if browser is not supported
  if (typeof(Storage) !== "undefined") {
    // check browser if user has not previously visited page
    if (!sessionStorage.visited){
      if (isOpera) {
        alert(browserWarningMsg)
      }
      else if (isSafari) {
        alert(browserWarningMsg)
      }
      else if (isIE){
        alert(browserWarningMsg)
      }
      else if (isEdge){
        alert(browserWarningMsg)
      }
      else if (isChrome){
        alert("hello")
      }
      else if (isFirefox){
        alert("fire")
      }
      // Set visited to true after the user visits the page
      sessionStorage.visited = true
    }
  }
}
