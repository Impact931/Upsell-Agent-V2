#!/bin/bash

# Secure Database Backup Script for Upsell Agent
# This script creates encrypted backups of the PostgreSQL database

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-db}"
DB_NAME="${POSTGRES_DB:-upsell_agent_prod}"
DB_USER="${POSTGRES_USER:-postgres}"
BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${DB_NAME}_${DATE}.sql"
ENCRYPTED_FILE="${BACKUP_FILE}.gpg"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >&2
}

# Cleanup function
cleanup() {
    local exit_code=$?
    if [[ -f "${BACKUP_DIR}/${BACKUP_FILE}" ]]; then
        rm -f "${BACKUP_DIR}/${BACKUP_FILE}"
    fi
    exit $exit_code
}

trap cleanup EXIT

# Create backup directory
mkdir -p "${BACKUP_DIR}"

log "Starting backup of database: ${DB_NAME}"

# Create database dump
if ! pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" \
    --verbose --clean --no-owner --no-privileges \
    --format=custom > "${BACKUP_DIR}/${BACKUP_FILE}"; then
    log "ERROR: Database dump failed"
    exit 1
fi

log "Database dump completed: ${BACKUP_FILE}"

# Encrypt the backup (if GPG key is available)
if [[ -n "${BACKUP_GPG_RECIPIENT:-}" ]]; then
    if ! gpg --trust-model always --encrypt \
        --recipient "${BACKUP_GPG_RECIPIENT}" \
        --output "${BACKUP_DIR}/${ENCRYPTED_FILE}" \
        "${BACKUP_DIR}/${BACKUP_FILE}"; then
        log "ERROR: Backup encryption failed"
        exit 1
    fi
    
    # Remove unencrypted file
    rm -f "${BACKUP_DIR}/${BACKUP_FILE}"
    log "Backup encrypted: ${ENCRYPTED_FILE}"
else
    log "WARNING: No GPG recipient configured, backup is not encrypted"
    mv "${BACKUP_DIR}/${BACKUP_FILE}" "${BACKUP_DIR}/${ENCRYPTED_FILE}"
fi

# Set secure permissions
chmod 600 "${BACKUP_DIR}/${ENCRYPTED_FILE}"

# Cleanup old backups
log "Cleaning up backups older than ${RETENTION_DAYS} days"
find "${BACKUP_DIR}" -name "backup_${DB_NAME}_*.sql*" -type f -mtime +${RETENTION_DAYS} -delete

# Verify backup integrity
if [[ -f "${BACKUP_DIR}/${ENCRYPTED_FILE}" ]]; then
    BACKUP_SIZE=$(stat -f%z "${BACKUP_DIR}/${ENCRYPTED_FILE}" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${ENCRYPTED_FILE}" 2>/dev/null || echo "unknown")
    log "Backup completed successfully: ${ENCRYPTED_FILE} (${BACKUP_SIZE} bytes)"
else
    log "ERROR: Backup file not found after creation"
    exit 1
fi

# Send notification (if webhook is configured)
if [[ -n "${BACKUP_WEBHOOK_URL:-}" ]]; then
    curl -X POST "${BACKUP_WEBHOOK_URL}" \
        -H "Content-Type: application/json" \
        -d "{\"message\": \"Database backup completed: ${ENCRYPTED_FILE}\", \"size\": \"${BACKUP_SIZE}\"}" \
        || log "WARNING: Failed to send backup notification"
fi

log "Backup process completed successfully"