import json
import csv

routes = {}
ALL_ROUTE_IDS = {}


# ------------------------------------------------------------------------------------
# This helper function groups the routes by their route names
# ------------------------------------------------------------------------------------
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


# ------------------------------------------------------------------------------------
# This function initialises the csv file of the waypoint condition sets and makes
# data structures of the routes and their waypoints
# ------------------------------------------------------------------------------------
def condition_maker():
    global routes
    global ALL_ROUTE_IDS
    routelist = []
    with open("waypoint_data.csv", encoding='utf-8-sig') as f_in:
        reader = csv.reader(f_in, delimiter=',', quotechar='"')
        data_list = list(reader)
        for line in range(1, len(data_list)):
            dict = {}
            count = 0
            for each in data_list[line]:
                dict[data_list[0][count]] = each
                count += 1
            routelist.append(dict)
            ALL_ROUTE_IDS[str(data_list[line][0])] = []
        routes = group_by('Route Name', routelist)
        print(routes)
        print(ALL_ROUTE_IDS)


condition_maker()