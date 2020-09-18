# print("hello world")

import requests
import pymongo
from config import DB
import datetime
import time


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

full_player_list = []

# headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36'}
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0'}

base_url = "https://www.runescapeclassic.org/hiscore/ranking/overall/"
# player_url = "https://www.runescapeclassic.org/hiscore/ranking?user="

# overall_url = "https://www.runescapeclassic.org/hiscore/ranking/overall/"

per_page = 25
# per_page = 3
override_pages = 0
# req = requests.request('GET', overall_url)

# print(req.json());
# print("  ------------and------------  ");
# print(req.text);

# full_text = req.text

# page_links = full_text.split("<li><a class=\"text\" href=\"https://www.runescapeclassic.org/hiscore/ranking/overall/p")[3].split("/\">")

# print(page_links[0])

# col1_raws = full_text.split("<td class=\"col1 ally-right\">")
# # col1_test = col1_raws[1]
# col1_test = col1_raws[1].split("</td>")[0]

# print(col1_test)

skills_to_DB_list = []
update_many_player_list = []
insert_new_player_list = []

def extract_one_name(full_text, i=1):
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

# <tr class="rowodd">
# <tr class="roweven">
# >>> nStr = '000123000123'
# >>> nStr.count('123')
# 2


# print( extract_one_name(1) )




def get_total_num_pages(url):
    # req = requests.request('GET', url, headers=headers)
    req = requests.request('GET', url, headers=headers)
    full_text = req.text
    page_links = full_text.split("<li><a class=\"text\" href=\"https://www.runescapeclassic.org/hiscore/ranking/overall/p")[3].split("/\">")
    num_pages = page_links[0]
    # print(num_pages)
    # return num_pages
    if override_pages > 0:
        return str(override_pages)
    else:
        return num_pages


def parse_one_page(url):
    req = requests.request('GET', url, headers=headers)
    full_text = req.text
    rowodd = full_text.count('<tr class="rowodd">')
    roweven = full_text.count('<tr class="roweven">')
    total_rows = rowodd + roweven
    for x in range(1,total_rows+1):
        ret_dict = extract_one_name(full_text, x)
        # playersCol.insert_one(ret_dict)
        # playersCol.replace_one({'name':ret_dict['name']}, ret_dict,True)
        # print( ret_dict )
        full_player_list.append(ret_dict)

def process_skills(player):
    # skills_player.append(player)
    agg = [
        { '$match': {'name': player['name']} },
        { "$sort": { "stat": 1, "dt": 1 } },
        { "$group":{"_id": "$stat","stats": { "$last": "$$ROOT" }} }
    ]
    player_DB_stats = list(skillFoundCol.aggregate(agg))

    req = requests.request('GET', player['link'], headers=headers)
    full_text = req.text
    rowodd = full_text.count('<tr class="rowodd">')
    roweven = full_text.count('<tr class="roweven">')
    total_rows = rowodd + roweven
    start_text = '<td class="ally-left"><a href="https://www.runescapeclassic.org/hiscore/ranking/'
    end_text = '/">'
    end_num_text ='</td>'
    col_raws = full_text.split(start_text)
    skills_list = []
    for i in range(2,total_rows+1):
        skills_dict = {}
        adj = i * 3 - 1
        # print("col_raws:"+str(adj))
        stat_text_raw = col_raws[adj]
        # print(stat_text_raw)
        stat_name = stat_text_raw.split(end_text)[0]
        stat_xp = int(stat_text_raw.split(end_text)[1].split(end_num_text)[0].replace(",", ""))
        # print("name: "+stat_name+", val: "+str(stat_xp))
        skills_dict['name'] = player['name']
        skills_dict['stat'] = stat_name
        skills_dict['xp'] = stat_xp
        skills_dict['dt'] = dt
        skills_list.append(skills_dict)

        skill_compare_DB = 0
        for j in range(0,len(player_DB_stats)):
            temp = player_DB_stats[j]
            # print(temp)
            # print(temp)
            # print(temp['stats'].keys())
            # print(temp['stats']['_id'])
            # print(temp['stats']['name'])
            # print(temp['stats']['stat'])
            # print(temp['stats']['xp'])
            # print(temp['stats']['dt'])
            # print("Comparing name for "+temp['stats']['stat']+" ?= "+str(stat_name))
            if(stat_name == temp['stats']['stat']):
                skill_compare_DB = temp['stats']
                # print("Comparing xp for "+temp['stats']['stat']+": "+str(skill_compare_DB['xp'])+" ?= "+str(stat_xp))
                break

        if skill_compare_DB != 0 and skill_compare_DB['xp'] == stat_xp:
            ## do nothing
            continue
        else:
            ## they not same or not exist
            skills_to_DB_list.append(skills_dict)


    # print(len(player_DB_stats))
    # print(skills_list)
    # print("len(player_DB_stats) is: "+str(len(player_DB_stats)))












