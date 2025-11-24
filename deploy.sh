#!/bin/bash

# Configuration
VM_IP="20.224.45.128"
VM_USER="tolkie-hackathon"
VM_PASS="Hackathon1!111"
REMOTE_DIR="/home/$VM_USER/app"

# Check for sshpass
if ! command -v sshpass &> /dev/null; then
    echo "sshpass is not installed. Installing via brew..."
    brew install sshpass
fi

echo "Deploying to $VM_USER@$VM_IP..."

# 1. Prepare files
echo "Zipping files..."
rm -f deploy.zip
zip -r deploy.zip server prompt .env

# 2. Copy files to VM
echo "Copying files to VM..."
sshpass -p "$VM_PASS" scp -o StrictHostKeyChecking=no deploy.zip $VM_USER@$VM_IP:/home/$VM_USER/

# 3. Execute remote commands
echo "Executing remote setup..."
sshpass -p "$VM_PASS" ssh -o StrictHostKeyChecking=no $VM_USER@$VM_IP << EOF
    # Update and install dependencies
    echo "$VM_PASS" | sudo -S apt-get update
    echo "$VM_PASS" | sudo -S apt-get install -y python3-pip python3-venv unzip

    # Setup application directory
    mkdir -p $REMOTE_DIR
    mv ~/deploy.zip $REMOTE_DIR/
    cd $REMOTE_DIR
    unzip -o deploy.zip
    rm deploy.zip

    # Setup Python environment
    python3 -m venv venv
    source venv/bin/activate
    pip install -r server/requirements.txt

    # Kill existing process on port 80 (if any)
    echo "$VM_PASS" | sudo -S fuser -k 80/tcp || true

    # Run server on port 80
    # Using nohup to keep it running after disconnect
    echo "Starting server..."
    echo "$VM_PASS" | sudo -S nohup $REMOTE_DIR/venv/bin/python3 -m uvicorn server.main:app --host 0.0.0.0 --port 80 > server.log 2>&1 &
    
    echo "Deployment complete!"
EOF

echo "Done! Server should be accessible at http://$VM_IP"
rm -f deploy.zip
