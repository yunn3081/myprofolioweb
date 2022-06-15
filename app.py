from flask import Flask, request, render_template
import joblib
import numpy as np
# app = Flask(__name__)

model_pretrained = joblib.load('static/database/LoanOrNot-LR-20220502.pkl')

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
    return render_template('index.html')

@app.route("/submit", methods=['POST'])
def submit():
    if request.method == 'POST':
        form_data = request.form

        Credit_History_Yes = ''
        Credit_History_No = ''
        if int(form_data['Credit_History']) == 1:
            Credit_History_Yes = 'checked'
        else:
            Credit_History_No = 'checked'

        Gender_Male = ''
        Gender_Female = ''
        if int(form_data['Gender'])== 1:
            Gender_Male = 'checked'
        else:
            Gender_Female = 'checked'

        Married_Yes = ''
        Married_No = ''
        if int(form_data['Married']) == 1:
            Married_Yes = 'checked'
        else:
            Married_No = 'checked'

        Education_Graduate = ''
        Education_NotGraduate = ''
        if int(form_data['Education']) == 0:
            Education_Graduate = 'checked'
        else:
            Education_NotGraduate = 'checked'

        Dependents_0 = ''
        Dependents_1 = ''
        Dependents_2 = ''
        Dependents_3Plus = ''
        if int(form_data['Dependents']) == 0:
            Dependents_0 = 'selected'
        elif int(form_data['Dependents']) == 1:
            Dependents_1 = 'selected'
        elif int(form_data['Dependents']) == 2:
            Dependents_2 = 'selected'
        else:
            Dependents_3Plus = 'selected'

        Self_Employed_No = ''
        Self_Employed_Yes = ''
        if int(form_data['Self_Employed']) == 0:
            Self_Employed_No = 'checked'
        else:
            Self_Employed_Yes = 'checked'

        Property_Area_Rural = ''
        Property_Area_Semiurban = ''
        Property_Area_Urban = ''
        if int(form_data['Property_Area']) == 0:
            Property_Area_Rural = 'selected'
        elif int(form_data['Property_Area']) == 1:
            Property_Area_Semiurban = 'selected'
        else:
            Property_Area_Urban = 'selected'

        result = model_pretrained.predict([[int(form_data['Credit_History']),int(form_data['Gender']),int(form_data['Married']),int(form_data['Education']),int(form_data['Dependents']),int(form_data['Self_Employed']),int(form_data['Property_Area']),np.log(int(form_data['LoanAmount'])),np.log(int(form_data['TotalIncome']))]])
        result_proba = model_pretrained.predict_proba([[int(form_data['Credit_History']),int(form_data['Gender']),int(form_data['Married']),int(form_data['Education']),int(form_data['Dependents']),int(form_data['Self_Employed']),int(form_data['Property_Area']),np.log(int(form_data['LoanAmount'])),np.log(int(form_data['TotalIncome']))]])
        print(f'Result:{result}')
        print(f'Result_Proba:{result_proba}')
        if result[0] == 1:
            prediction = f'核可(Y) - 系統信心 {result_proba[0][1]:.10f}'
            color = "green"
        else:
            prediction = f'拒絕(N) - 系統信心 {result_proba[0][0]:.10f}'
            color = "red"

        return render_template('loan.html', Credit_History_Yes = Credit_History_Yes, Credit_History_No = Credit_History_No, 
                                Gender_Male = Gender_Male, Gender_Female = Gender_Female, Married_Yes = Married_Yes, Married_No = Married_No, 
                                Education_Graduate = Education_Graduate, Education_NotGraduate = Education_NotGraduate, Dependents_0 = Dependents_0,
                                Dependents_1 = Dependents_1,Dependents_2 = Dependents_2,Dependents_3Plus = Dependents_3Plus,
                                Self_Employed_No = Self_Employed_No,Self_Employed_Yes = Self_Employed_Yes,Property_Area_Rural = Property_Area_Rural,
                                Property_Area_Semiurban = Property_Area_Semiurban,Property_Area_Urban = Property_Area_Urban,
                                LoanAmount = form_data['LoanAmount'],TotalIncome = form_data['TotalIncome'],prediction = prediction, color=color)

@app.route('/eat/')
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

@app.route('/loan')
def loan():
    return render_template('loan.html')


if __name__=="__main__":
    app.run()