FROM python:3.12.12-alpine3.22

COPY . ./

RUN apk add --no-cache \
    build-base cairo-dev cairo cairo-tools \
    # pillow dependencies
    jpeg-dev zlib-dev freetype-dev lcms2-dev openjpeg-dev tiff-dev tk-dev tcl-dev

RUN pip install -r requirements.txt

CMD ["python3", "app.py"]
