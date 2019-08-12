from flask import Flask
from flask import render_template
import csv
from flask import jsonify
app = Flask(__name__)

routes = {}
ALL_ROUTE_IDS = {}
HEADER = []


@app.route('/')
def index():
  return render_template('index.html')


@app.route('/header')
def header():
    with open("waypoint_data.csv", encoding='utf-8-sig') as f_in:
        reader = csv.reader(f_in, delimiter=',', quotechar='"')
        data_list = list(reader)[0]
        listlist = data_list[::-1]
        return jsonify(listlist)


@app.route("/waypoints")
def waypoints():
    global routes
    global ALL_ROUTE_IDS
    global HEADER
    routelist = []
    with open("waypoint_data.csv", encoding='utf-8-sig') as f_in:
        reader = csv.reader(f_in, delimiter=',', quotechar='"')
        data_list = list(reader)
        HEADER = data_list[0]
        for line in range(1, len(data_list)):
            dict = {}
            count = 0
            for each in data_list[line]:
                dict[data_list[0][count]] = each
                count += 1
            routelist.append(dict)
            ALL_ROUTE_IDS[str(data_list[line][0])] = []
        routes = group_by('Route Name', routelist)

    return jsonify(routes)



def group_by(select_key, list_of_dicts):
    result_dict = {}
    if callable(select_key):
        key_fn = select_key
    else:
        key_fn = lambda d: d.get(select_key)
    for this_dict in list_of_dicts:
        this_key = key_fn( this_dict )
        value_this_key = result_dict.get(this_key, list())
        value_this_key.append(this_dict)
        result_dict[this_key] = value_this_key
    return result_dict


if __name__ == '__main__':
    app.run(debug=True)
