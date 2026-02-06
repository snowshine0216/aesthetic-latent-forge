## IP
43.134.31.178 

### Step 1. Create a new user
```bash
sudo adduser snow
```

### Step 2. Add the user to the sudoers file
```bash
sudo usermod -aG sudo snow
```

### Step 3. Log out and log in as the new user
```bash
su - snow
```

### Step 4. Install the necessary packages
```bash
sudo apt-get update
sudo apt-get install -y xfce4 xfce4-goodies
```

### Step 5. Install XRDP
```bash
sudo apt install xrdp -y
sudo systemctl enable xrdp
sudo systemctl start xrdp
```

### Step 6. Setup the XRDP service
```bash
echo xfce4-session > ~/.xsession
sudo systemctl restart xrdp
```

### Step 7. Install desktop environment
```bash
sudo apt install xubuntu-desktop -y
```

### Step 8. add user with desktop access
```bash
sudo usermod -aG ssl-cert,sudo,adm,audio,video,plugdev snow
```

### Step 9. Restart the XRDP service
```bash
sudo systemctl restart xrdp
```

### Step 10. Open the 3389 port in tencent cloud

## open claw + feishu
- https://memu.bot/tutorial/feishu