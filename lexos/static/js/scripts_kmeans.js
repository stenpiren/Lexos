/**
 * the function to convert the from into json
 * @returns {{string: string}} - the from converted to json
 */
function jsonifyForm () {
    const form = {}
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
 * The function to create the ajax object
 * @param form {object.<string, string>} the form converted into a json
 * @returns {jquery.Ajax} - the jquery ajax object (a deferred object)
 */
function sendAjaxRequest (form) {

    return $.ajax({
        type: 'POST',
        url: '/kmeansDiv',
        contentType: 'application/json; charset=utf-8',
        data: JSON.stringify(form)
    })

}

/**
 * the function to submit form via ajax in kmeans
 */
function submitForm () {
    // show loading icon
    $('#status-analyze').css({'visibility': 'visible'})

    // convert form into an object map string to string
    const form = jsonifyForm()

    // send the ajax request
    sendAjaxRequest(form)
        .done(
            function (response) {
                $('#kmeansPCA-result').html(response)
            })
        .fail(
            function (jqXHR, textStatus, errorThrown) {
                console.log('textStatus: ' + textStatus)
                console.log('errorThrown: ' + errorThrown)
                runModal('error encountered while plotting the kmeans PCA result.')
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
    const active_file_num_too_few_err = 'A kmeans analysis requires at least 2 active documents to be created.'
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
     * the events after kmeans is clicked
     */
    $('#getkmeansPCA').on('click', function () {
        const error = submissionError()  // the error happens during submission

        if (error === null) {  // if there is no error
            submitForm()
        }
        else {
            runModal(error)
        }
    })

})
