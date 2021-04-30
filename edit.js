//
// PBDB Archive edit
// 
// Author: Michael McClennen
// 
// This code is designed to work with the file pbdb-app/archive/edit.html to implement a Web
// application for editing data archive records.


function DataArchiveEditor( data_url, enterer_id, parameters )
{
    "use strict";
    
    if ( data_url.match( /^\// ) && window.location.origin )
	data_url = window.location.origin + data_url;

    var editable_fields = ['title', 'authors', 'description', 'doi', 'is_public'];
    
    var edit_record;
    var archive_id;
    var numeric_id;
    
    // The following function initializes this application controller object.  It is exported as
    // a method, so that it can be called once the web page is fully loaded.
    
    function initialize ()
    {
	archive_id = parameters['id'];
	
	if ( archive_id && /^(dar:)?\d+$/.test(archive_id) )
	{
	    if ( /^\d/.test(archive_id) ) archive_id = 'dar:' + archive_id;
	    
	    $.ajax( {
		url: data_url + "archives/single.json?show=crmod,entname&id=" + archive_id,
		dataType: "json"
	    })
		.success (fillForm)
	    	.error (loadError);
	}
	
	else if ( archive_id )
	{
	    setInnerHTML('dar_header', "Data Archive: invalid parameter '" + archive_id + "'");
	    clearForm();
	}

	else
	{
	    setInnerHTML('dar_header', "Data Archive: no archive identifier was specified");
	    clearForm();
	}
    }
    
    this.initialize = initialize;

    // Fill the form with data retrieved from the server.

    function fillForm (data) {
	
        edit_record = data.records[0];
	
	archive_id = edit_record['oid'];
	if ( /^\d/.test(archive_id) ) archive_id = 'dar:' + archive_id;
	
	numeric_id = archive_id;
	if ( /^dar:/.test(numeric_id) ) numeric_id = numeric_id.substr(4);
	
	setInnerHTML('dar_header', "Data Archive " + numeric_id);
	setElementValue('dar_id', archive_id);
	setElementValue('dar_title', edit_record['title']);
	setElementValue('dar_description', edit_record['description']);
	setElementValue('dar_authors', edit_record['authors']);
	setElementValue('dar_public', edit_record['is_public']);
	
	var archive_uri = edit_record['uri_path'] + "?" + edit_record['uri_args'];
	
	setElementValue('dar_uri', archive_uri);
	
	var doi_content = '';
	
	if ( edit_record['doi'] )
	{
	    doi_content =  '<td><input type="text" name="doi" size="60" value="' + edit_record['doi'] + '" disabled>';
	    if ( edit_record.prm == 'admin' )
		doi_content = doi_content + '&nbsp;<button name="change_doi" type="button" onclick="pageapp.enterDOI()">Change DOI</button>';
	    disableElement('dar_title', true);
	    disableElement('dar_authors', true);
	    disableElement('dar_public', true);
	}
	
	else
	{
	    if ( edit_record.sta == 'pending' || edit_record.status == 'pending' )
	    {
		doi_content = 'DOI has been requested&nbsp;&nbsp;' +
		    "<button name='cancel_request' type='button' onclick='pageapp.requestDOI(\"cancel\")'>Cancel request</button>";
		if ( edit_record.prm == 'admin' )
		    doi_content = doi_content + "&nbsp;<button name='enter_doi' type='button' onclick='pageapp.enterDOI()'>Enter DOI</button>";
	    }
	    
            else
	    {
		doi_content = "<button name='doi_request' type='button' onclick='pageapp.requestDOI(\"send\")'>Request a DOI for this data archive</button>";
            }
	    
	    disableElement('dar_title', false);
	    disableElement('dar_authors', false);
	    disableElement('dar_public', false);
	}
	
	setInnerHTML('dar_doi', doi_content);
	
	setInnerHTML('dar_fetched', edit_record['fetched']);
	setInnerHTML('dar_created', edit_record['dcr']);
	setInnerHTML('dar_modified', edit_record['dmd']);
	
	if ( edit_record['ent'] )
	{
	    var authent = edit_record['ent'];

	    if ( edit_record['ath'] && edit_record['ath'] != edit_record['ent'] )
		authent = authent + ' (' + edit_record['ath'] + ')';
	    
	    setInnerHTML('dar_authent', authent);
	}
    }
    
    // Respond to an error while trying to load the metadata for the requested archive.
    
    function loadError ( xhr, textStatus, error )
    {
	// If the specified archive could not be fetched because the user is not logged in, redirect
	// to the login page.
	
	if ( xhr.status == "401" && ! enterer_id )
	{
	    var current_url = document.URL.replace(/^https?:\/\/[^\/]+/, '');

	    if ( current_url.match(/^\/[a-z]/) )
	    {
		var goto_url = "/login?redirect_after=" + encodeURIComponent(current_url);
		location.assign(goto_url);
		return;
	    }
	}
	
	// Otherwise, display the error.
	
	setInnerHTML('dar_header', '<span style="color: red">CANNOT EDIT Data Archive ' +
		     archive_id + ": " + error + '</span>');
	clearForm();
    }
    
    function clearForm ( )
    {
	setElementValue('dar_id', '');
	setElementValue('dar_title', '');
	setElementValue('dar_description', '');
	setElementValue('dar_authors', '');
	setElementValue('dar_uri', '');
	setInnerHTML('dar_doi', '');
	setInnerHTML('dar_fetched', '');
	setInnerHTML('dar_created', '');
	setInnerHTML('dar_modified', '');
	setInnerHTML('dar_authent', '');
    }
    
    function doSave ( )
    {
	var params = { };
	var param_count = 0;
	
	for ( var field_name of editable_fields )
	{
	    var old_value = edit_record[field_name];
	    var new_value = getFormValue('dar_edit', field_name);
	    
	    if ( new_value != undefined && new_value != old_value )
	    {
		params[field_name] = new_value;
		param_count++;
	    }
	}
	
	if ( param_count )
	{
	    params['oid'] = edit_record['oid'];
	}
	
	$.ajax( {
	    method: "POST",
	    url: data_url + "archives/addupdate.json?show=crmod",
	    data: params,
	    dataType: "json"
	})
	    .success(function ( data ) {
		fillForm(data);
		window.alert("Saved.");
	    })
	
	    .error(function(xhr, textStatus, errorString) {
		window.alert("Failed: " + xhr.status + " " + textStatus);
	    });
    }
    
    this.doSave = doSave;
    
    function doCancel ( )
    {
	window.history.back();
    }

    this.doCancel = doCancel;
    
    function doDownload ( )
    {
	if ( numeric_id )
	    window.open('/archives/retrieve/' + numeric_id);
	else
	    window.alert("This archive record does not have a valid numeric ID.");
    }
    
    this.doDownload = doDownload;

    function doRetrieve ( )
    {
	var retrieval_uri = $('#dar_uri').val();
	
	if ( retrieval_uri && /^[\/]data/.test(retrieval_uri) )
	    window.open(retrieval_uri);
	else
	    window.alert("This archive record does not contain a valid Data URI.");
    }
    
    this.doRetrieve = doRetrieve;
    
    // The following function allows for sending or canceling a DOI request.
    
    function requestDOI ( which )
    {
	var request_url;
	var message;
	
	if ( which == 'send' && window.confirm("Do you want to request a DOI for this data archive?") )
	{
	    request_url = '/classic/requestDOI?id=' + archive_id;
	    message = "DOI has been requested.";
	}
	
	else if ( which == 'cancel' && window.confirm("Do you want to cancel the DOI request for this data archive?") )
	{
	    request_url = '/classic/requestDOI?operation=cancel&id=' + archive_id;
	    message = "DOI request has been canceled.";
	}
	
	if ( request_url )
	{
	    $.ajax( {
		method: "GET",
		url: request_url,
	    })
		.success(function ( data ) {
		    window.alert(message);
		})
	    
		.error(function(xhr, textStatus, errorString) {
		    window.alert("Failed: " + xhr.status + " " + textStatus);
		});
	}
    }

    this.requestDOI = requestDOI;

    // The following function allows an administrator to enter or change a DOI.
    
    function enterDOI ( )
    {
	var doi_value = edit_record['doi'] || '';
	setInnerHTML('dar_doi', '<td><input type="text" name="doi" size="60" value="' +
		     doi_value + '">');
    }
    
    this.enterDOI = enterDOI;

    // Delete this archive

    function doDelete ( )
    {
	if ( edit_record['doi'] )
	{
	    window.alert("This archive cannot be deleted, because it has been issued a DOI.");
	    return;
	}

	else if ( edit_record['sta'] == 'pending' || edit_record['status'] == 'pending' )
	{
	    window.alert("This archive cannot be deleted, because a DOI has been requested for it.");
	    return;
	}
	
	else if ( window.confirm("Do you want to delete this archive? The operation cannot be undone.") )
	{
	    $.ajax( {
		method: "GET",
		url: data_url + "archives/delete.json?id=" + archive_id
	    })
		.success(function ( data ) {
		    window.alert("Archive was deleted.");
		    window.open('/app/archive/list', '_self');
		})
	    
		.error(function(xhr, textStatus, errorString) {
		    window.alert("Failed: " + xhr.status + " " + textStatus);
		});
	}
    }
    
    this.doDelete = doDelete;
    
    // This function retrieves the DOM object with the specified id, and leaves a reasonable
    // message on the console if the program contains a typo and the requested element does not
    // exist.
    
    function myGetElement ( id )
    {
	var elt = document.getElementById(id);
	
	if ( elt == undefined )
	{
	    console.log("ERROR: unknown element '" + id + "'");
	    return undefined;
	}
	
	else return elt;
    }
    
    // If the specified DOM object is of type "checkbox", then return the value of its 'checked'
    // attribute.  Otherwise, return the value of its 'value' attribute.
    
    function getElementValue ( id )
    {
	var elt = myGetElement(id);
	
	if ( elt && elt.type && elt.type == "checkbox" )
	    return elt.checked;
	
	else if ( elt )
	    return elt.value;
	
	else
	    return "";
    }

    // Given the name of a form and the name of an element, return the value.
    
    function getFormValue ( form_name, field_name )
    {
	var elt = document.forms[form_name][field_name];

	if ( elt && elt.type && elt.type == "checkbox" )
	    return elt.checked;

	else if ( elt )
	    return elt.value;

	else
	    return "";
    }
    
    // Set the 'value' property of the specified element.
    
    function setElementValue ( id, value )
    {
	var elt = myGetElement(id);
	
	if ( elt && elt.type && elt.type == "checkbox" )
	{
	    if ( value && value != "0" )
		elt.checked = true;
	    else
		elt.checked = false;
	}
	
	else if ( elt && typeof(value) == "string" )
	    elt.value = value;
    }

    // Set the 'innerHTML' property of the specified element.  If the specified content is not a
    // string, then the property is set to the empty string.
    
    function setInnerHTML ( id, content )
    {
	var elt = myGetElement(id);
	
	if ( elt )
	{
	    if ( typeof(content) != "string" )
		elt.innerHTML = "";
	    else
		elt.innerHTML = content;
	}
    }

    // Disable the specified element if the second argument is true, enable it if false.

    function disableElement ( id, disable )
    {
	var elt = myGetElement(id);

	if ( elt ) elt.disabled = disable;
    }
}      
