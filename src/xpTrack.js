var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var DOMParser = require('dom-parser');

const url = "https://www.runescapeclassic.org/hiscore/ranking/overall/";
var doOnce=true;

function getWebsiteXp(){
  var retval = "derp";
  xmlhttp=new XMLHttpRequest();
  xmlhttp.open("GET",url,false);
  xmlhttp.send();
  // parser=new DOMParser();
  // return parser.parseFromString(xmlhttp.responseText,"text/html");  
  const html = new DOMParser().parseFromString(xmlhttp.responseText, "text/html");

  // var tables = html.getElementsByTagName('table');
  // console.log("JG_DEBUG: "+html+" and "+tables+" , "+tables.length);
  // for(var tableIt = 0; tableIt < tables.length; tableIt++) {
  //   var table = tables[tableIt];
  //   console.log("JG_DEBUG: table: "+table.getAttribute("class")+" , "+table);
  //   // if(table.class === 'hiscore_table') {
  //   if(true) {
  //     retval += "\ntable: ";
  //     var rows = table.getElementsByTagName('tr');
  //     console.log("JG_DEBUG: rows: "+rows.length);

  //     // var columns = table.getElementsByTagName('td');
  //     // for(columnIt = 0; columnIt < columns.length; columnIt++) {
  //     //     var column = columns[columnIt];
  //     //     console.log(column.innerHTML);
  //     // }
  //     var i, j;
  //     var len = 3;
  //     // if(rows.length < len){len=rows.length;}
  //     for(i = 0; i < len; i++) {
  //       var row = rows[i];
  //       // if(doOnce){
  //       //   doOnce = false;
  //         console.log("JG_DEBUG: row: "+row.getAttribute("class")
  //                     +", nodes: "+ row.childNodes.length
  //                     +", innerHTML: "+ row.innerHTML.length);
  //       //   retval += "\n" + row.innerHTML;
  //       // }
  //       // console.log("JG_DEBUG: "+row.innerHTML);
  //       // retval += "\n" + row.innerHTML;
  //       // var cols = row.getElementsByTagName('td');
  //       //   console.log("JG_DEBUG: cols: "+cols.length);

  //       // for(j = 0; j < cols.length && j < 10; j++) {
  //       //   var col = cols[j];
  //       //   console.log("JG_DEBUG: col: "+col.getAttribute("class"));
  //       // }

  //         // console.log("JG_DEBUG: row.childNodes: "+ row.childNodes.length);
  //         for(j = 0; j < row.childNodes.length && j < 10; j++) {
  //           var child = row.childNodes[j];
  //           console.log("JG_DEBUG: child: "+child.getAttribute("class"));
  //         }
  //         // if(cols&&cols.length>0&&cols[0]){console.log("JG_DEBUG: cols[0]: "+cols[0].innerHTML);}

  //       // var rank, player, level, xp;
  //       // if(cols[0]){rank=cols[0].innerHTML;}
  //       // if(cols[1]){player=cols[1].innerHTML;}
  //       // if(cols[2]){level=cols[2].innerHTML;}
  //       // if(cols[3]){xp=cols[3].innerHTML;}
  //       // var thisRow = "\nrank: "+rank+",player: "+player+",level: "+level+",xp: "+xp;
  //       // retval += thisRow;
  //       // console.log("JG_DEBUG: "+thisRow);

  //     }
  //   }
  // }

  return retval;
}



module.exports = {
  getWebsiteXp : getWebsiteXp,
}