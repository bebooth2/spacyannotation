from flask import Flask, request
from flask_cors import CORS
import json
import os
import datetime
import sys
import pandas as pd


## Data passed to this program in the command line must be either a csv file
## with only one column or json file with one key field. In each row or key there
## should be one record to annonate. 
## Annotated records will be saved to a jsonl file that will have each record, annotated span and entities 
## as a line in the jsonl file. Spacy 
# with open('data.json', 'w') as f:
#     json.dump(lst,f)

# # read the file
# with open('data.json') as f:
#    lst1 = [tuple(x) for x in json.load(f)]
#    print(f'lst1: {lst1}')

x = datetime.datetime.now()

app = Flask(__name__)
CORS(app)
print(sys.argv[1])
file = sys.argv[1]
listObj = []
count = -1

if ".csv" in file:
    df = pd.read_csv(file)
    new_file = file.replace(".csv", "_annotated.json")
elif ".json" in file:
    df = pd.read_json(file)
    new_file = file.replace(".json", "_annotated.json")


@app.route('/data')
def get_data():
    global count
    count +=1
    percent_done = str(int((count/df.shape[0])*100))
    if count >= df.shape[0]:
        return{
            'total_records': str(df.shape[0]),
            'current_record': str(count),
            'percent_done' : percent_done,
            'text': "NO MORE RECORDS PLEASE EXPORT"
        }
    else:
        return {
            'current_record': str(count),
            'total_records': str(df.shape[0]),
            'percent_done' : percent_done,
            'text':df.iloc[count][0].lstrip()
            }

@app.route("/annotate", methods = ["POST"])
def annotated():
    print(request)
    
    data = request.json["line"]
    data = eval(data) 
    listObj.append(data[0])
    return {
        'data':"good"
    }
    
@app.route("/save_export")
def save_export():
    print("in save ina export")
    with open(new_file, 'w') as f:
        json.dump(listObj,f)
    return{
        "data":'good'
    }


if __name__ == "__main__":
    app.run(debug=True)
