# ASUS Power Plan Applet

A simple system tray applet for Linux Mint Cinnamon that lets you switch between CPU power limits on ASUS AMD laptops.

## Why this exists

After trying to control the fan on an ASUS Vivobook X512DA (AMD Ryzen) running Linux, we found that **the embedded controller is locked at the firmware level** — no software tool (AFC, NBFC-linux, ec_sys, dev_port, acpi_ec) could read/write EC registers. The fan is controlled entirely by firmware with a conservative curve.

Since we couldn't control the fan directly, the alternative was to **reduce heat output** by limiting CPU power draw via RyzenAdj. This applet provides three profiles so you can choose between lower temperatures or higher performance depending on what you're doing.

## Requirements

- Linux Mint (Cinnamon) or similar
- AMD Ryzen mobile CPU (Zen/Zen+)
- Python 3 with GTK 3 bindings

## Installation

```bash
# Install RyzenAdj
sudo apt install cmake build-essential libpci-dev
cd /tmp
git clone https://github.com/FlyGoat/RyzenAdj.git
cd RyzenAdj && mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Release .. && make -j$(nproc)
sudo make install && sudo ldconfig

# Install applet
sudo cp powerplan-applet /usr/local/bin/
sudo chmod +x /usr/local/bin/powerplan-applet

# Allow running ryzenadj without password
echo "$USER ALL=(ALL) NOPASSWD: /usr/local/bin/ryzenadj" | sudo tee /etc/sudoers.d/ryzenadj

# Autostart
mkdir -p ~/.config/autostart
cp powerplan-applet.desktop ~/.config/autostart/

# Optional: systemd service to apply Balanced profile on boot
sudo cp ryzenadj.service /etc/systemd/system/
sudo systemctl enable ryzenadj.service
```

## Usage

Launch it:
```bash
/usr/local/bin/powerplan-applet &
```

It shows a computer icon in the system tray:
- **Left-click**: cycle through Performance → Balanced → Power Saver
- **Right-click**: pick a plan directly

## Power Profiles

| Profile | STAPM | Fast Limit | Slow Limit | Use Case |
|---------|-------|-----------|------------|----------|
| Performance | 15W | 30W | 25W | Gaming, video editing, heavy load |
| Balanced | 12W | 18W | 15W | Daily browsing, office work |
| Power Saver | 8W | 12W | 10W | Low-load tasks, maximizing battery |

## System tray icon not showing?

Restart Cinnamon with **Alt+F2**, type `r`, Enter.
