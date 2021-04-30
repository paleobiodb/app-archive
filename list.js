$(document).ready(function(){
    var strhtml1 = '';
    var strhtml2 = '';
    $.ajax( {
      url: data_url + "archives/list.larkin?all_records",
      dataType: "json"
    })
    .done (function (data) {
      strhtml1 = "<table id='dtArchiveTable' class='table table-striped table-bordered table-sm'><thead><tr><th id='col1' class='th-sm'>Title</th>";
      strhtml1 += "<th id='col2' class='th-sm'>DOI</th><th id='col3' class='th-sm'>Authors</th><th id='col4' class='th-sm'>Link</th></tr></thead><tbody>";
      // console.log("----------------------------------strhtml1---------------------------------")
      // console.log(strhtml1)
      strhtml2 = strhtml1;
      // console.log("----------------------------------strhtml2---------------------------------")
      // console.log(strhtml2)
      for (var rec in data) {
        //Public Recordset
        console.log(data[rec]['is_public'])
        if (data[rec]['is_public'] == "1") {
          // console.log("Public");
          row = PublicPrivate(data, rec);
          strhtml1 += row;
        }
        if (data[rec]['is_public'] != "1") {
          // console.log("Private");
          // document.getElementById("PrivTab").className = "nav-link active"
          row = PublicPrivate(data, rec);
          strhtml2 += row;
          // console.log("----------------------------------strhtml2---------------------------------")
          // console.log(strhtml2)
        }
      }
      buildTablePublic(strhtml1);
      buildTablePrivate(strhtml2);
      $('#dtArchiveTable').DataTable();
      $('.dataTables_length').addClass('bs-select');
    });

    $( "#PrivTab" ).click(function(){
      $('#archiveListPublic').html(strhtml2);
      $('#dtArchiveTable').DataTable();
      $('.dataTables_length').addClass('bs-select');
    });
    $( "#PubTab" ).click(function(){
      $('#archiveListPublic').html(strhtml1);
      $('#dtArchiveTable').DataTable();
      $('.dataTables_length').addClass('bs-select');
      });
    // $( "#TabLink").mouseover(function(){console.log("Over")})
  });

// function ReplaceTable (TableType) {
//   console.log("Replace Table")
//   console.log(TableType)
//   if (TableType == "Private") {
//     $('#archiveListPublic').innerhtml(strhtml2);
//   }
//   if (TableType == "Public") {
//     $('#archiveListPublic').innerhtml(strhtml1);
//   }
// }

function searchArchives () {
    var searchTxt = document.getElementById("frmControlInput1").value;
    var searchTxtArr = searchTxt.split(',');
    doSearch(searchTxtArr);
}

function PublicPrivate(data, rec) {
        var item = buildRow(data, rec)
        return item
            // ORIGINAL CODE
            // $('#archiveList').append(item);
        // $('#archiveListPub').append(item);
}

function buildRow (data, rec) {
    var item;

        item = "<tr id='TabLink'>"
        item += "<td id='col1' class='th-sm'>" + data[rec]['title'] + "</td>";
        item += "<td id='col2' class='th-sm'>" + data[rec]['doi'] + "</td>";
        item += "<td id='col3' class='th-sm'>" + data[rec]['authors'] + "</td>";
        item += "<td id='col4' class='th-sm'><a onclick=CoordDetails('"
        // item += data[rec]['archive_no'] + "') onclick=NewTab('/classic/app/archive/view?id=";
        // No Onmouset
        item += data[rec]['archive_no'] + "')>";

        // with onmouseout
        // item += data[rec]['archive_no'] + "') onmouseout=CloseDetails('"
        // item += data[rec]['archive_no'] + "')>";

        // item += "<td id='col4' class='th-sm'><a onmouseover=DisplayDetails('"
        // item += data[rec]['archive_no'] + "') onclick=NewTab('/classic/app/archive/view?id=";
        // item += "<td id='col4' class='th-sm'><a href='/classic/app/archive/view?id=";
        // item += data[rec]['archive_no'] + "'>";
        item += "  View Details ";
        item += "</a></tr>";
        // console.log(item)

        return item

}

function NewTab (NewLink) {
  window.open(NewLink, "_blank")
}

function CoordDetails (archiveid) {
  // console.log("inside & " + archiveid);
  htmlstr = DisplayDetails(archiveid);
  // console.log("Back & " + htmlstr)
  // $('#archiveSelID').html(arrDwnld[0]);
  // var htmlitem = arrDwnld[0]
  // var linkstr = arrDwnld[1]
}

function DisplayDetails (archiveid) {
  // alert(archiveid);
  document.getElementById("myForm").style.display = "block";
  // document.getElementById("ArchNumber").innerHTML = archiveid;
  $.getJSON( data_url + "archives/single.larkin?id=" + archiveid, function (data) {
      if (data['archive_no'] == archiveid) {
        item = "<h3><b>";
        item += data['title'] + "</b></h3>";
        item += "<p><b>Description</b>: " + data['description'] + "</p>";
        item += "<p><b>Author</b>: " + data['authors'] + "</p>";
        item += "<p><b>DOI</b>: " + data['doi'] + "</p>";
        // item += "<p><b>Creator</b>: </p>"
        // item += "<p><b>Creation Date</b>: </p>" 
        item += "<p><b>API Query String</b>: " + data['uri_path'] + "?" + data['uri_args'] + "</p>";
        downloadpath = data['uri_path'] + "?" + data['uri_args'];
        item += "<p><b>PBDB Archive ID Number</b>: " + archiveid + "</p>";
        var OrigPath = "NewTab('/archives/retrieve/" + archiveid + "')";
        var UpdPath = "NewTab('" + data['uri_path'] + "?" + data['uri_args'] + "')";
        // console.log(item)
        $('#archiveSelID').html(item);
        $('#OrigArch').attr('onclick',OrigPath);
        $('#UpdateArch').attr('onclick',UpdPath);

        return item
    }
  })
}

function CloseDetails() {
  document.getElementById("myForm").style.display = "none";
}

function buildTablePublic (strhtml) {
    // console.log("--------------------------");
    // console.log("Build Public Table");
    strhtml += "</tbody></table>";
    strhtml1 = strhtml;
    // console.log("----------------------------------strhtml1---------------------------------");
    // console.log(strhtml1);
    $('#archiveListPublic').append(strhtml);
}
function buildTablePrivate (strhtml) {
    // console.log("--------------------------");
    // console.log("Build Private Table");
    strhtml += "</tbody></table>";
    strhtml2 = strhtml
    // console.log("----------------------------------strhtml2---------------------------------");
    // console.log(strhtml2);
    // $('#archiveListPrivate').append(strhtml);
}

//////////////////////////////////////////////////////////////////////////////////////////////////
