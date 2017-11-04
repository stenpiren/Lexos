/**
 * the function to convert the from into json
 * @returns {{string: string}} - the from converted to json
 */
function jsonifyForm () {
    var form = {}
    $.each($('form').serializeArray(), function (i, field) {
        form[field.name] = field.value || ''
    })
    return form
}

/**
 * the function to run the error modal
 * @param htmlMsg {string} - the message to display, you can put html in it
 */
function runModal (htmlMsg) {
    $('#error-modal-message').html(htmlMsg)
    $('#error-modal').modal()
}

/**
 * the function to do ajax in dendrogram
 */
function doAjax () {
    // show loading icon
    $('#status-analyze').css({'visibility': 'visible'})

    // convert form into an object map string to string
    var form = jsonifyForm()

    // make the ajax request
    $.ajax({
        type: 'POST',
        url: '/dendrogramDiv',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        data: JSON.stringify(form)
    })
        .done(
            function (response) {
                $('#dendrogram-result').html(response['dendroDiv'])
            })
        .fail(
            function (jqXHR, textStatus, errorThrown) {
                console.log('textStatus: ' + textStatus)
                console.log('errorThrown: ' + errorThrown)
                runModal('error encountered while plotting the dendrogram.')
            })
        .always(
            function () {
                $('#status-analyze').css({'visibility': 'hidden'})
            })
}

/**
 * the error message for the submission
 * @returns {string | null} - if it is null, it means no error, else then the string is the error message
 */
function submissionError () {
    const active_file_num_too_few_err = 'A dendrogram requires at least 2 active documents to be created.'
    const activeFiles = $('#num_active_files').val()
    if (activeFiles < 2)
        return active_file_num_too_few_err
    else
        return null
}

/**
 * When the HTML documents finish loading
 */
$(function () {

    /**
     * the events after dendrogram is clicked
     */
    $('#getdendro').on('click', function () {
        const error = submissionError()  // the error happens during submission

        if (error === null) {  // if there is no error
            doAjax()
        }
        else {
            runModal(error)
        }
    })

})
