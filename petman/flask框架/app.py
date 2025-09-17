import os
from flask import Flask, render_template
from pets import pets_bp
from customers_py import customers_bp
from appointments_py import appointments_bp

app = Flask(__name__,
    template_folder='templates',  # 如果不叫templates，需要指定
    static_folder='static'
    )
app.register_blueprint(pets_bp)
app.register_blueprint(customers_bp)
app.register_blueprint(appointments_bp)

print("静态文件目录:", app.static_folder)
print("静态文件存在:", os.path.exists(os.path.join(app.static_folder, 'css/styles.css')))
print("模板目录:", app.template_folder)

@app.route('/api')
def pets():
    return render_template('base.html')



if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# 其他路由...

