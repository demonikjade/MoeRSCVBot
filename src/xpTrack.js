const url = "https://www.runescapeclassic.org/hiscore/ranking/overall/";

function getWebsiteXp(){
  xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET",url,false);
  xmlhttp.send();
  // parser=new DOMParser();
  // return parser.parseFromString(xmlhttp.responseText,"text/html");  
  const html = new DOMParser().parseFromString(xmlhttp.responseText, "text/html");

  var tables = html.getElementsByTagName('table');
  for(var tableIt = 0; tableIt < tables.length; tableIt++) {
      var table = tables[tableIt];
      // if(table.className === 'statusbox_ok') {
      //     var columns = table.getElementsByTagName('td');
      //     for(columnIt = 0; columnIt < columns.length; columnIt++) {
      //         var column = columns[columnIt];
      //         console.log(column.innerHTML);
      //     }
      // }
  }
}



module.exports = {
  getWebsiteXp : getWebsiteXp,
}