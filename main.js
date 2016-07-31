
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
  var index = 'https://immense-plains-33478.herokuapp.com/api/'

  var note_id = $("#note").html();
  var note_template = Handlebars.compile(note_id);

  var noteform_id = $("#newnotetemplate").html();
  var newNoteTemplate = Handlebars.compile(noteform_id)

  var editform_id = $("#editnotetemplate").html();
  var editNoteTemplate = Handlebars.compile(editform_id)

  var userform_id = $("#newusertemplate").html();
  var newUserTemplate = Handlebars.compile(userform_id)

  var usernote_id = $("#usernote").html();
  var userNoteTemplate = Handlebars.compile(usernote_id)

  var loginform_id = $("#logintemplate").html();
  var loginTemplate = Handlebars.compile(loginform_id)

  var hashnote_id = $("#notemodaltemplate").html();
  var hashNoteTemplate = Handlebars.compile(hashnote_id)

  checkStatus()

  function checkStatus(){
    if (apiToken()) {
      $('#loggedin').text("logged in as " + userEmail());
      $('#status').text("Logout");
      getuserindex()
    }
    else {
      getindex()
    }
  }

  function apiToken(){
    return sessionStorage.getItem('api_token');
  }

  function userEmail(){
    return sessionStorage.getItem('email');
  }

  function setApiToken(token, email){
    sessionStorage.setItem('api_token', token);
    sessionStorage.setItem('email', email)
  }

  function releaseApiToken(){
    sessionStorage.setItem('api_token', "");
    sessionStorage.setItem('email', "")
  }


  // Loads index will use api_token to validate user if available, then only shows their notes
  function getindex(){
    $('#title').text('Notemeister 5000');
    $.getJSON(index+"notes", {
      api_token: apiToken()
    })
      .done(function(data) {
        $('#maincontent').html("")
        noteload(data);
        })
  }

  // Loads index will use api_token to validate user if available, then only shows their notes
  function getuserindex(){
    $('#title').text('Notemeister 5000');
    $.getJSON(index+"notes", {
      api_token: apiToken()
    })
      .done(function(data) {
        $('#maincontent').html("");
        $.each(data, function(i, note){
        note['time'] = [moment(note.created_at).format('MMMM Do YYYY, h:mm:ss a')]
        $('#maincontent').prepend(userNoteTemplate(note))
        })
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
    $('#newmodal .modal-title').text(title);
    $('#newmodal .modal-body').html(template(context || {}))
  }


  // POST new note from form data in new note modal
  function postNoteForm(){
    $.post({
        url: index + "notes",
        data: {api_token: apiToken(), title: $('#notetitle').val(), body: $('#notebody').val(), tags: $('#notetags').val()},
        success: function(data){
                  $('#maincontent').prepend(note_template(data));
                  $('#newmodal').modal('hide');
                },
        error: function(data){
                  console.log(data)
                }
    })
  }

  // POST editted note from form data in edit note modal
  function putEditForm(id){
    $.ajax({
         url: index + "notes/" + $('#disabledinput').val(),
         type: 'PUT',
         data: {api_token: apiToken(), title: $('#notetitle').val(), body: $('#notebody').val()},
         success: function(data){
                   $('#newmodal').modal('hide');
                   getuserindex()
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
                  setApiToken(data.api_token, $('#useremail').val());
                  $('#loggedin').text("logged in as " + $('#useremail').val());
                  $('#status').text("Logout");
                  $('#newmodal').modal('hide');
                  getuserindex()
                },
        error: function(data){
                  console.log(data);
                  var error = data;
                  $('#userformerrors').html("<p class=\"bg-danger\">" + data.responseJSON.error + "</p>");
                }
    })
  }



  // Clicking on brand takes back to appropriate index
  $('#homeindex').on('click', function(ev){
    checkStatus();
    $('#title').text('Notemeister 5000')
  })

  // Create form to login or logout on the notemeister 5000
  $('#status').on('click', function(ev){
    if ($('#status').text() == "Login") {
      createModal(loginTemplate,"User Login");
      $('#newmodal').modal('show');
    }
    else {
      $('#loggedin').text("");
      releaseApiToken();
      $('#status').text("Login");
      checkStatus()
    }
  })

  // Create form to edit an existing post through the modal
  $('#maincontent.col-sm-12').on('click', '#noteedit', function(ev){
    var id = ($(this).parents('div.panel.panel-info').find('div.id').text())
    $.getJSON(index+"notes/"+id)
      .done(function(data) {
        createModal(editNoteTemplate, "Edit Note", data)
        $('#notetitle').val(data.title);
        $('#disabledinput').val(id);
        $('#notebody').val(data.body);
      })
    $('#newmodal').modal('show')
  })

  // Selector helper
  // $('*').on('click', function(ev){
  //   console.log(ev);
  // })

  // Create form to edit a user's note through the modal
  $('#newnote').on('click', function(ev){
    if (apiToken()) {
    createModal(newNoteTemplate,"New Note");
    $('#newmodal').modal('show')
    }
    else {
      alert("Please login or create a new user.")
    }
  })

  // Create form to submit a new user through the modal
  $('#newuser').on('click', function(ev){
    createModal(newUserTemplate,"New User");
    $('#newmodal').modal('show')
  })

  // Submit new note through modal pop-up
  $(document.body).on('submit', '#noteform', function(ev){
    postNoteForm()
  })

  // Submit new user request through modal pop-up
  $(document.body).on('submit', '#userform', function(ev){
    postUserForm()
  })

  // Submit login credentials through modal pop-up
  $(document.body).on('submit', '#loginform', function(ev){
    postLoginForm()
  })

  // Submit editted note through modal pop-up
  $(document.body).on('submit', '#editnoteform', function(ev){
    putEditForm()
  })

  // Search for notes with tag through navbar search form
  $(document.body).on('click', '#search', function(ev){
    $.getJSON(index + "notes/tag/" + $('#searchinput').val())
      .done(function(data) {
        alert("success")
        $('#maincontent').html("")
        noteload(data.notes);
        $('#title').text('Notemeister 5000 Tag Search: ' + $('#searchinput').val())
      })
      .fail(function(data) {
        alert("fail")
        console.log(data);
        $('#maincontent').html("Search returned no results")
      })
  })

  // GET list of notes from api that contain the same tag :name
  $(document.body).on('click', '.tag_list a', function(ev){
    ev.preventDefault()
    $.getJSON(index+"notes/tag/"+ev.target.text, function(data) {
      $('#maincontent').html("")
      noteload(data.notes);
      $('#title').text('Notemeister 5000: ' + ev.target.text)
    })
  })

  // Creates a modal showing the note info matching the id of the hash when typed into url after #
  $(window).on('hashchange', function(ev) {
    var hash = window.location.hash.replace(/^#/,'');
    $.getJSON(index+"notes/"+hash)
      .done(function(data) {
        createModal(hashNoteTemplate, data.title, data)
        $('#newmodal').modal('show')
        })
  })


})
