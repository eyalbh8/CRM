#!/bin/bash

# Usage: ./tunnel.sh [test]

KEY="server_keys/CRM-trade-server.pem"
USER="ec2-user"
BASTION="63.177.55.132"

if [ "$1" = "prod" ]; then
  echo "Opening tunnel to PRODUCTION database..."
  ssh -o IdentitiesOnly=yes -i "$KEY" -N -L 5441:crm-trade-instance-1.ctaewq200tk3.eu-central-1.rds.amazonaws.com:5432 "$USER@$BASTION"
else
  echo "Invalid argument"
  exit 1
fi
