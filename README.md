# ASUS Power Plan Applet

A simple system tray applet for Linux Mint Cinnamon that lets you switch between CPU power limits on ASUS AMD laptops.

## The problem

This laptop (ASUS Vivobook X512DA) uses an **AMD Ryzen processor**. On AMD-based ASUS laptops, the embedded controller (EC) that manages the fan is **locked at the firmware level** — the manufacturer doesn't expose it to the operating system. This means no software tool can read or write the EC registers that control fan speed.

I tried everything:
- **asus-fan-control (AFC)** — failed with `AE_NOT_FOUND` (acpi_call inaccessible)
- **NBFC-linux** with `ec_sys` — EC dump returned all zeros (can't read registers)
- **NBFC-linux** with `dev_port` — same result, EC reads all zeros
- **NBFC-linux** with `acpi_ec` (DKMS module) — same result
- **pwmconfig** — found no PWM-capable sensors

None of these worked because the hardware itself blocks software access to the fan controller. The fan runs on its own firmware-defined curve, which is conservative — it lets the CPU reach 87°C before ramping to ~3900 RPM.

## Why this applet then?

Since I **cannot control the fan directly**, the next best thing is to **reduce the heat it needs to deal with**. By lowering the CPU power limits via RyzenAdj, the CPU generates less heat, which means:

- The fan stays quieter because temperatures stay lower
- The laptop runs cooler overall
- Battery life is slightly improved under load

This applet puts three power limit profiles in the system tray so you can quickly switch between them depending on what you're doing — without opening a terminal.

## What this applet does NOT do

- It does **not** control fan speed directly (the hardware won't allow it)
- It does **not** undervolt the CPU (RyzenAdj can't set voltage offsets on Zen+ mobile)
- It does **not** replace Cinnamon's power management (those control display/suspend, not CPU wattage)

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
