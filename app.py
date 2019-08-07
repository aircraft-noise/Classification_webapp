from flask import Flask
from flask import render_template
import csv
from flask import jsonify
app = Flask(__name__)

@app.route('/')
def index():
  return render_template('index.html')

@app.route('/tester')
def tester():
  return render_template('test.html')

@app.route("/example")
def example():
    latlonglist = []
    with open("waypoint_data.csv", encoding='utf-8-sig') as f_in:
        reader = csv.reader(f_in, delimiter=',', quotechar='"')
        data_list = list(reader)
        for line in range(1, len(data_list)):
            infolist = []
            infolist.append(data_list[line][1])
            infolist.append(data_list[line][12])
            infolist.append(data_list[line][13])
            latlonglist.append(infolist)

    return jsonify(latlonglist)

if __name__ == '__main__':
    app.run(debug=True,host='0.0.0.0', port=80)