def main():
    start_time = time.time()
    print("Start Time: "+str(start_time))
    total_num_pages = get_total_num_pages(base_url)
    print("Total pages found: "+total_num_pages+", expects max entries of: "+str( int(total_num_pages) * per_page ) )
    for x in range(1,int(total_num_pages)+1):
        parse_one_page(base_url+str(x))

    
    # display_index = 41
    total_entries = len(full_player_list)
    # print("Saved "+str(total_entries)+" entries. Here's index "+str(display_index)+": ")
    # print(full_player_list[display_index])
    # print("Here's last index "+str(total_entries)+": ")
    # print(full_player_list[total_entries-1])

    print("--- Overalls Done: \t\t\t%.2s seconds ---" % (time.time() - start_time))

    # process_skills(full_player_list[display_index])
    # return 1

    # ## get all players from DB
    all_DB_players = list(playersCol.find())

    print("--- Has All DB Players Done: \t\t%.2s seconds ---" % (time.time() - start_time))

    # ## foreach players and check:
    for i in range(0,int(total_entries)):
        player = full_player_list[i]
        wasFound = False
        if i == int(int(total_entries)/2) :
            print("--- Player Detail Halfway Done: \t%.2s seconds ---" % (time.time() - start_time))

        for j in range(0,len(all_DB_players)):
            dbPlayer = all_DB_players[j]
            
            if player['name'] == dbPlayer['name']:
                wasFound = True
                ## no matter what, update dt
                update_many_player_list.append(player["name"])
                if player['xp'] != dbPlayer['xp']:
                    ## if XP diff,  process all skills skills_players[]
                    process_skills(player)
                ## if XP same, do nothing else
                break  ## cuz we done w j now

        if wasFound == False:
            insert_new_player_list.append(player)
            process_skills(player)

            

            

            


    ## foreach all to-be-skills-processed skills_players[]

        ## goto players link , get all skills onto temp list

        ## get (newest) players skills data from DB , if any

        ## insert any diffs with new timestamp , insert_skills_many[]


    ## run update_many[] , insert_new[] , insert_skills_many[] , skills_players[]
    print("Found len skills_to_DB_list: "+str(len(skills_to_DB_list)))

    print("Found len insert_new_player_list: "+str(len(insert_new_player_list)))

    print("Found len update_many_player_list: "+str(len(update_many_player_list)))

    if len(skills_to_DB_list) > 0:
        skillFoundCol.insert_many(skills_to_DB_list)

    
    if len(insert_new_player_list) > 0:
        playersCol.insert_many(insert_new_player_list)
    # playersCol.update_many(update_many_player_list)
    # db.collection.find( { _id : { $in : [1,2,3,4] } } );
    # db.collection.find( { _id : { $in : [1,2,3,4] } } );
    # try {
    # playersCol.update_many({"name": {"$in": update_many_player_list}},{ $set: { "dt" : dt } });
    # } catch (e) {
    #    print(e);
    # }
    
    if len(update_many_player_list) > 0:
        myquery = { "name": {"$in": update_many_player_list} }
        newvalues = { "$set": { "dt": dt } }
        x = playersCol.update_many(myquery, newvalues)



    ## last line of main
    print("--- DONE: \t\t\t\t%.2s seconds ---" % (time.time() - start_time))
    

if __name__ == "__main__":
    main()




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


##############################

# The restaurant collection contains the following documents:

# { "_id" : 1, "name" : "Central Perk Cafe", "violations" : 3 }
# { "_id" : 2, "name" : "Rock A Feller Bar and Grill", "violations" : 2 }
# { "_id" : 3, "name" : "Empire State Sub", "violations" : 5 }
# { "_id" : 4, "name" : "Pizza Rat's Pizzaria", "violations" : 8 }
# The following operation updates all documents where violations are greater than 4 and $set a flag for review:

# try {
#    db.restaurant.updateMany(
#       { violations: { $gt: 4 } },
#       { $set: { "Review" : true } }
#    );
# } catch (e) {
#    print(e);
# }



