# print("hello world")

import requests
import pymongo
from config import DB
import datetime

dt = datetime.datetime.now()

myclient = pymongo.MongoClient(DB)
# db = myclient.test
mydb = myclient["Hiscores"]

dblist = myclient.list_database_names()
if "Hiscores" in dblist:
  print("The database 'Hiscores' exists.")

collist = mydb.list_collection_names()
if "players" in collist:
  print("The collection 'players' exists.")

if "skillFound" in collist:
  print("The collection 'skillFound' exists.")

playersCol = mydb["players"]
skillFoundCol = mydb["skillFound"]


overall_url = "https://www.runescapeclassic.org/hiscore/ranking/overall/"

# per_page = 25
per_page = 2
req = requests.request('GET', overall_url)

# print(req.json());
# print("  ------------and------------  ");
# print(req.text);

full_text = req.text

page_links = full_text.split("<li><a class=\"text\" href=\"https://www.runescapeclassic.org/hiscore/ranking/overall/p")[3].split("/\">")

print(page_links[0])

# col1_raws = full_text.split("<td class=\"col1 ally-right\">")
# # col1_test = col1_raws[1]
# col1_test = col1_raws[1].split("</td>")[0]

# print(col1_test)




def extract_one_name(i=1):
    col_raws = [0] * 4
    col_raws[0] = full_text.split("<td class=\"col1 ally-right\">")
    col_raws[1] = full_text.split("<td class=\"col2 ally-left\">")
    col_raws[2] = full_text.split("<td class=\"col3 ally-right\">")
    col_raws[3] = full_text.split("<td class=\"col4 ally-right\">")
    # col1_test = col1_raws[1]
    ret_dict = {
        "link": col_raws[0][i].split("</td>")[0].split("<a href=\"")[1].split("\" class=")[0],
        "name": col_raws[1][i].split("</td>")[0].split(">")[1],
        "level": col_raws[2][i].split("</td>")[0].split(">")[1],
        "xp": col_raws[3][i].split("</td>")[0].split(">")[1],
        "dt": dt
    }

    return ret_dict


# <tr class="rowodd">
# <td class="col1 ally-right"><a href="https://www.runescapeclassic.org/hiscore/ranking?user=bank+greeter" class="text-primary">1</td>
# <td class="col2 ally-left"><a href="https://www.runescapeclassic.org/hiscore/ranking?user=bank+greeter">bank greeter</td>
# <td class="col3 ally-right"><a href="https://www.runescapeclassic.org/hiscore/ranking?user=bank+greeter" class="text-primary">1,448</td>
# <td class="col4 ally-right"><a href="https://www.runescapeclassic.org/hiscore/ranking?user=bank+greeter" class="text-primary">83,467,879</td>
# </tr>





# print( extract_one_name(1) )

for x in range(1,per_page+1):
    ret_dict = extract_one_name(x)
    # playersCol.insert_one(ret_dict)
    playersCol.replace_one({'name':ret_dict['name']}, ret_dict,True)
    print( ret_dict )






# ########################   insert one

# mydict = { "name": "Peter", "address": "Lowstreet 27" }

# x = mycol.insert_one(mydict)

# print(x.inserted_id)



# ######################    insert many

# ol = mydb["customers"]

# mylist = [
#   { "name": "Amy", "address": "Apple st 652"},
#   { "name": "Hannah", "address": "Mountain 21"},
#   { "name": "Michael", "address": "Valley 345"},
#   { "name": "Sandy", "address": "Ocean blvd 2"},
#   { "name": "Betty", "address": "Green Grass 1"},
#   { "name": "Richard", "address": "Sky st 331"},
#   { "name": "Susan", "address": "One way 98"},
#   { "name": "Vicky", "address": "Yellow Garden 2"},
#   { "name": "Ben", "address": "Park Lane 38"},
#   { "name": "William", "address": "Central st 954"},
#   { "name": "Chuck", "address": "Main Road 989"},
#   { "name": "Viola", "address": "Sideway 1633"}
# ]

# x = mycol.insert_many(mylist)

# #print list of the _id values of the inserted documents:
# print(x.inserted_ids)






