// Handlebars helpers

Handlebars.registerHelper('paragraphSplit', function(plaintext) {
  var i, output = '',
      lines = plaintext.split(/\r\n|\r|\n/g);
  for (i = 0; i < lines.length; i++) {
      if(lines[i]) {
          output += '<p>' + lines[i] + '</p>';
      }
  }
  return new Handlebars.SafeString(output);
});


$(document).ready(function() {
  var index = 'http://localhost:3000/api/'

  var note_id = $("#note").html();
  var note_template = Handlebars.compile(note_id);

  var noteform_id = $("#newnoteform").html();
  var newNoteTemplate = Handlebars.compile(noteform_id)

  getindex()


  function getindex(){
    $.getJSON(index+"notes", function(data) {
      $('#maincontent').html("")
      noteload(data);
      })
  }

// Loads note into templete using an object, assumes attributes are level 0
  function noteload(data){
    $.each(data, function(i, note){
    note['time'] = [moment(note.created_at).format('MMMM Do YYYY, h:mm:ss a')]
    $('#maincontent').append(note_template(note))
    })
  }

  // creates the content of the newnote modal - needs handlebar 'template'
  function createModal(template, title, context) {
    $('#newnotemodal .modal-title').text(title || "Our title")
    $('#newnotemodal .modal-body').html(template(context || {}))
  }

// GET list of notes from api that contain the same tag :name
  $(document.body).on('click', '.tag_list a', function(ev){
    ev.preventDefault()
    $.getJSON(index+"notes/tag/"+ev.target.text, function(data) {
      $('#maincontent').html("")
      noteload(data.notes);
      $('#title').text('Notemeister 5000: ' + ev.target.text)
    })
  })

// Create form to submit a new post with through the modal
$('#newnote').on('click', function(ev){
  createModal(newNoteTemplate,"New Note")
  $('#newnotemodal').modal('show')
})
// Submit new post through modal pop-up, (without login support)
$(document.body).on('submit', '#chirp-form', function(ev){
  ev.preventDefault()
  postChirpForm()
})






















})
