from flask import Flask, render_template
# app = Flask(__name__)

class CustomFlask(Flask):
    jinja_options = Flask.jinja_options.copy()
    jinja_options.update(dict(
        block_start_string='(%',
        block_end_string='%)',
        variable_start_string='((',
        variable_end_string='))',
        comment_start_string='(#',
        comment_end_string='#)',
    ))

app = CustomFlask(__name__)

@app.route("/")
def home():
    # return "Hello Flasksss"
    return render_template('index.html')

@app.route('/eat')
def eat():
    return render_template('eat.html') 

@app.route('/schedule')
def schedule():
    return render_template('schedule.html')

@app.route('/mindquiz')
def mindquiz():
    return render_template('mindquiz.html')

@app.route('/rpg')
def rpg():
    return render_template('rpg.html')

@app.route('/youtube')
def youtube():
    return render_template('youtube.html')

@app.route('/barchart')
def barchart():
    return render_template('barchart.html')

@app.route('/galaxytours')
def galaxytours():
    return render_template('galaxytours.html')

@app.route('/salary')
def salary():
    return render_template('salary.html')


if __name__=="__main__":
    app.run()