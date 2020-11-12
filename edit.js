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

    var editable_fields = ['title', 'authors', 'description', 'is_public'];
    
    var edit_record;
    var archive_id;
    var numeric_id;
    
    // The following function initializes this application controller object.  It is exported as
    // a method, so that it can be called once the web page is fully loaded.
    
    function loadRecord ()
    {
	archive_id = parameters['id'];
	
	if ( archive_id && /^(dar:)?\d+$/.test(archive_id) )
	{
	    if ( /^\d/.test(archive_id) ) archive_id = 'dar:' + archive_id;
	    
	    $.ajax( {
		url: data_url + "archives/single.json?show=crmod&id=" + archive_id,
		dataType: "json"
	    })
		.success (fillForm)
	    	.error (loadError);
	}
	
	else
	{
	    setInnerHTML('dar_header', "Data Archive: invalid parameter '" + archive_id + "'");
	    clearForm();
	}
    }
    
    this.loadRecord = loadRecord;

    function fillForm (data) {
	
        edit_record = data.records[0];
	
	archive_id = edit_record['oid'];
	if ( /^\d/.test(archive_id) ) archive_id = 'dar:' + archive_id;
	
	numeric_id = archive_id;
	if ( /^dar:/.test(numeric_id) ) numeric_id = numeric_id.substr(4);
	
	setInnerHTML('dar_header', "Data Archive " + archive_id);
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
	    doi_content =  "<td><input type='text' name='doi' disabled>" + edit_record['doi'] + "</input>";
	    disableElement('dar_title', true);
	    disableElement('dar_authors', true);
	    disableElement('dar_public', true);
	}
	
	else
	{
	    if ( edit_record.status == 'pending' )
	    {
		doi_content = 'DOI has been requested&nbsp;&nbsp;' +
		    "<button name='cancel_request' type='button'>Cancel request</button>";
	    }
	    
            else
	    {
		doi_content = "<button name='request' type='button'>Request a DOI for this data archive</button>";
            }

	    disableElement('dar_title', false);
	    disableElement('dar_authors', false);
	    disableElement('dar_public', false);
	}
	
	setInnerHTML('dar_doi', doi_content);
	
	setInnerHTML('dar_created', edit_record['dcr']);
	setInnerHTML('dar_modified', edit_record['dmd']);
    }

    function loadError ( xhr, textStatus, error )
    {
	setElementValue('dar_header', "Data Archive " + archive_id + ": " + textStatus);
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
	setInnerHTML('dar_created', '');
	setInnerHTML('dar_modified', '');
    }
    
    function doSave ( )
    {
	var params = { };
	var param_count = 0;
	
	for ( var field_name of editable_fields )
	{
	    var old_value = edit_record[field_name];
	    var new_value = getFormValue('dar_edit', field_name);

	    if ( old_value != new_value )
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
    }

    this.doDownload = doDownload;
    
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
