// Handlebars helpers

// function apiToken(){
//   sessionStorage.getItem('api_token');
//   console.log(sessionStorage.getItem('api_token'))
// }

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
  var index = 'https://6080bebb.ngrok.io/api/'
  // var api_token = '1b5fccbdd4d7214e7ce6'

  var note_id = $("#note").html();
  var note_template = Handlebars.compile(note_id);

  var noteform_id = $("#newnotetemplate").html();
  var newNoteTemplate = Handlebars.compile(noteform_id)

  var userform_id = $("#newusertemplate").html();
  var newUserTemplate = Handlebars.compile(userform_id)

  var loginform_id = $("#logintemplate").html();
  var loginTemplate = Handlebars.compile(loginform_id)


  releaseApiToken()
  getindex()

  function apiToken(){
    return sessionStorage.getItem('api_token');
  }

  function setApiToken(token){
    sessionStorage.setItem('api_token', token);
  }

  function releaseApiToken(){
    sessionStorage.setItem('api_token', "");
  }


  // Loads index first, does not check for login yet
  function getindex(){
    $.getJSON(index+"notes", {
      api_token: apiToken()
    })
      .done(function(data) {
        console.log(data)
        $('#maincontent').html("")
        noteload(data);
        })
  }

  // Loads note into template using an object, assumes attributes are level 0
  function noteload(data){
    $.each(data, function(i, note){
    note['time'] = [moment(note.created_at).format('MMMM Do YYYY, h:mm:ss a')]
    $('#maincontent').prepend(note_template(note))
    })
  }

  // creates the fields for a new  modal - needs a handlebar 'template'
  function createModal(template, title, context) {
    $('#newmodal .modal-title').text(title || "Our title")
    $('#newmodal .modal-body').html(template(context || {}))
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

  // POST new note from form data in new post modal
  function postNoteForm(){
    $.post({
        url: index + "notes",
        data: {api_token: api_token, title: $('#notetitle').val(), body: $('#notebody').val(), tags: $('#notetags').val()},
        success: function(data){
                  $('#maincontent').prepend(note_template(data));
                  $('#newmodal').modal('hide');
                },
        error: function(data){
                  console.log(data)
                }
    })
  }

  // POST create new user from new user modal pop-up
  function postUserForm(){
    $.post({
        url: index + "users",
        data: {email: $('#useremail').val(), password: $('#userpassword').val(), password_confirmation: $('#passwordconfirm').val()},
        success: function(data){
                  console.log(data);
                  $('#newmodal').modal('hide');
                },
        error: function(data){
                  console.log(data);
                  $('#userformerrors').html("<p class=\"bg-danger\">" + data.responseText + "</p>");
                }
    })
  }

  // POST Login with an existing user from modal pop-up
  function postLoginForm(){
    $.post({
        url: index + "users/login",
        data: {email: $('#useremail').val(), password: $('#userpassword').val()},
        success: function(data){
                  console.log(data);
                  setApiToken(data.api_token);
                  $('#loggedin').text("logged in with " + $('#useremail').val());
                  $('#status').text("Logout");
                  $('#newmodal').modal('hide');
                  getindex()
                },
        error: function(data){
                  console.log(data);
                  var error = data;
                  $('#userformerrors').html("<p class=\"bg-danger\">" + data.responseJSON.error + "</p>");
                }
    })
  }


  // Click on brand takes back to index
  $('#homeindex').on('click', function(ev){
    getindex()
    $('#title').text('Notemeister 5000')
  })

  // Create form to login to the notemeister 5000
  $('#status').on('click', function(ev){
    if ($('#status').text() == "Login") {
      createModal(loginTemplate,"User Login");
      $('#newmodal').modal('show');
    }
    else {
      $('#loggedin').text("");
      releaseApiToken();
      $('#status').text("Login");
      getindex();
    }
  })

  // Create form to submit a new post with through the modal
  $('#newnote').on('click', function(ev){
    createModal(newNoteTemplate,"New Note")
    $('#newmodal').modal('show')
  })

  // Create form to submit a new user with through the modal
  $('#newuser').on('click', function(ev){
    createModal(newUserTemplate,"New User")
    $('#newmodal').modal('show')
  })

  // Submit new post through modal pop-up, (without login support)
  $(document.body).on('submit', '#noteform', function(ev){
    ev.preventDefault()
    postNoteForm()
  })

  // Submit new post through modal pop-up, (without login support)
  $(document.body).on('submit', '#userform', function(ev){
    ev.preventDefault()
    postUserForm()
  })

  // Submit new post through modal pop-up, (without login support)
  $(document.body).on('submit', '#loginform', function(ev){
    ev.preventDefault()
    postLoginForm()
  })




})
