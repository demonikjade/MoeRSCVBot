## Install instrtucions

python --version
 > Python 3.8.5

pip --version
 > pip 20.1.1 from 

python -m pip install requests

python -m pip install pymongo
python -m pip install dnspython


###  Outline

 * First, get all N pages (now 65)

 * Then foreach page:
   * get all 25 players into dicts
   * check each player if updated
     * if yes
       * replac_one with fresh stats
       * go into player, get skills and compare w skillFound, insert if changed
     * if no
       * update dt only