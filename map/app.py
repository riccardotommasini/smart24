from flask import Flask, render_template, request
import pandas as pd
import plotly.express as px
import ssl

# 忽略 SSL 证书验证
ssl._create_default_https_context = ssl._create_unverified_context

app = Flask(__name__)


# 下载数据文件并保存在本地
filepath = "https://raw.githubusercontent.com/plotly/datasets/master/volcano_db.csv"
local_filepath = "volcano_db.csv"
pd.read_csv(filepath, encoding="latin").to_csv(local_filepath, index=False)

# 从本地文件中读取数据
df = pd.read_csv(local_filepath, encoding="latin")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/update", methods=["POST"])
def update():
    meter = request.form["meter"]
    feet = request.form["feet"]

    if meter:
        feet = round(float(meter) * 3.28084, 0)
    else:
        meter = round(float(feet) / 3.28084, 1)

    fig = px.scatter_geo(
        data_frame=df.loc[df["Elev"] >= float(meter)],
        lat="Latitude",
        lon="Longitude",
        size="Elev",
        hover_name="Volcano Name",
        projection="natural earth",
    )

    graphJSON = fig.to_json()
    return {"meter": meter, "feet": feet, "graph": graphJSON}

if __name__ == "__main__":
    app.run(debug=True)
