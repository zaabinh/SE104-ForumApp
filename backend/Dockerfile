FROM python:3.13-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8000 \
    ODBCSYSINI=/etc

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        gnupg \
        ca-certificates \
        unixodbc \
        unixodbc-dev \
    && curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl -fsSL https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql17 \
    && DRIVER_LIB="$(find /opt/microsoft/msodbcsql17/lib64 -name 'libmsodbcsql-*.so.*' | sort -V | tail -n 1)" \
    && test -n "$DRIVER_LIB" \
    && printf "[ODBC Driver 17 for SQL Server]\nDescription=Microsoft ODBC Driver 17 for SQL Server\nDriver=%s\nUsageCount=1\n" "$DRIVER_LIB" > /etc/odbcinst.ini \
    && cat /etc/odbcinst.ini \
    && find /opt/microsoft/msodbcsql17/lib64 -name 'libmsodbcsql-*.so.*' \
    && odbcinst -q -d -n "ODBC Driver 17 for SQL Server" \
    && test -f "$DRIVER_LIB" \
    && apt-get purge -y --auto-remove curl gnupg \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip \
    && pip install -r requirements.txt

COPY . .

RUN adduser --disabled-password --gecos "" appuser \
    && chown -R appuser:appuser /app

USER appuser

EXPOSE 10000

CMD ["python", "render_start.py"]
