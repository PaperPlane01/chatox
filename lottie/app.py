import json
from flask import Flask, request, jsonify, send_file, after_this_request
from lottie.exporters.tgs_validator import TgsValidator, Severity
from lottie.importers.core import import_tgs, import_lottie
from lottie.exporters.core import export_tgs, export_lottie
from lottie.exporters.cairo import export_png
from werkzeug.utils import secure_filename
from dotenv import load_dotenv
import zipfile
import py_eureka_client.eureka_client as eureka_client
import os

load_dotenv()

app = Flask(__name__)
app.config.from_prefixed_env()
os.makedirs(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], exist_ok=True)
os.makedirs(os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], 'uncompressed'), exist_ok=True)


@app.post('/api/v1/lottie/validation')
def validate_lottie_sticker():
    file = request.files['file']
    file_name = secure_filename(file.filename)
    file_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], file_name)
    file.save(file_path)

    validator = TgsValidator(Severity.Error)
    validator.check_file(file_path)
    os.remove(file_path)

    if validator.errors:
        return jsonify(ok=False, errors=list(map(lambda error: error.message, validator.errors))), 400
    else:
        return jsonify(ok=True), 200


@app.post("/api/v1/lottie/conversion/dot-lottie-to-tgs")
def convert_dot_lottie_to_tgs():
    file = request.files['file']
    file_name = secure_filename(file.filename)
    file_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], file_name)
    file.save(file_path)

    zip_archive = zipfile.ZipFile(file_path)
    json_file = zip_archive.open(os.path.join('animations', 'main.json'))
    json_content = json_file.read()
    uncompressed_json_file = file_name.replace('.lottie', '.json')
    uncompressed_json_file_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], uncompressed_json_file)
    json_file = open(uncompressed_json_file_path, "w")
    json_file.write(json_content.decode('utf-8'))
    json_file.close()

    animation = import_lottie(uncompressed_json_file_path)
    output_file = file_name.replace(".lottie", ".tgs")
    output_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], output_file)

    export_tgs(animation, output_path)

    os.remove(file_path)
    os.remove(uncompressed_json_file_path)

    @after_this_request
    def remove_file(response):
        os.remove(output_path)
        return response

    return send_file(path_or_file=output_path, mimetype="application/gzip", as_attachment=True)


@app.post('/api/v1/lottie/conversion/json-to-tgs')
def convert_json_to_tgs():
    file = request.files['file']
    file_name = secure_filename(file.filename)
    file_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], file_name)
    file.save(file_path)

    animation = import_lottie(file_path)
    output_file = file_name.replace(".json", ".tgs")
    output_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], output_file)

    export_tgs(animation, output_path)

    os.remove(file_path)

    @after_this_request
    def remove_file(response):
        os.remove(output_path)
        return response

    return send_file(path_or_file=output_path, mimetype="application/gzip", as_attachment=True)


@app.post("/api/v1/lottie/conversion/tgs-to-png")
def convert_tgs_to_png():
    file = request.files['file']
    file_name = secure_filename(file.filename)
    file_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], file_name)
    file.save(file_path)

    animation = import_tgs(file_path)
    output_file = file_name.replace(".tgs", ".png")
    output_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], output_file)

    export_png(animation, output_path)

    os.remove(file_path)

    @after_this_request
    def remove_file(response):
        os.remove(output_path)
        return response

    return send_file(path_or_file=output_path, mimetype="image/png", as_attachment=True)


@app.post("/api/v1/lottie/conversion/tgs-to-dot-lottie")
def convert_tgs_to_dot_lottie():
    file = request.files['file']
    file_name = secure_filename(file.filename)
    file_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], file_name)
    file.save(file_path)

    animation = import_lottie(file_path)
    output_file = file_name.replace(".tgs", ".lottie")
    uncompressed_json_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], 'uncompressed', output_file)
    export_lottie(animation, uncompressed_json_path)

    output_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], output_file)
    manifest_path = os.path.join(app.config['LOTTIE_SERVICE_FILES_DIRECTORY'], output_file + '.manifest')
    manifest = {
        "version": "1.0.0",
        "author": "python-lottie",
        "generator": "python-lottie",
        "animations": [
            {
                "id": "main"
            }
        ]
    }

    with open(manifest_path, "w") as manifest_file:
        json.dump(manifest, manifest_file)

    with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as output:
        output.write(filename=uncompressed_json_path, arcname=os.path.join('animations', 'main.json'))
        output.write(filename=manifest_path, arcname="manifest.json")

    @after_this_request
    def remove_file(response):
        os.remove(uncompressed_json_path)
        os.remove(output_path)
        os.remove(manifest_path)
        return response

    return send_file(path_or_file=output_path, mimetype="application/dotlottie+zip", as_attachment=True)


if __name__ == '__main__':
    eureka_client.init(
        eureka_server=app.config['LOTTIE_SERVICE_EUREKA_HOST'],
        app_name=app.config['LOTTIE_SERVICE_EUREKA_APP_NAME'],
        instance_host=app.config['LOTTIE_SERVICE_HOST'],
        instance_port=int(app.config['LOTTIE_SERVICE_PORT'])
    )
    app.run(host="0.0.0.0", port=int(app.config['LOTTIE_SERVICE_PORT']))
