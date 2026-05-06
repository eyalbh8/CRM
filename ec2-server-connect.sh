KEY="server_keys/CRM-trade-server.pem"
USER="ec2-user"
BASTION="63.177.55.132"
ssh -o IdentitiesOnly=yes -i "$KEY" "$USER@$BASTION"